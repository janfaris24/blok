import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { analyzeMessage } from '@/lib/blok-ai';
import { sendMessage, detectChannelFromPayload, extractPhoneNumber } from '@/lib/messaging-client';
import { routeMessage } from '@/lib/message-router';
import { notifyBuildingAdmins } from '@/lib/notification-service';
import type { TwilioWebhookPayload, Channel } from '@/types/blok';

/**
 * Unified Messaging Webhook - Receives incoming messages from Twilio (WhatsApp & SMS)
 *
 * Flow:
 * 1. Detect channel (WhatsApp or SMS) from payload
 * 2. Validate incoming request
 * 3. Look up resident by phone number
 * 4. Get or create conversation with channel info
 * 5. Analyze message with AI
 * 6. Save message to database with channel
 * 7. Create maintenance request if needed
 * 8. Route message to relevant parties
 * 9. Send AI response back to resident via same channel
 * 10. Create notification for admin if human review needed
 */
export async function POST(request: NextRequest) {
  console.log('📱 [Messaging Webhook] Received incoming message');

  try {
    // Parse form data from Twilio
    const formData = await request.formData();
    const payload: TwilioWebhookPayload = {
      MessageSid: formData.get('MessageSid') as string,
      From: formData.get('From') as string,
      To: formData.get('To') as string,
      Body: formData.get('Body') as string,
      NumMedia: formData.get('NumMedia') as string | undefined,
      MediaUrl0: formData.get('MediaUrl0') as string | undefined,
      MediaContentType0: formData.get('MediaContentType0') as string | undefined,
    };

    // 1. Detect channel (WhatsApp or SMS)
    const channel: Channel = detectChannelFromPayload(payload.From);
    const channelLabel = channel.toUpperCase();

    console.log(`[${channelLabel}] Payload:`, {
      channel,
      from: payload.From,
      to: payload.To,
      message: payload.Body?.substring(0, 50),
    });

    // Validate required fields
    if (!payload.From || !payload.To || !payload.Body) {
      console.error(`[${channelLabel}] Missing required fields`);
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 2. Extract phone numbers (remove "whatsapp:" prefix if present)
    const residentPhone = extractPhoneNumber(payload.From);
    const businessPhone = extractPhoneNumber(payload.To);

    console.log(`[${channelLabel}] Phone numbers:`, { residentPhone, businessPhone });

    // Get Supabase client
    const supabase = await createClient();

    // 3. Find building by phone number (check both WhatsApp and SMS fields)
    const { data: building, error: buildingError } = await supabase
      .from('buildings')
      .select('*')
      .or(`whatsapp_business_number.eq.${businessPhone},sms_number.eq.${businessPhone}`)
      .single();

    if (buildingError || !building) {
      console.error(`[${channelLabel}] Building not found:`, businessPhone);
      return NextResponse.json(
        { error: 'Building not found' },
        { status: 404 }
      );
    }

    console.log(`[${channelLabel}] Building found:`, building.name);

    // 4. Find resident by phone number
    const { data: resident, error: residentError} = await supabase
      .from('residents')
      .select('*, units(*)')
      .eq('building_id', building.id)
      .or(`phone.eq.${residentPhone},whatsapp_number.eq.${residentPhone}`)
      .single();

    if (residentError || !resident) {
      console.error(`[${channelLabel}] Resident not found:`, residentPhone);

      // Send friendly message to unknown number via same channel
      const unknownNumberMessage = resident?.preferred_language === 'en'
        ? `Hello! We don't recognize your number in our system. Please contact the administration of ${building.name}.`
        : `Hola! No reconocemos tu número en nuestro sistema. Por favor contacta a la administración de ${building.name}.`;

      await sendMessage(
        residentPhone,
        businessPhone,
        unknownNumberMessage,
        channel
      );

      return NextResponse.json(
        { error: 'Resident not found', message: 'Notification sent' },
        { status: 404 }
      );
    }

    console.log(`[${channelLabel}] Resident found:`, {
      name: `${resident.first_name} ${resident.last_name}`,
      type: resident.type,
      language: resident.preferred_language,
      optedIn: channel === 'whatsapp' ? resident.opted_in_whatsapp : resident.opted_in_sms,
    });

    // Check if resident has opted in to this channel
    const hasOptedIn = channel === 'whatsapp' ? resident.opted_in_whatsapp : resident.opted_in_sms;
    if (!hasOptedIn) {
      console.warn(`[${channelLabel}] ⚠️ Resident has not opted in to ${channel}`);
      // We'll still process the message but log the warning
    }

    // 5. Get or create conversation with channel tracking
    let { data: conversation } = await supabase
      .from('conversations')
      .select('*')
      .eq('building_id', building.id)
      .eq('resident_id', resident.id)
      .eq('channel', channel)
      .eq('status', 'active')
      .single();

    if (!conversation) {
      console.log(`[${channelLabel}] Creating new conversation for ${channel}`);

      const { data: newConversation, error: convError } = await supabase
        .from('conversations')
        .insert({
          building_id: building.id,
          resident_id: resident.id,
          channel: channel,
          status: 'active',
          last_message_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (convError || !newConversation) {
        console.error(`[${channelLabel}] Failed to create conversation:`, convError);
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

    console.log(`[${channelLabel}] Conversation ID:`, conversation.id);

    // 6. Analyze message with AI (with knowledge base lookup)
    console.log(`[${channelLabel}] Analyzing message with AI...`);
    const analysis = await analyzeMessage(
      payload.Body,
      resident.type,
      resident.preferred_language || 'es',
      building.name,
      building.id
    );

    console.log(`[${channelLabel}] AI Analysis:`, {
      intent: analysis.intent,
      priority: analysis.priority,
      routeTo: analysis.routeTo,
      requiresHumanReview: analysis.requiresHumanReview,
    });

    // 7. Save resident's message to database with channel info
    const { error: messageError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversation.id,
        sender_type: 'resident',
        content: payload.Body,
        channel: channel,
        intent: analysis.intent,
        priority: analysis.priority,
        routing: analysis.routeTo,
        requires_human_review: analysis.requiresHumanReview,
      });

    if (messageError) {
      console.error(`[${channelLabel}] Failed to save message:`, messageError);
    }

    // 8. Create maintenance request if needed
    if (analysis.intent === 'maintenance_request') {
      console.log(`[${channelLabel}] Creating maintenance request...`);

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
        console.error(`[${channelLabel}] Failed to create maintenance request:`, maintenanceError);
      } else {
        console.log(`[${channelLabel}] ✅ Maintenance request created`);
      }
    }

    // 9. Route message to relevant parties (owner/renter/both)
    if (analysis.routeTo !== 'admin') {
      console.log(`[${channelLabel}] Routing message to:`, analysis.routeTo);
      await routeMessage(analysis, resident.id, building.id, payload.Body);
    }

    // 9.5. Send urgent notifications to building admins if needed
    const isUrgent =
      (analysis.priority === 'emergency' || analysis.priority === 'high') &&
      analysis.requiresHumanReview;

    if (isUrgent || analysis.priority === 'emergency') {
      console.log(`[${channelLabel}] 🚨 Triggering urgent admin notifications...`);

      const unitInfo = resident.units?.unit_number || undefined;

      await notifyBuildingAdmins({
        buildingId: building.id,
        priority: analysis.priority,
        type: analysis.intent === 'maintenance_request' ? 'maintenance_request' : 'new_message',
        residentName: `${resident.first_name} ${resident.last_name}`,
        residentUnit: unitInfo,
        messageContent: payload.Body,
        conversationId: conversation.id,
        dashboardLink: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/conversations?conversation=${conversation.id}`,
      });
    }

    // 10. Send AI response back to resident via same channel
    const shouldSendAutoResponse =
      !analysis.requiresHumanReview ||
      (analysis.priority !== 'high' && analysis.priority !== 'emergency');

    if (shouldSendAutoResponse && analysis.suggestedResponse) {
      console.log(`[${channelLabel}] Sending AI response to resident...`);

      try {
        await sendMessage(
          residentPhone,
          businessPhone,
          analysis.suggestedResponse,
          channel
        );

        // Save AI response to database with channel
        await supabase
          .from('messages')
          .insert({
            conversation_id: conversation.id,
            sender_type: 'ai',
            content: analysis.suggestedResponse,
            channel: channel,
            intent: null,
            priority: null,
            routing: null,
            requires_human_review: false,
          });

        console.log(`[${channelLabel}] ✅ AI response sent via ${channel}`);
      } catch (error) {
        console.error(`[${channelLabel}] Failed to send AI response:`, error);
      }
    } else {
      console.log(`[${channelLabel}] ⚠️ Skipping auto-response - requires human review`);
    }

    // 11. Create notification for admin for all new messages
    console.log(`[${channelLabel}] Creating notification for admin...`);

    const notificationTitle = analysis.requiresHumanReview
      ? `Mensaje requiere revisión (${analysis.priority})`
      : `Nuevo Mensaje (${channelLabel})`;

    await supabase
      .from('notifications')
      .insert({
        building_id: building.id,
        type: 'new_message',
        title: notificationTitle,
        message: `${resident.first_name} ${resident.last_name}: ${payload.Body.substring(0, 100)}`,
        link: `/dashboard/conversations?conversation=${conversation.id}`,
        read: false,
      });

    console.log(`[${channelLabel}] ✅ Admin notification created`);
    console.log(`[${channelLabel}] ✅ Message processed successfully`);

    // Return 200 to Twilio
    return NextResponse.json({ success: true, channel }, { status: 200 });

  } catch (error) {
    console.error('[Messaging] ❌ Error processing webhook:', error);

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
export async function GET(request: NextRequest) {
  console.log('[Messaging] GET request received');
  return NextResponse.json({ status: 'ok' }, { status: 200 });
}
