import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { analyzeMessage } from '@/lib/blok-ai';
import { sendWhatsAppMessage } from '@/lib/whatsapp-client';
import { routeMessage } from '@/lib/message-router';
import { Resend } from 'resend';
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

        // Send email notification to all building admins
        try {
          // Get all admins for this building
          const { data: buildingAdmins } = await supabase
            .from('building_admins')
            .select('user_id')
            .eq('building_id', building.id);

          if (buildingAdmins && buildingAdmins.length > 0) {
            // Get email addresses and preferences for all admins
            const { data: adminProfiles } = await supabase
              .from('user_profiles')
              .select('id, notification_email, notification_preferences')
              .in('id', buildingAdmins.map(admin => admin.user_id));

            if (adminProfiles && adminProfiles.length > 0) {
              // Filter admins who have email notifications enabled for maintenance
              const emailRecipients = adminProfiles
                .filter(profile => {
                  // Check if maintenance notifications are enabled (defaults to true)
                  const prefs = profile.notification_preferences || {};
                  const maintenanceEnabled = prefs.maintenance !== false;
                  return profile.notification_email && maintenanceEnabled;
                })
                .map(profile => profile.notification_email)
                .filter(Boolean);

              // Add SUPPORT_EMAIL for testing if set
              if (process.env.SUPPORT_EMAIL && !emailRecipients.includes(process.env.SUPPORT_EMAIL)) {
                emailRecipients.push(process.env.SUPPORT_EMAIL);
              }

              if (emailRecipients.length > 0) {
                const resend = new Resend(process.env.RESEND_API_KEY);

                // Priority emoji
                const priorityEmoji = {
                  low: '🔵',
                  medium: '🟡',
                  high: '🟠',
                  emergency: '🔴'
                }[analysis.priority] || '⚪';

                // Send to all recipients
                await resend.emails.send({
                  from: 'Blok Support <support@blokpr.co>',
                  to: emailRecipients[0], // Primary recipient
                  bcc: emailRecipients.slice(1), // Rest as BCC for privacy
                  subject: `${priorityEmoji} Nueva Solicitud de Mantenimiento - ${building.name}`,
              html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #000 0%, #333 100%); padding: 30px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 24px; }
    .content { padding: 30px; }
    .priority-badge { display: inline-block; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; margin-bottom: 20px; }
    .priority-low { background: #dbeafe; color: #1e40af; }
    .priority-medium { background: #fef3c7; color: #92400e; }
    .priority-high { background: #fed7aa; color: #9a3412; }
    .priority-emergency { background: #fee2e2; color: #991b1b; }
    .detail-row { margin: 15px 0; padding: 15px; background: #f9fafb; border-radius: 8px; }
    .detail-label { font-size: 12px; color: #6b7280; font-weight: 600; text-transform: uppercase; margin-bottom: 5px; }
    .detail-value { font-size: 14px; color: #111827; }
    .description { background: #f9fafb; padding: 20px; border-radius: 8px; border-left: 4px solid #000; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; border-top: 1px solid #e5e7eb; }
    .button { display: inline-block; background: #000; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔧 Nueva Solicitud de Mantenimiento</h1>
    </div>
    <div class="content">
      <span class="priority-badge priority-${analysis.priority}">${priorityEmoji} Prioridad: ${analysis.priority.toUpperCase()}</span>

      <div class="detail-row">
        <div class="detail-label">Edificio</div>
        <div class="detail-value">${building.name}</div>
      </div>

      <div class="detail-row">
        <div class="detail-label">Residente</div>
        <div class="detail-value">${resident.name} ${resident.units?.unit_number ? `- Unidad ${resident.units.unit_number}` : ''}</div>
      </div>

      <div class="detail-row">
        <div class="detail-label">Categoría</div>
        <div class="detail-value">${analysis.extractedData?.maintenanceCategory || 'General'}</div>
      </div>

      ${analysis.extractedData?.location ? `
      <div class="detail-row">
        <div class="detail-label">Ubicación</div>
        <div class="detail-value">${analysis.extractedData.location}</div>
      </div>
      ` : ''}

      <div class="description">
        <div class="detail-label">Descripción</div>
        <div class="detail-value" style="margin-top: 10px;">${payload.Body}</div>
      </div>

      <div style="text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://blokpr.co'}/dashboard/maintenance" class="button">Ver en Dashboard</a>
      </div>
    </div>
    <div class="footer">
      <p>Este correo fue generado automáticamente por Blok.</p>
      <p style="margin-top: 10px;">© 2025 Blok. Gestión inteligente de condominios.</p>
    </div>
  </div>
</body>
</html>
              `,
                });

                console.log('[WhatsApp] ✅ Email notification sent to', emailRecipients.length, 'admin(s)');
              }
            }
          }
        } catch (emailError) {
          console.error('[WhatsApp] Failed to send email notification:', emailError);
          // Don't fail the whole request if email fails
        }
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
