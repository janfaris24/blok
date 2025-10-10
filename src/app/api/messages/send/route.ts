import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { sendMessage } from '@/lib/messaging-client';

export async function POST(request: NextRequest) {
  try {
    const { conversationId, residentId, message, buildingId } = await request.json();

    // Validate input
    if (!conversationId || !residentId || !message || !buildingId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Verify user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get building info (verify user owns this building)
    const { data: building, error: buildingError } = await supabase
      .from('buildings')
      .select('*')
      .eq('id', buildingId)
      .eq('admin_user_id', user.id)
      .single();

    if (buildingError || !building) {
      return NextResponse.json({ error: 'Building not found' }, { status: 404 });
    }

    // Get resident info
    const { data: resident, error: residentError } = await supabase
      .from('residents')
      .select('*')
      .eq('id', residentId)
      .eq('building_id', buildingId)
      .single();

    if (residentError || !resident) {
      return NextResponse.json({ error: 'Resident not found' }, { status: 404 });
    }

    // Verify conversation exists and get channel
    const { data: conversation } = await supabase
      .from('conversations')
      .select('*, channel')
      .eq('id', conversationId)
      .eq('building_id', buildingId)
      .eq('resident_id', residentId)
      .single();

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    const channel = conversation.channel || 'whatsapp'; // Default to whatsapp for legacy conversations

    // Save message to database (with sender_type = 'admin')
    const { data: savedMessage, error: saveError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_type: 'admin',
        content: message,
        channel: channel,
        intent: null,
        priority: null,
        routing: null,
        requires_human_review: false,
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving message:', saveError);
      return NextResponse.json(
        { error: 'Failed to save message' },
        { status: 500 }
      );
    }

    // Send message via appropriate channel if resident is opted in
    const isOptedIn = channel === 'whatsapp' ? resident.opted_in_whatsapp : resident.opted_in_sms;

    if (isOptedIn) {
      const recipientNumber = channel === 'whatsapp'
        ? (resident.whatsapp_number || resident.phone)
        : resident.phone;

      const businessNumber = channel === 'whatsapp'
        ? building.whatsapp_business_number
        : (building.sms_number || building.whatsapp_business_number);

      try {
        await sendMessage(
          recipientNumber,
          businessNumber,
          message,
          channel
        );

        console.log(`[Message API] ✅ ${channel.toUpperCase()} message sent to ${recipientNumber}`);
      } catch (sendError) {
        console.error(`[Message API] ${channel.toUpperCase()} send error:`, sendError);
        // Don't fail the request - message is saved in DB
        return NextResponse.json({
          success: true,
          message: savedMessage,
          warning: `Message saved but ${channel} delivery failed`
        });
      }
    } else {
      console.log(`[Message API] ⚠️ Resident not opted in to ${channel}`);
    }

    // Update conversation last_message_at
    await supabase
      .from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', conversationId);

    return NextResponse.json({
      success: true,
      message: savedMessage,
    });

  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
