import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(request: NextRequest) {
  try {
    // Verify webhook secret (using custom header due to Supabase bug #39248)
    const webhookSecret = request.headers.get('x-webhook-secret');
    const expectedSecret = process.env.SUPABASE_WEBHOOK_SECRET;

    // DEBUG: Log what we're receiving
    console.log('[Waitlist Webhook] X-Webhook-Secret received:', webhookSecret?.substring(0, 10) + '...');
    console.log('[Waitlist Webhook] Expected secret exists:', !!expectedSecret);

    if (expectedSecret && webhookSecret !== expectedSecret) {
      console.error('[Waitlist Webhook] Unauthorized - secret mismatch');
      console.error('[Waitlist Webhook] Received:', webhookSecret);
      console.error('[Waitlist Webhook] Expected:', expectedSecret);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the webhook payload
    const payload = await request.json();
    const waitlistEntry = payload.record;

    // Initialize Resend
    const resend = new Resend(process.env.RESEND_API_KEY);
    const notificationEmail = process.env.FEEDBACK_NOTIFICATION_EMAIL || 'janfaris@blokpr.co';

    // Format the date
    const subscribedDate = new Date(waitlistEntry.subscribed_at).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'America/Puerto_Rico',
    });

    // Send email notification to admin
    const result = await resend.emails.send({
      from: 'Blok Waitlist <waitlist@blokpr.co>',
      to: notificationEmail,
      subject: `🎉 Nueva Suscripción a Waitlist - ${waitlistEntry.email}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px 20px;
                text-align: center;
                border-radius: 10px 10px 0 0;
              }
              .content {
                background: #f9fafb;
                padding: 30px 20px;
                border-radius: 0 0 10px 10px;
              }
              .card {
                background: white;
                padding: 20px;
                border-radius: 8px;
                margin-bottom: 20px;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
              }
              .info-row {
                display: flex;
                padding: 12px 0;
                border-bottom: 1px solid #e5e7eb;
              }
              .info-row:last-child {
                border-bottom: none;
              }
              .info-label {
                font-weight: 600;
                color: #6b7280;
                min-width: 140px;
              }
              .info-value {
                color: #111827;
                flex: 1;
              }
              .badge {
                display: inline-block;
                padding: 4px 12px;
                background: #dcfce7;
                color: #166534;
                border-radius: 12px;
                font-size: 14px;
                font-weight: 600;
              }
              h1 {
                margin: 0;
                font-size: 24px;
              }
              h2 {
                color: #111827;
                margin-top: 0;
                font-size: 18px;
              }
              .footer {
                text-align: center;
                padding: 20px;
                color: #6b7280;
                font-size: 14px;
              }
              .button {
                display: inline-block;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 12px 24px;
                text-decoration: none;
                border-radius: 6px;
                font-weight: 600;
                margin-top: 10px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>🎉 Nueva Suscripción a Waitlist</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.95;">Alguien se acaba de unir a la lista de espera</p>
            </div>

            <div class="content">
              <div class="card">
                <h2>Información de Contacto</h2>
                <div class="info-row">
                  <span class="info-label">📧 Email:</span>
                  <span class="info-value"><strong>${waitlistEntry.email}</strong></span>
                </div>
                ${waitlistEntry.name ? `
                <div class="info-row">
                  <span class="info-label">👤 Nombre:</span>
                  <span class="info-value">${waitlistEntry.name}</span>
                </div>
                ` : ''}
                ${waitlistEntry.phone ? `
                <div class="info-row">
                  <span class="info-label">📱 Teléfono:</span>
                  <span class="info-value">${waitlistEntry.phone}</span>
                </div>
                ` : ''}
                ${waitlistEntry.building ? `
                <div class="info-row">
                  <span class="info-label">🏢 Edificio:</span>
                  <span class="info-value">${waitlistEntry.building}</span>
                </div>
                ` : ''}
              </div>

              <div class="card">
                <h2>Detalles de Suscripción</h2>
                <div class="info-row">
                  <span class="info-label">📅 Fecha:</span>
                  <span class="info-value">${subscribedDate}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">🌐 Origen:</span>
                  <span class="info-value"><span class="badge">${waitlistEntry.source || 'landing_page'}</span></span>
                </div>
                ${waitlistEntry.referrer_url ? `
                <div class="info-row">
                  <span class="info-label">🔗 Referrer:</span>
                  <span class="info-value" style="word-break: break-all; font-size: 13px;">${waitlistEntry.referrer_url}</span>
                </div>
                ` : ''}
              </div>

              <div style="text-align: center; padding: 20px;">
                <a href="https://blokpr.co/dashboard/admin-feedback" class="button">
                  Ver Dashboard
                </a>
              </div>
            </div>

            <div class="footer">
              <p><strong>Blok</strong> - Comunicación inteligente para condominios</p>
              <p style="font-size: 12px; margin-top: 10px;">
                Este correo fue enviado automáticamente cuando alguien se unió a la waitlist
              </p>
            </div>
          </body>
        </html>
      `,
    });

    console.log('Waitlist notification email sent:', result.data?.id);

    return NextResponse.json({
      success: true,
      emailId: result.data?.id,
    });

  } catch (error) {
    console.error('Waitlist notification webhook error:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}
