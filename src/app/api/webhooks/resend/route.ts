import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

/**
 * Resend Webhook Handler
 *
 * Handles email events from Resend:
 * - email.sent - Email was sent successfully
 * - email.delivered - Email was delivered to recipient's inbox
 * - email.delivery_delayed - Email delivery was delayed
 * - email.bounced - Email bounced
 * - email.opened - Email was opened by recipient
 * - email.clicked - Link in email was clicked
 *
 * POST /api/webhooks/resend
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const event = body.type;
    const data = body.data;

    console.log('[Resend Webhook] 📧 Event received:', event);
    console.log('[Resend Webhook] 🏷️ Tags:', JSON.stringify(data.tags));

    // Verify webhook signature (optional but recommended for production)
    const signature = request.headers.get('svix-signature');
    // TODO: Implement signature verification with Resend webhook secret

    const supabase = await createClient();

    // Extract broadcast_id from tags if present
    // Resend tags can be an array or an object
    let broadcastId = null;
    if (data.tags) {
      if (Array.isArray(data.tags)) {
        const tag = data.tags.find((tag: any) => tag.name === 'broadcast_id');
        broadcastId = tag?.value || null;
      } else if (typeof data.tags === 'object') {
        broadcastId = data.tags.broadcast_id || null;
      }
    }
    console.log('[Resend Webhook] 🆔 Extracted broadcast_id:', broadcastId);

    // Store email event in database
    const { error: insertError } = await supabase
      .from('email_events')
      .insert({
        email_id: data.email_id,
        event_type: event,
        recipient_email: data.to?.[0] || data.to,
        subject: data.subject,
        event_data: data,
        broadcast_id: broadcastId,
        created_at: data.created_at || new Date().toISOString(),
      });

    if (insertError) {
      console.error('[Resend Webhook] ❌ Failed to insert event:', insertError);
    }

    // Handle specific events
    switch (event) {
      case 'email.sent':
        console.log('[Resend Webhook] ✅ Email sent:', data.email_id);
        break;

      case 'email.delivered':
        console.log('[Resend Webhook] 📬 Email delivered:', data.email_id);
        // Update broadcast stats if this is from a broadcast
        await updateBroadcastDeliveryStats(supabase, data.email_id, 'delivered');
        break;

      case 'email.opened':
        console.log('[Resend Webhook] 👀 Email opened:', data.email_id, 'by', data.to);
        // Track email open
        await trackEmailOpen(supabase, data.email_id, data.to);
        break;

      case 'email.clicked':
        console.log('[Resend Webhook] 🖱️ Email clicked:', data.email_id);
        await trackEmailClick(supabase, data.email_id, data.to, data.link);
        break;

      case 'email.bounced':
        console.log('[Resend Webhook] ⚠️ Email bounced:', data.email_id);
        await updateBroadcastDeliveryStats(supabase, data.email_id, 'bounced');
        break;

      case 'email.delivery_delayed':
        console.log('[Resend Webhook] ⏳ Email delivery delayed:', data.email_id);
        break;

      default:
        console.log('[Resend Webhook] Unknown event type:', event);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('[Resend Webhook] Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

/**
 * Track email open event
 */
async function trackEmailOpen(supabase: any, emailId: string, recipientEmail: string) {
  const { error } = await supabase
    .from('email_events')
    .update({
      opened_at: new Date().toISOString(),
      opened: true,
    })
    .eq('email_id', emailId)
    .eq('recipient_email', recipientEmail);

  if (error) {
    console.error('[Resend Webhook] Failed to track email open:', error);
  }
}

/**
 * Track email click event
 */
async function trackEmailClick(
  supabase: any,
  emailId: string,
  recipientEmail: string,
  link: string
) {
  const { error } = await supabase
    .from('email_events')
    .update({
      clicked_at: new Date().toISOString(),
      clicked: true,
      clicked_link: link,
    })
    .eq('email_id', emailId)
    .eq('recipient_email', recipientEmail);

  if (error) {
    console.error('[Resend Webhook] Failed to track email click:', error);
  }
}

/**
 * Update broadcast delivery statistics
 */
async function updateBroadcastDeliveryStats(
  supabase: any,
  emailId: string,
  status: 'delivered' | 'bounced'
) {
  // Find if this email is part of a broadcast
  // You might need to store broadcast_id when sending emails
  // For now, this is a placeholder for future enhancement
  console.log('[Resend Webhook] Update broadcast stats for email:', emailId, 'status:', status);
}
