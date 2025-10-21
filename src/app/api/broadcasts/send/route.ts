import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { sendBulkWhatsApp, sendBulkSMS, sendBulkEmail } from '@/lib/messaging-client';

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
      .select('id, first_name, last_name, email, phone, whatsapp_number, opted_in_whatsapp, opted_in_email, opted_in_sms')
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
      const whatsappRecipients = residents
        .filter((r) => r.opted_in_whatsapp && (r.whatsapp_number || r.phone))
        .map((r) => ({
          phone: r.whatsapp_number || r.phone,
          message: `📢 *${broadcast.subject}*\n\n${broadcast.message}\n\n_${building.name}_`,
          id: r.id,
          name: `${r.first_name} ${r.last_name}`,
        }));

      console.log('[Broadcast] 📱 WhatsApp recipients:', whatsappRecipients.length);

      if (whatsappRecipients.length > 0) {
        try {
          const result = await sendBulkWhatsApp(
            whatsappRecipients.map(r => ({ phone: r.phone, message: r.message })),
            building.whatsapp_business_number,
            broadcast.media_urls && broadcast.media_urls.length > 0 ? broadcast.media_urls : undefined
          );

          totalSent += result.success;
          totalFailed += result.failed;
          errors.push(...result.errors);

          console.log('[Broadcast] ✅ WhatsApp sent:', result.success, 'failed:', result.failed, broadcast.media_urls?.length ? `(${broadcast.media_urls.length} images)` : '');
        } catch (error) {
          console.error('[Broadcast] WhatsApp send error:', error);
          totalFailed += whatsappRecipients.length;
          errors.push(`WhatsApp bulk send failed: ${error}`);
        }
      }
    }

    // Send via Email
    if (broadcast.send_via_email) {
      const emailRecipients = residents
        .filter((r) => {
          // Must be opted in and have email
          if (!r.opted_in_email || !r.email) return false;

          // Validate email format
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(r.email)) {
            console.log(`[Broadcast] ⚠️ Skipping invalid email: ${r.email} for ${r.first_name} ${r.last_name}`);
            return false;
          }

          return true;
        })
        .map((r) => {
          // Build image HTML if media exists
          const imagesHtml = broadcast.media_urls && broadcast.media_urls.length > 0
            ? `
              <div style="margin: 20px 0;">
                ${broadcast.media_urls.map((url: string) => `
                  <img src="${url}" alt="Imagen del anuncio" style="max-width: 100%; height: auto; border-radius: 8px; margin-bottom: 10px; display: block;" />
                `).join('')}
              </div>
            `
            : '';

          return {
            email: r.email!,
            subject: `📢 ${broadcast.subject}`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">${broadcast.subject}</h2>
                <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <p style="white-space: pre-wrap; color: #666; line-height: 1.6;">${broadcast.message}</p>
                </div>
                ${imagesHtml}
                <p style="color: #999; font-size: 12px; margin-top: 20px;">
                  ${building.name}
                </p>
              </div>
            `,
          };
        });

      console.log('[Broadcast] 📧 Email recipients:', emailRecipients.length);

      if (emailRecipients.length > 0) {
        try {
          const result = await sendBulkEmail(
            emailRecipients,
            process.env.RESEND_FROM_EMAIL || 'anuncios@blokpr.co',
            process.env.RESEND_REPLY_TO_EMAIL,
            [{ name: 'broadcast_id', value: broadcastId }]
          );

          totalSent += result.success;
          totalFailed += result.failed;
          errors.push(...result.errors);

          console.log('[Broadcast] ✅ Email sent:', result.success, 'failed:', result.failed, broadcast.media_urls?.length ? `(${broadcast.media_urls.length} images)` : '');
        } catch (error) {
          console.error('[Broadcast] Email send error:', error);
          totalFailed += emailRecipients.length;
          errors.push(`Email bulk send failed: ${error}`);
        }
      }
    }

    // Send via SMS
    if (broadcast.send_via_sms) {
      const smsRecipients = residents
        .filter((r) => r.opted_in_sms && r.phone)
        .map((r) => {
          // SMS doesn't support images directly, but we can mention them
          const hasImages = broadcast.media_urls && broadcast.media_urls.length > 0;
          const imageNote = hasImages ? '\n\n📷 Este anuncio incluye imágenes. Revisa tu email o WhatsApp para verlas.' : '';

          return {
            phone: r.phone,
            message: `📢 ${broadcast.subject}\n\n${broadcast.message}${imageNote}\n\n${building.name}`,
            id: r.id,
            name: `${r.first_name} ${r.last_name}`,
          };
        });

      console.log('[Broadcast] 📱 SMS recipients:', smsRecipients.length);

      if (smsRecipients.length > 0) {
        try {
          const result = await sendBulkSMS(
            smsRecipients.map(r => ({ phone: r.phone, message: r.message })),
            building.sms_number || building.whatsapp_business_number
          );

          totalSent += result.success;
          totalFailed += result.failed;
          errors.push(...result.errors);

          console.log('[Broadcast] ✅ SMS sent:', result.success, 'failed:', result.failed);
        } catch (error) {
          console.error('[Broadcast] SMS send error:', error);
          totalFailed += smsRecipients.length;
          errors.push(`SMS bulk send failed: ${error}`);
        }
      }
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

    // Create message records in conversations for each recipient (BATCH OPTIMIZED)
    console.log('[Broadcast] 💬 Creating conversation message records...');

    try {
      // Step 1: Fetch all existing conversations for these residents in ONE query
      const residentIds = residents.map(r => r.id);
      const { data: existingConversations } = await supabase
        .from('conversations')
        .select('id, resident_id')
        .eq('building_id', broadcast.building_id)
        .in('resident_id', residentIds);

      const existingConvMap = new Map(
        (existingConversations || []).map(c => [c.resident_id, c.id])
      );

      // Step 2: Identify residents without conversations
      const residentsWithoutConv = residents.filter(r => !existingConvMap.has(r.id));

      // Step 3: Batch create missing conversations
      if (residentsWithoutConv.length > 0) {
        console.log(`[Broadcast] Creating ${residentsWithoutConv.length} missing conversations...`);

        const { data: newConversations, error: convCreateError } = await supabase
          .from('conversations')
          .insert(
            residentsWithoutConv.map(r => ({
              building_id: broadcast.building_id,
              resident_id: r.id,
              channel: 'whatsapp',
              status: 'active',
            }))
          )
          .select('id, resident_id');

        if (convCreateError) {
          console.error('[Broadcast] Batch conversation creation error:', convCreateError);
        } else if (newConversations) {
          // Add new conversations to map
          newConversations.forEach(c => existingConvMap.set(c.resident_id, c.id));
          console.log(`[Broadcast] ✅ Created ${newConversations.length} conversations`);
        }
      }

      // Step 4: Batch insert ALL messages in ONE query
      const messageRecords = residents
        .filter(r => existingConvMap.has(r.id)) // Only residents with conversations
        .map(r => ({
          conversation_id: existingConvMap.get(r.id),
          sender_type: 'admin',
          sender_id: user.id,
          content: `📢 *${broadcast.subject}*\n\n${broadcast.message}`,
          intent: 'broadcast',
          channel: 'broadcast', // Special channel type for broadcasts
          metadata: {
            broadcast_id: broadcastId,
            media_urls: broadcast.media_urls || [],
            sent_via: {
              whatsapp: broadcast.send_via_whatsapp,
              email: broadcast.send_via_email,
              sms: broadcast.send_via_sms,
            },
            target_audience: broadcast.target_audience,
          },
        }));

      if (messageRecords.length > 0) {
        const { data: createdMessages, error: messageError } = await supabase
          .from('messages')
          .insert(messageRecords)
          .select('id');

        if (messageError) {
          console.error('[Broadcast] Batch message creation error:', messageError);
        } else {
          console.log(`[Broadcast] ✅ Created ${createdMessages?.length || 0} conversation messages`);
        }
      }
    } catch (error) {
      console.error('[Broadcast] Error in batch conversation/message creation:', error);
    }

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
