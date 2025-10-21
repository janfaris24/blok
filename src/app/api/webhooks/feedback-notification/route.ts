import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

/**
 * Supabase Database Webhook - New Feedback Notification
 *
 * This endpoint is called by Supabase when a new row is inserted into the feedback table.
 * It sends an email notification to the admin.
 *
 * Webhook payload from Supabase:
 * {
 *   type: "INSERT",
 *   table: "feedback",
 *   record: { ... },
 *   schema: "public",
 *   old_record: null
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Verify webhook secret to ensure it's from Supabase
    const authHeader = request.headers.get('authorization');
    const expectedSecret = process.env.SUPABASE_WEBHOOK_SECRET;

    // DEBUG: Log what we're receiving
    console.log('[Feedback Webhook] Auth header received:', authHeader);
    console.log('[Feedback Webhook] Expected secret exists:', !!expectedSecret);
    console.log('[Feedback Webhook] Expected format:', `Bearer ${expectedSecret?.substring(0, 10)}...`);

    if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
      console.error('[Feedback Webhook] Unauthorized - header mismatch');
      console.error('[Feedback Webhook] Received:', authHeader);
      console.error('[Feedback Webhook] Expected:', `Bearer ${expectedSecret}`);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await request.json();
    const feedback = payload.record;

    console.log('[Feedback Webhook] New feedback received:', {
      id: feedback.id,
      name: feedback.name,
      email: feedback.email,
      nps_score: feedback.nps_score,
    });

    // Initialize Resend
    const resend = new Resend(process.env.RESEND_API_KEY);
    const notificationEmail = process.env.FEEDBACK_NOTIFICATION_EMAIL || 'janfaris@blokpr.co';

    // Format feedback data for email
    const roleLabels: Record<string, string> = {
      owner: 'Propietario',
      renter: 'Inquilino',
      admin: 'Administrador',
      other: 'Otro',
    };

    const interestLabels: Record<string, string> = {
      yes: '✅ SÍ - Quiere probar',
      maybe: '🤔 Tal vez',
      no: '❌ No',
    };

    // Send email notification
    const result = await resend.emails.send({
      from: 'Blok Feedback <feedback@blokpr.co>',
      to: notificationEmail,
      subject: `🔔 Nuevo Feedback - ${feedback.name} (NPS: ${feedback.nps_score}/10)`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
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
                padding: 30px;
                border-radius: 10px 10px 0 0;
                text-align: center;
              }
              .header h1 {
                margin: 0;
                font-size: 24px;
              }
              .content {
                background: #f9fafb;
                padding: 30px;
                border-radius: 0 0 10px 10px;
              }
              .section {
                background: white;
                padding: 20px;
                margin-bottom: 20px;
                border-radius: 8px;
                border-left: 4px solid #667eea;
              }
              .section h2 {
                margin-top: 0;
                color: #667eea;
                font-size: 18px;
              }
              .field {
                margin-bottom: 15px;
              }
              .label {
                font-weight: 600;
                color: #555;
                display: block;
                margin-bottom: 5px;
              }
              .value {
                color: #333;
              }
              .rating {
                display: inline-block;
                background: #667eea;
                color: white;
                padding: 5px 15px;
                border-radius: 20px;
                font-weight: bold;
              }
              .rating.high {
                background: #10b981;
              }
              .rating.medium {
                background: #f59e0b;
              }
              .rating.low {
                background: #ef4444;
              }
              .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                color: #6b7280;
                font-size: 14px;
              }
              .button {
                display: inline-block;
                background: #667eea;
                color: white;
                padding: 12px 24px;
                text-decoration: none;
                border-radius: 6px;
                margin-top: 10px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>🎉 Nuevo Feedback Recibido</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">
                ${new Date(feedback.submitted_at).toLocaleDateString('es-PR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>

            <div class="content">
              <!-- Contact Info -->
              <div class="section">
                <h2>👤 Información de Contacto</h2>
                <div class="field">
                  <span class="label">Nombre:</span>
                  <span class="value">${feedback.name}</span>
                </div>
                <div class="field">
                  <span class="label">Email:</span>
                  <span class="value">${feedback.email || 'No proporcionado'}</span>
                </div>
                <div class="field">
                  <span class="label">Teléfono:</span>
                  <span class="value">${feedback.phone || 'No proporcionado'}</span>
                </div>
                <div class="field">
                  <span class="label">Rol:</span>
                  <span class="value">${roleLabels[feedback.role] || feedback.role}</span>
                </div>
                ${feedback.building ? `
                <div class="field">
                  <span class="label">Edificio:</span>
                  <span class="value">${feedback.building}</span>
                </div>
                ` : ''}
                ${feedback.unit ? `
                <div class="field">
                  <span class="label">Unidad:</span>
                  <span class="value">${feedback.unit}</span>
                </div>
                ` : ''}
              </div>

              <!-- Ratings -->
              <div class="section">
                <h2>⭐ Puntuaciones</h2>
                <div class="field">
                  <span class="label">NPS - Probabilidad de Recomendar:</span>
                  <span class="rating ${feedback.nps_score >= 9 ? 'high' : feedback.nps_score >= 7 ? 'medium' : 'low'}">
                    ${feedback.nps_score}/10
                  </span>
                </div>
                <div class="field">
                  <span class="label">Claridad del Concepto:</span>
                  <span class="rating ${feedback.clarity_rating >= 4 ? 'high' : feedback.clarity_rating >= 3 ? 'medium' : 'low'}">
                    ${feedback.clarity_rating}/5
                  </span>
                </div>
                <div class="field">
                  <span class="label">Utilidad Percibida:</span>
                  <span class="rating ${feedback.usefulness_rating >= 4 ? 'high' : feedback.usefulness_rating >= 3 ? 'medium' : 'low'}">
                    ${feedback.usefulness_rating}/5
                  </span>
                </div>
              </div>

              <!-- Interest Level -->
              <div class="section">
                <h2>🎯 Interés en Probar</h2>
                <div class="field">
                  <span class="value" style="font-size: 18px;">
                    ${interestLabels[feedback.interested] || feedback.interested}
                  </span>
                </div>
              </div>

              <!-- Open Feedback -->
              ${feedback.concerns || feedback.suggestions ? `
              <div class="section">
                <h2>💬 Comentarios Abiertos</h2>
                ${feedback.concerns ? `
                <div class="field">
                  <span class="label">Preocupaciones o Dudas:</span>
                  <p class="value" style="margin: 5px 0; padding: 10px; background: #f3f4f6; border-radius: 4px;">
                    ${feedback.concerns}
                  </p>
                </div>
                ` : ''}
                ${feedback.suggestions ? `
                <div class="field">
                  <span class="label">Sugerencias de Mejora:</span>
                  <p class="value" style="margin: 5px 0; padding: 10px; background: #f3f4f6; border-radius: 4px;">
                    ${feedback.suggestions}
                  </p>
                </div>
                ` : ''}
              </div>
              ` : ''}

              <!-- View in Dashboard -->
              <div style="text-align: center; margin-top: 30px;">
                <a href="https://blokpr.co/dashboard/admin-feedback" class="button">
                  Ver en Dashboard
                </a>
              </div>
            </div>

            <div class="footer">
              <p>
                Este es un email automático enviado por Supabase Database Webhooks<br>
                Feedback ID: ${feedback.id}
              </p>
            </div>
          </body>
        </html>
      `,
      text: `
NUEVO FEEDBACK RECIBIDO
${new Date(feedback.submitted_at).toLocaleString('es-PR')}

CONTACTO
Nombre: ${feedback.name}
Email: ${feedback.email || 'No proporcionado'}
Teléfono: ${feedback.phone || 'No proporcionado'}
Rol: ${roleLabels[feedback.role] || feedback.role}
${feedback.building ? `Edificio: ${feedback.building}` : ''}
${feedback.unit ? `Unidad: ${feedback.unit}` : ''}

PUNTUACIONES
NPS (Recomendar): ${feedback.nps_score}/10
Claridad: ${feedback.clarity_rating}/5
Utilidad: ${feedback.usefulness_rating}/5

INTERÉS EN PROBAR
${interestLabels[feedback.interested] || feedback.interested}

${feedback.concerns ? `PREOCUPACIONES:\n${feedback.concerns}\n\n` : ''}
${feedback.suggestions ? `SUGERENCIAS:\n${feedback.suggestions}\n\n` : ''}

Ver en dashboard: https://blokpr.co/dashboard/admin-feedback
Feedback ID: ${feedback.id}
      `.trim(),
    });

    if (result.error) {
      console.error('[Feedback Webhook] Resend error:', result.error);
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    console.log('[Feedback Webhook] Email sent successfully. Resend ID:', result.data?.id);

    return NextResponse.json({
      success: true,
      emailId: result.data?.id,
    });

  } catch (error) {
    console.error('[Feedback Webhook] Error:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}
