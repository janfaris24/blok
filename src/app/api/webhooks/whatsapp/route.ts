import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { analyzeMessage } from '@/lib/blok-ai';
import { sendWhatsAppMessage } from '@/lib/whatsapp-client';
import { routeMessage } from '@/lib/message-router';
import type { WhatsAppWebhookPayload } from '@/types/blok';

/**
 * WhatsApp Webhook - Receives incoming messages from Twilio
 *
 * Flow:
 * 1. Validate incoming request
 * 2. Look up resident by phone number
 * 3. Get or create conversation
 * 4. Analyze message with AI
 * 5. Save message to database
 * 6. Create maintenance request if needed
 * 7. Route message to relevant parties
 * 8. Send AI response back to resident
 * 9. Create notification for admin if human review needed
 */
export async function POST(request: NextRequest) {
  console.log('📱 [WhatsApp Webhook] Received incoming message');

  try {
    // Parse form data from Twilio
    const formData = await request.formData();
    const payload: WhatsAppWebhookPayload = {
      MessageSid: formData.get('MessageSid') as string,
      From: formData.get('From') as string,
      To: formData.get('To') as string,
      Body: formData.get('Body') as string,
      NumMedia: formData.get('NumMedia') as string | undefined,
      MediaUrl0: formData.get('MediaUrl0') as string | undefined,
      MediaContentType0: formData.get('MediaContentType0') as string | undefined,
    };

    console.log('[WhatsApp] Payload:', {
      from: payload.From,
      to: payload.To,
      message: payload.Body?.substring(0, 50),
    });

    // Validate required fields
    if (!payload.From || !payload.To || !payload.Body) {
      console.error('[WhatsApp] Missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Extract phone numbers (remove "whatsapp:" prefix)
    const residentPhone = payload.From.replace('whatsapp:', '');
    const businessPhone = payload.To.replace('whatsapp:', '');

    console.log('[WhatsApp] Phone numbers:', { residentPhone, businessPhone });

    // Get Supabase client
    const supabase = await createClient();

    // 1. Find building by WhatsApp business number
    const { data: building, error: buildingError } = await supabase
      .from('buildings')
      .select('*')
      .eq('whatsapp_business_number', businessPhone)
      .single();

    if (buildingError || !building) {
      console.error('[WhatsApp] Building not found:', businessPhone);
      return NextResponse.json(
        { error: 'Building not found' },
        { status: 404 }
      );
    }

    console.log('[WhatsApp] Building found:', building.name);

    // 2. Find resident by phone number
    const { data: resident, error: residentError } = await supabase
      .from('residents')
      .select('*, units!residents_unit_id_fkey(*)')
      .eq('building_id', building.id)
      .or(`phone.eq.${residentPhone},whatsapp_number.eq.${residentPhone}`)
      .single();

    if (residentError || !resident) {
      console.error('[WhatsApp] Resident not found:', residentPhone);

      // Send friendly message to unknown number
      await sendWhatsAppMessage(
        residentPhone,
        businessPhone,
        building.name === 'es'
          ? `Hola! No reconocemos tu número en nuestro sistema. Por favor contacta a la administración de ${building.name}.`
          : `Hello! We don't recognize your number in our system. Please contact the administration of ${building.name}.`
      );

      return NextResponse.json(
        { error: 'Resident not found', message: 'Notification sent' },
        { status: 404 }
      );
    }

    console.log('[WhatsApp] Resident found:', {
      name: `${resident.first_name} ${resident.last_name}`,
      type: resident.type,
      language: resident.preferred_language,
    });

    // 3. Get or create conversation
    let { data: conversation } = await supabase
      .from('conversations')
      .select('*')
      .eq('building_id', building.id)
      .eq('resident_id', resident.id)
      .eq('status', 'active')
      .single();

    if (!conversation) {
      console.log('[WhatsApp] Creating new conversation');

      const { data: newConversation, error: convError } = await supabase
        .from('conversations')
        .insert({
          building_id: building.id,
          resident_id: resident.id,
          status: 'active',
          last_message_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (convError || !newConversation) {
        console.error('[WhatsApp] Failed to create conversation:', convError);
        throw new Error('Failed to create conversation');
      }

      conversation = newConversation;
    } else {
      // Update last_message_at
      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', conversation.id);
    }

    console.log('[WhatsApp] Conversation ID:', conversation.id);

    // 4. Analyze message with AI (with knowledge base lookup)
    console.log('[WhatsApp] Analyzing message with AI...');
    const analysis = await analyzeMessage(
      payload.Body,
      resident.type,
      resident.preferred_language || 'es',
      building.name,
      building.id
    );

    console.log('[WhatsApp] AI Analysis:', {
      intent: analysis.intent,
      priority: analysis.priority,
      routeTo: analysis.routeTo,
      requiresHumanReview: analysis.requiresHumanReview,
    });

    // 5. Save resident's message to database
    const { error: messageError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversation.id,
        sender_type: 'resident',
        content: payload.Body,
        intent: analysis.intent,
        priority: analysis.priority,
        routing: analysis.routeTo,
        requires_human_review: analysis.requiresHumanReview,
      });

    if (messageError) {
      console.error('[WhatsApp] Failed to save message:', messageError);
    }

    // 6. Create maintenance request if needed
    if (analysis.intent === 'maintenance_request') {
      console.log('[WhatsApp] Creating maintenance request...');

      const { error: maintenanceError } = await supabase
        .from('maintenance_requests')
        .insert({
          building_id: building.id,
          resident_id: resident.id,
          conversation_id: conversation.id,
          status: 'open',
          priority: analysis.priority,
          category: analysis.extractedData?.maintenanceCategory || 'general',
          description: payload.Body,
          location: analysis.extractedData?.location || null,
          reported_at: new Date().toISOString(),
        });

      if (maintenanceError) {
        console.error('[WhatsApp] Failed to create maintenance request:', maintenanceError);
      } else {
        console.log('[WhatsApp] ✅ Maintenance request created');
      }
    }

    // 7. Route message to relevant parties (owner/renter/both)
    if (analysis.routeTo !== 'admin') {
      console.log('[WhatsApp] Routing message to:', analysis.routeTo);
      await routeMessage(analysis, resident.id, building.id, payload.Body);
    }

    // 8. Send AI response back to resident (unless requires human review AND priority is high/emergency)
    const shouldSendAutoResponse =
      !analysis.requiresHumanReview ||
      (analysis.priority !== 'high' && analysis.priority !== 'emergency');

    if (shouldSendAutoResponse && analysis.suggestedResponse) {
      console.log('[WhatsApp] Sending AI response to resident...');

      try {
        await sendWhatsAppMessage(
          residentPhone,
          businessPhone,
          analysis.suggestedResponse
        );

        // Save AI response to database
        await supabase
          .from('messages')
          .insert({
            conversation_id: conversation.id,
            sender_type: 'ai',
            content: analysis.suggestedResponse,
            intent: null,
            priority: null,
            routing: null,
            requires_human_review: false,
          });

        console.log('[WhatsApp] ✅ AI response sent');
      } catch (error) {
        console.error('[WhatsApp] Failed to send AI response:', error);
      }
    } else {
      console.log('[WhatsApp] ⚠️ Skipping auto-response - requires human review');
    }

    // 9. Notification is automatically created by database trigger
    console.log('[WhatsApp] Notification will be created automatically by trigger');

    console.log('[WhatsApp] ✅ Message processed successfully');

    // Return 200 to Twilio
    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error('[WhatsApp] ❌ Error processing webhook:', error);

    // Still return 200 to Twilio to avoid retries
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 200 }
    );
  }
}

/**
 * GET endpoint for webhook verification (Twilio requirement)
 */
export async function GET() {
  console.log('[WhatsApp] GET request received');
  return NextResponse.json({ status: 'ok' }, { status: 200 });
}
