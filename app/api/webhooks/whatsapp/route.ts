import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { analyzeMessage } from '@/lib/condosync-ai';
import { sendWhatsAppMessage } from '@/lib/whatsapp-client';
import { routeMessage } from '@/lib/message-router';

/**
 * WhatsApp Webhook Endpoint - Receives incoming WhatsApp messages from Twilio
 *
 * Flow:
 * 1. Receive message from Twilio webhook
 * 2. Look up resident and building by phone number
 * 3. Find or create conversation
 * 4. Analyze message with Claude AI
 * 5. Save message to database
 * 6. Create maintenance request if applicable
 * 7. Send AI response to resident
 * 8. Route message to owner/admin if needed
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    // Extract Twilio webhook data
    const from = formData.get('From') as string; // whatsapp:+1787XXXXXXX
    const to = formData.get('To') as string; // whatsapp:+1787XXXXXXX (building number)
    const body = formData.get('Body') as string;
    const messageSid = formData.get('MessageSid') as string;

    console.log('[Webhook] 📥 Incoming WhatsApp message:', {
      from,
      to,
      body: body?.substring(0, 50),
      messageSid,
    });

    if (!from || !to || !body) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Extract phone numbers (remove 'whatsapp:' prefix)
    const phoneNumber = from.replace('whatsapp:', '');
    const buildingNumber = to.replace('whatsapp:', '');

    const supabase = await createClient();

    // 1. Find building by WhatsApp number
    const { data: building, error: buildingError } = await supabase
      .from('buildings')
      .select('*')
      .eq('whatsapp_business_number', buildingNumber)
      .single();

    if (buildingError || !building) {
      console.error('[Webhook] ❌ Building not found:', buildingNumber);
      return NextResponse.json(
        { error: 'Building not found' },
        { status: 404 }
      );
    }

    console.log('[Webhook] ✅ Building found:', building.name);

    // 2. Find resident by phone or WhatsApp number
    const { data: resident, error: residentError } = await supabase
      .from('residents')
      .select('*, units(*)')
      .eq('building_id', building.id)
      .or(`phone.eq.${phoneNumber},whatsapp_number.eq.${phoneNumber}`)
      .single();

    if (residentError || !resident) {
      console.error('[Webhook] ❌ Resident not found:', phoneNumber);

      // Send unknown resident message
      await sendWhatsAppMessage(
        phoneNumber,
        buildingNumber,
        'Lo siento, no te reconozco en nuestro sistema. Por favor contacta a la administración del edificio.'
      );

      return NextResponse.json({ success: true, message: 'Unknown resident' });
    }

    console.log('[Webhook] ✅ Resident found:', `${resident.first_name} ${resident.last_name}`);

    // 3. Find or create conversation
    let { data: conversation, error: conversationError } = await supabase
      .from('conversations')
      .select('*')
      .eq('building_id', building.id)
      .eq('resident_id', resident.id)
      .eq('channel', 'whatsapp')
      .eq('status', 'active')
      .maybeSingle();

    if (!conversation) {
      const { data: newConversation, error: createError } = await supabase
        .from('conversations')
        .insert({
          building_id: building.id,
          resident_id: resident.id,
          channel: 'whatsapp',
          status: 'active',
        })
        .select()
        .single();

      if (createError) {
        console.error('[Webhook] ❌ Failed to create conversation:', createError);
        throw createError;
      }

      conversation = newConversation;
      console.log('[Webhook] ✅ Created new conversation:', conversation.id);
    } else {
      console.log('[Webhook] ✅ Using existing conversation:', conversation.id);
    }

    // 4. Analyze message with AI
    console.log('[Webhook] 🤖 Analyzing message with Claude AI...');
    const analysis = await analyzeMessage(
      body,
      resident.type,
      resident.preferred_language || 'es',
      building.name
    );

    console.log('[Webhook] ✅ AI Analysis:', {
      intent: analysis.intent,
      priority: analysis.priority,
      routeTo: analysis.routeTo,
      requiresHumanReview: analysis.requiresHumanReview,
    });

    // 5. Save incoming message to database
    const { error: messageError } = await supabase.from('messages').insert({
      conversation_id: conversation.id,
      sender_type: 'resident',
      sender_id: resident.id,
      content: body,
      intent: analysis.intent,
      ai_response: analysis.suggestedResponse,
      channel: 'whatsapp',
      routed_to: analysis.routeTo,
      metadata: { whatsapp_sid: messageSid },
    });

    if (messageError) {
      console.error('[Webhook] ❌ Failed to save message:', messageError);
    } else {
      console.log('[Webhook] ✅ Message saved to database');
    }

    // 6. Create maintenance request if AI detected one
    if (analysis.intent === 'maintenance_request') {
      const { error: maintenanceError } = await supabase
        .from('maintenance_requests')
        .insert({
          building_id: building.id,
          unit_id: resident.unit_id,
          resident_id: resident.id,
          title: analysis.extractedData?.maintenanceCategory || 'Solicitud de Mantenimiento',
          description: body,
          category: analysis.extractedData?.maintenanceCategory,
          priority: analysis.priority,
          extracted_by_ai: true,
          conversation_id: conversation.id,
        });

      if (maintenanceError) {
        console.error('[Webhook] ❌ Failed to create maintenance request:', maintenanceError);
      } else {
        console.log('[Webhook] ✅ Maintenance request created');
      }
    }

    // 7. Send AI response to resident (if not requiring human review)
    if (!analysis.requiresHumanReview) {
      try {
        await sendWhatsAppMessage(
          phoneNumber,
          buildingNumber,
          analysis.suggestedResponse
        );

        // Save AI response to database
        await supabase.from('messages').insert({
          conversation_id: conversation.id,
          sender_type: 'ai',
          content: analysis.suggestedResponse,
          channel: 'whatsapp',
        });

        console.log('[Webhook] ✅ AI response sent to resident');
      } catch (error) {
        console.error('[Webhook] ❌ Failed to send AI response:', error);
      }
    } else {
      console.log('[Webhook] ⚠️ Message requires human review - no auto-response sent');
    }

    // 8. Route message to owner/admin if needed
    try {
      await routeMessage(analysis, resident.id, building.id, body);
      console.log('[Webhook] ✅ Message routing complete');
    } catch (error) {
      console.error('[Webhook] ❌ Message routing failed:', error);
    }

    // Update conversation last_message_at
    await supabase
      .from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', conversation.id);

    return NextResponse.json({
      success: true,
      conversationId: conversation.id,
      intent: analysis.intent,
      requiresHumanReview: analysis.requiresHumanReview,
    });
  } catch (error) {
    console.error('[Webhook] ❌ Unhandled error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}

// Twilio requires 200 OK response for webhook validation
export async function GET(req: NextRequest) {
  return NextResponse.json({ status: 'WhatsApp webhook is active' });
}
