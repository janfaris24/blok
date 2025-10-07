import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { sendWhatsAppMessage } from '@/lib/whatsapp-client';

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

    // Verify conversation exists
    const { data: conversation } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .eq('building_id', buildingId)
      .eq('resident_id', residentId)
      .single();

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Save message to database (with sender_type = 'admin')
    const { data: savedMessage, error: saveError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_type: 'admin',
        sender_id: user.id,
        content: message,
        channel: conversation.channel,
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

    // Send WhatsApp message if resident is opted in
    if (conversation.channel === 'whatsapp' && resident.opted_in_whatsapp) {
      const recipientNumber = resident.whatsapp_number || resident.phone;

      try {
        await sendWhatsAppMessage(
          recipientNumber,
          building.whatsapp_business_number,
          message
        );
      } catch (whatsappError) {
        console.error('WhatsApp send error:', whatsappError);
        // Don't fail the request - message is saved in DB
        return NextResponse.json({
          success: true,
          message: savedMessage,
          warning: 'Message saved but WhatsApp delivery failed'
        });
      }
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
