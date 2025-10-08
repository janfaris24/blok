import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { sendBulkWhatsApp } from '@/lib/whatsapp-client';
import type { BroadcastRecipient } from '@/types/blok';

/**
 * Send a broadcast to recipients
 *
 * POST /api/broadcasts/send
 * Body: {
 *   broadcastId: string;
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const { broadcastId } = await request.json();

    if (!broadcastId) {
      return NextResponse.json(
        { error: 'Missing broadcastId' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Verify user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get broadcast
    const { data: broadcast, error: broadcastError } = await supabase
      .from('broadcasts')
      .select('*')
      .eq('id', broadcastId)
      .single();

    if (broadcastError || !broadcast) {
      return NextResponse.json({ error: 'Broadcast not found' }, { status: 404 });
    }

    // Verify building ownership
    const { data: building, error: buildingError } = await supabase
      .from('buildings')
      .select('*')
      .eq('id', broadcast.building_id)
      .eq('admin_user_id', user.id)
      .single();

    if (buildingError || !building) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Check if already sent
    if (broadcast.status === 'sent') {
      return NextResponse.json(
        { error: 'Broadcast already sent' },
        { status: 400 }
      );
    }

    // Update status to sending
    await supabase
      .from('broadcasts')
      .update({ status: 'sending' })
      .eq('id', broadcastId);

    console.log('[Broadcast] 📡 Starting send:', broadcastId);

    // Get recipients based on target audience
    let query = supabase
      .from('residents')
      .select('id, first_name, last_name, phone, whatsapp_number, opted_in_whatsapp, opted_in_email, opted_in_sms')
      .eq('building_id', broadcast.building_id);

    if (broadcast.target_audience === 'owners') {
      query = query.eq('type', 'owner');
    } else if (broadcast.target_audience === 'renters') {
      query = query.eq('type', 'renter');
    } else if (broadcast.target_audience === 'specific_units') {
      query = query.in('unit_id', broadcast.specific_unit_ids);
    }

    const { data: residents, error: residentsError } = await query;

    if (residentsError || !residents) {
      console.error('[Broadcast] Failed to fetch recipients:', residentsError);

      await supabase
        .from('broadcasts')
        .update({ status: 'failed' })
        .eq('id', broadcastId);

      return NextResponse.json(
        { error: 'Failed to fetch recipients' },
        { status: 500 }
      );
    }

    console.log('[Broadcast] 👥 Recipients found:', residents.length);

    let totalSent = 0;
    let totalFailed = 0;
    const errors: string[] = [];

    // Send via WhatsApp
    if (broadcast.send_via_whatsapp) {
      const whatsappRecipients: BroadcastRecipient[] = residents
        .filter((r) => r.opted_in_whatsapp && (r.whatsapp_number || r.phone))
        .map((r) => ({
          phone: r.whatsapp_number || r.phone,
          message: `📢 *${broadcast.subject}*\n\n${broadcast.message}\n\n_${building.name}_`,
          residentId: r.id,
          residentName: `${r.first_name} ${r.last_name}`,
        }));

      console.log('[Broadcast] 📱 WhatsApp recipients:', whatsappRecipients.length);

      if (whatsappRecipients.length > 0) {
        try {
          const result = await sendBulkWhatsApp(
            whatsappRecipients.map(r => ({ phone: r.phone, message: r.message })),
            building.whatsapp_business_number
          );

          totalSent += result.success;
          totalFailed += result.failed;
          errors.push(...result.errors);

          console.log('[Broadcast] ✅ WhatsApp sent:', result.success, 'failed:', result.failed);
        } catch (error) {
          console.error('[Broadcast] WhatsApp send error:', error);
          totalFailed += whatsappRecipients.length;
          errors.push(`WhatsApp bulk send failed: ${error}`);
        }
      }
    }

    // Send via Email (if implemented)
    if (broadcast.send_via_email) {
      // TODO: Implement email sending
      console.log('[Broadcast] ⚠️ Email sending not yet implemented');
    }

    // Send via SMS (if implemented)
    if (broadcast.send_via_sms) {
      // TODO: Implement SMS sending
      console.log('[Broadcast] ⚠️ SMS sending not yet implemented');
    }

    // Update broadcast status
    const finalStatus = totalFailed === 0 && totalSent > 0 ? 'sent' :
                       totalSent === 0 ? 'failed' : 'sent';

    await supabase
      .from('broadcasts')
      .update({
        status: finalStatus,
        sent_count: totalSent,
        failed_count: totalFailed,
        sent_at: new Date().toISOString(),
      })
      .eq('id', broadcastId);

    console.log('[Broadcast] ✅ Complete:', {
      sent: totalSent,
      failed: totalFailed,
      status: finalStatus,
    });

    return NextResponse.json({
      success: true,
      sent: totalSent,
      failed: totalFailed,
      errors: errors.length > 0 ? errors : undefined,
    });

  } catch (error) {
    console.error('[Broadcast] Send error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
