import { Resend } from 'resend';
import { createClient } from '@/lib/supabase-server';
import { sendWhatsAppMessage } from '@/lib/messaging-client';

// Lazy initialization of Resend to avoid build errors
let resend: Resend | null = null;

function getResendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[Notifications] RESEND_API_KEY not configured');
    return null;
  }

  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }

  return resend;
}

interface NotificationData {
  buildingId: string;
  priority: 'emergency' | 'high' | 'medium' | 'low';
  type: 'new_message' | 'maintenance_request' | 'emergency';
  residentName: string;
  residentUnit?: string;
  messageContent: string;
  conversationId: string;
  dashboardLink: string;
}

interface UserProfile {
  full_name: string;
  notification_email: string | null;
  notification_phone: string | null;
  notification_preferences: {
    emergency: boolean;
    high: boolean;
    maintenance: boolean;
    general: boolean;
  };
  language: string;
}

interface BuildingAdmin {
  id: string;
  user_id: string;
  role: string;
  user_profiles: UserProfile;
}

/**
 * Get all admins for a building with their notification preferences
 */
async function getBuildingAdmins(buildingId: string): Promise<BuildingAdmin[]> {
  const supabase = await createClient();

  const { data: admins, error } = await supabase
    .from('building_admins')
    .select(`
      id,
      user_id,
      role,
      user_profiles!inner (
        full_name,
        notification_email,
        notification_phone,
        notification_preferences,
        language
      )
    `)
    .eq('building_id', buildingId);

  if (error || !admins) {
    console.error('[Notifications] Error fetching building admins:', error);
    return [];
  }

  // Supabase returns user_profiles as a single object when using !inner
  return admins.map(admin => ({
    ...admin,
    user_profiles: Array.isArray(admin.user_profiles)
      ? admin.user_profiles[0]
      : admin.user_profiles
  })) as BuildingAdmin[];
}

/**
 * Check if admin should be notified based on preferences and priority
 */
function shouldNotifyAdmin(admin: BuildingAdmin, priority: string, type: string): boolean {
  const prefs = admin.user_profiles.notification_preferences;

  // Always notify on emergency
  if (priority === 'emergency' && prefs.emergency) return true;

  // High priority notifications
  if (priority === 'high' && prefs.high) return true;

  // Maintenance requests
  if (type === 'maintenance_request' && prefs.maintenance) return true;

  // General messages (usually off by default)
  if ((priority === 'medium' || priority === 'low') && prefs.general) return true;

  return false;
}

/**
 * Send urgent notification email via Resend
 */
async function sendEmailNotification(
  to: string,
  data: NotificationData,
  adminName: string,
  language: string
): Promise<boolean> {
  const isSpanish = language === 'es';

  const priorityEmoji = {
    emergency: '🚨',
    high: '⚠️',
    medium: 'ℹ️',
    low: '📝'
  };

  const priorityText = {
    emergency: isSpanish ? 'EMERGENCIA' : 'EMERGENCY',
    high: isSpanish ? 'PRIORIDAD ALTA' : 'HIGH PRIORITY',
    medium: isSpanish ? 'Prioridad Media' : 'Medium Priority',
    low: isSpanish ? 'Prioridad Baja' : 'Low Priority'
  };

  const subject = isSpanish
    ? `${priorityEmoji[data.priority]} ${priorityText[data.priority]}: Mensaje de ${data.residentName}`
    : `${priorityEmoji[data.priority]} ${priorityText[data.priority]}: Message from ${data.residentName}`;

  const htmlBody = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: ${data.priority === 'emergency' ? '#dc2626' : '#ea580c'}; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-top: none; }
          .info-row { margin: 12px 0; }
          .label { font-weight: 600; color: #6b7280; }
          .value { color: #111827; }
          .message-box { background: white; padding: 16px; border-left: 4px solid #3b82f6; margin: 16px 0; border-radius: 4px; }
          .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 16px; }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 24px;">${priorityEmoji[data.priority]} ${priorityText[data.priority]}</h1>
          </div>
          <div class="content">
            <p>${isSpanish ? `Hola ${adminName},` : `Hello ${adminName},`}</p>

            <div class="info-row">
              <span class="label">${isSpanish ? 'Residente:' : 'Resident:'}</span>
              <span class="value">${data.residentName}</span>
            </div>

            ${data.residentUnit ? `
            <div class="info-row">
              <span class="label">${isSpanish ? 'Unidad:' : 'Unit:'}</span>
              <span class="value">${data.residentUnit}</span>
            </div>
            ` : ''}

            <div class="info-row">
              <span class="label">${isSpanish ? 'Tipo:' : 'Type:'}</span>
              <span class="value">${data.type === 'maintenance_request' ? (isSpanish ? 'Solicitud de Mantenimiento' : 'Maintenance Request') : (isSpanish ? 'Mensaje' : 'Message')}</span>
            </div>

            <div class="message-box">
              <strong>${isSpanish ? 'Mensaje:' : 'Message:'}</strong>
              <p style="margin: 8px 0 0 0;">${data.messageContent}</p>
            </div>

            <a href="${data.dashboardLink}" class="button">
              ${isSpanish ? '📱 Ver Conversación' : '📱 View Conversation'}
            </a>

            <p style="margin-top: 24px; font-size: 14px; color: #6b7280;">
              ${isSpanish
                ? 'Este mensaje requiere tu atención inmediata. Por favor responde lo antes posible.'
                : 'This message requires your immediate attention. Please respond as soon as possible.'}
            </p>
          </div>
          <div class="footer">
            <p>Blok - Comunicación Inteligente para Condominios</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const resendClient = getResendClient();

  if (!resendClient) {
    console.warn('[Notifications] ⚠️ Resend not configured, skipping email');
    return false;
  }

  try {
    const { error } = await resendClient.emails.send({
      from: 'Blok Alertas <alerts@blok.app>',
      to: [to],
      subject: subject,
      html: htmlBody,
    });

    if (error) {
      console.error('[Notifications] Resend error:', error);
      return false;
    }

    console.log(`[Notifications] ✅ Email sent to ${to}`);
    return true;
  } catch (error) {
    console.error('[Notifications] Failed to send email:', error);
    return false;
  }
}

/**
 * Send urgent WhatsApp notification to admin
 */
async function sendWhatsAppNotification(
  to: string,
  from: string,
  data: NotificationData,
  language: string
): Promise<boolean> {
  const isSpanish = language === 'es';

  const priorityEmoji = {
    emergency: '🚨',
    high: '⚠️',
    medium: 'ℹ️',
    low: '📝'
  };

  const message = isSpanish
    ? `${priorityEmoji[data.priority]} *URGENTE: ${data.residentName}*${data.residentUnit ? ` - Unidad ${data.residentUnit}` : ''}\n\n` +
      `*Mensaje:* ${data.messageContent}\n\n` +
      `*Prioridad:* ${data.priority.toUpperCase()}\n\n` +
      `Responde en: ${data.dashboardLink}`
    : `${priorityEmoji[data.priority]} *URGENT: ${data.residentName}*${data.residentUnit ? ` - Unit ${data.residentUnit}` : ''}\n\n` +
      `*Message:* ${data.messageContent}\n\n` +
      `*Priority:* ${data.priority.toUpperCase()}\n\n` +
      `Respond at: ${data.dashboardLink}`;

  try {
    await sendWhatsAppMessage(to, from, message);
    console.log(`[Notifications] ✅ WhatsApp sent to ${to}`);
    return true;
  } catch (error) {
    console.error('[Notifications] Failed to send WhatsApp:', error);
    return false;
  }
}

/**
 * Main function: Notify all building admins about urgent message
 */
export async function notifyBuildingAdmins(data: NotificationData): Promise<void> {
  console.log(`[Notifications] 🔔 Processing ${data.priority} notification for building ${data.buildingId}`);

  const admins = await getBuildingAdmins(data.buildingId);

  if (admins.length === 0) {
    console.warn('[Notifications] ⚠️ No admins found for building');
    return;
  }

  // Get building WhatsApp number for sending admin notifications
  const supabase = await createClient();
  const { data: building } = await supabase
    .from('buildings')
    .select('whatsapp_business_number')
    .eq('id', data.buildingId)
    .single();

  const fromNumber = building?.whatsapp_business_number;

  let notificationsSent = 0;

  for (const admin of admins) {
    // Check if admin should be notified based on preferences
    if (!shouldNotifyAdmin(admin, data.priority, data.type)) {
      console.log(`[Notifications] ⏭️ Skipping ${admin.user_profiles.full_name} (preferences)`);
      continue;
    }

    const language = admin.user_profiles.language || 'es';

    // Send email if available
    if (admin.user_profiles.notification_email) {
      const emailSent = await sendEmailNotification(
        admin.user_profiles.notification_email,
        data,
        admin.user_profiles.full_name,
        language
      );
      if (emailSent) notificationsSent++;
    }

    // Send WhatsApp for emergency/high priority if available
    if (
      (data.priority === 'emergency' || data.priority === 'high') &&
      admin.user_profiles.notification_phone &&
      fromNumber
    ) {
      const whatsappSent = await sendWhatsAppNotification(
        admin.user_profiles.notification_phone,
        fromNumber,
        data,
        language
      );
      if (whatsappSent) notificationsSent++;
    }
  }

  console.log(`[Notifications] ✅ Sent ${notificationsSent} notifications to ${admins.length} admins`);
}
