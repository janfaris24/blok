import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const { conversationId, additionalMessage } = await request.json();

    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get building info
    const { data: building } = await supabase
      .from('buildings')
      .select('id, name')
      .eq('admin_user_id', user.id)
      .single();

    if (!building) {
      return NextResponse.json(
        { error: 'Building not found' },
        { status: 404 }
      );
    }

    // Get conversation messages if conversationId provided
    let conversationContext = '';
    if (conversationId) {
      const { data: messages } = await supabase
        .from('support_chat_messages')
        .select('role, content, created_at')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
        .limit(20);

      if (messages && messages.length > 0) {
        conversationContext = messages
          .map(
            (msg) =>
              `[${msg.role.toUpperCase()}] ${new Date(msg.created_at).toLocaleString()}:\n${msg.content}`
          )
          .join('\n\n---\n\n');
      }
    }

    // Send email to support
    await resend.emails.send({
      from: 'Blok Support <support@blokpr.co>',
      to: 'janfaris@blokpr.co',
      replyTo: user.email || undefined,
      subject: `🆘 Support Request - ${building.name}`,
      text: `Support request from Blok chatbot:

Building: ${building.name}
User: ${user.email || 'N/A'}
User ID: ${user.id}

${additionalMessage ? `Additional Message:\n${additionalMessage}\n\n` : ''}

${conversationContext ? `Recent Conversation:\n\n${conversationContext}` : 'No conversation context available.'}

---
This email was sent from the Blok support chatbot.`,
    });

    console.log('[Contact Support] Email sent successfully');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Contact Support] Error:', error);
    return NextResponse.json(
      { error: 'Failed to send support request' },
      { status: 500 }
    );
  }
}
