import twilio from 'twilio';
import { Resend } from 'resend';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const resendApiKey = process.env.RESEND_API_KEY;

// Initialize Twilio client only if credentials are available
let client: ReturnType<typeof twilio> | null = null;

if (accountSid && authToken) {
  client = twilio(accountSid, authToken);
}

// Initialize Resend client only if API key is available
let resend: Resend | null = null;

if (resendApiKey) {
  resend = new Resend(resendApiKey);
}

export type MessageChannel = 'whatsapp' | 'sms' | 'email';

/**
 * Sends a WhatsApp message via Twilio
 *
 * @param to - Recipient phone number (format: +1787XXXXXXX)
 * @param from - Sender WhatsApp business number (format: +1787XXXXXXX)
 * @param body - Message content
 * @returns Twilio message SID
 */
export async function sendWhatsAppMessage(
  to: string,
  from: string,
  body: string
): Promise<string> {
  if (!client) {
    console.error('[WhatsApp] Twilio client not initialized - missing credentials');
    throw new Error('Twilio client not configured');
  }

  try {
    const message = await client.messages.create({
      from: `whatsapp:${from}`,
      to: `whatsapp:${to}`,
      body,
    });

    console.log(`[WhatsApp] ✅ Message sent to ${to}: ${message.sid}`);
    return message.sid;
  } catch (error) {
    console.error('[WhatsApp] ❌ Send error:', error);
    throw new Error(`Failed to send WhatsApp message: ${error}`);
  }
}

/**
 * Sends an SMS message via Twilio
 *
 * @param to - Recipient phone number (format: +1787XXXXXXX)
 * @param from - Sender SMS number (format: +1787XXXXXXX)
 * @param body - Message content
 * @returns Twilio message SID
 */
export async function sendSMSMessage(
  to: string,
  from: string,
  body: string
): Promise<string> {
  if (!client) {
    console.error('[SMS] Twilio client not initialized - missing credentials');
    throw new Error('Twilio client not configured');
  }

  try {
    const message = await client.messages.create({
      from: from, // No prefix for SMS
      to: to,
      body,
    });

    console.log(`[SMS] ✅ Message sent to ${to}: ${message.sid}`);
    return message.sid;
  } catch (error) {
    console.error('[SMS] ❌ Send error:', error);
    throw new Error(`Failed to send SMS message: ${error}`);
  }
}

/**
 * Sends a message via the appropriate channel (WhatsApp or SMS)
 *
 * @param to - Recipient phone number
 * @param from - Sender number
 * @param body - Message content
 * @param channel - Communication channel ('whatsapp' or 'sms')
 * @returns Twilio message SID
 */
export async function sendMessage(
  to: string,
  from: string,
  body: string,
  channel: 'whatsapp' | 'sms'
): Promise<string> {
  if (channel === 'whatsapp') {
    return sendWhatsAppMessage(to, from, body);
  } else {
    return sendSMSMessage(to, from, body);
  }
}

/**
 * Sends messages to multiple recipients via WhatsApp (broadcast)
 *
 * @param recipients - Array of recipient objects with phone and message
 * @param from - Sender WhatsApp business number
 * @returns Object with success and failed counts
 */
export async function sendBulkWhatsApp(
  recipients: Array<{ phone: string; message: string }>,
  from: string
): Promise<{ success: number; failed: number; errors: string[] }> {
  let success = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const recipient of recipients) {
    try {
      await sendWhatsAppMessage(recipient.phone, from, recipient.message);
      success++;
    } catch (error) {
      console.error(`[WhatsApp] Failed to send to ${recipient.phone}:`, error);
      failed++;
      errors.push(`${recipient.phone}: ${error}`);
    }

    // Rate limiting: 80 messages/second max for Twilio
    // Wait 15ms between messages to stay under limit
    await new Promise((resolve) => setTimeout(resolve, 15));
  }

  console.log(`[WhatsApp] Bulk send complete: ${success} success, ${failed} failed`);

  return { success, failed, errors };
}

/**
 * Sends messages to multiple recipients via SMS (broadcast)
 *
 * @param recipients - Array of recipient objects with phone and message
 * @param from - Sender SMS number
 * @returns Object with success and failed counts
 */
export async function sendBulkSMS(
  recipients: Array<{ phone: string; message: string }>,
  from: string
): Promise<{ success: number; failed: number; errors: string[] }> {
  let success = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const recipient of recipients) {
    try {
      await sendSMSMessage(recipient.phone, from, recipient.message);
      success++;
    } catch (error) {
      console.error(`[SMS] Failed to send to ${recipient.phone}:`, error);
      failed++;
      errors.push(`${recipient.phone}: ${error}`);
    }

    // Rate limiting: same as WhatsApp
    await new Promise((resolve) => setTimeout(resolve, 15));
  }

  console.log(`[SMS] Bulk send complete: ${success} success, ${failed} failed`);

  return { success, failed, errors };
}

/**
 * Sends bulk messages via multiple channels
 *
 * @param recipients - Array with phone, message, and preferred channel
 * @param whatsappFrom - WhatsApp business number
 * @param smsFrom - SMS number (can be same as WhatsApp)
 * @returns Combined results for all channels
 */
export async function sendBulkMultiChannel(
  recipients: Array<{ phone: string; message: string; channel: 'whatsapp' | 'sms' }>,
  whatsappFrom: string,
  smsFrom: string
): Promise<{
  whatsapp: { success: number; failed: number; errors: string[] };
  sms: { success: number; failed: number; errors: string[] };
  total: { success: number; failed: number };
}> {
  const whatsappRecipients = recipients
    .filter(r => r.channel === 'whatsapp')
    .map(r => ({ phone: r.phone, message: r.message }));

  const smsRecipients = recipients
    .filter(r => r.channel === 'sms')
    .map(r => ({ phone: r.phone, message: r.message }));

  const [whatsappResults, smsResults] = await Promise.all([
    whatsappRecipients.length > 0
      ? sendBulkWhatsApp(whatsappRecipients, whatsappFrom)
      : { success: 0, failed: 0, errors: [] },
    smsRecipients.length > 0
      ? sendBulkSMS(smsRecipients, smsFrom)
      : { success: 0, failed: 0, errors: [] }
  ]);

  return {
    whatsapp: whatsappResults,
    sms: smsResults,
    total: {
      success: whatsappResults.success + smsResults.success,
      failed: whatsappResults.failed + smsResults.failed,
    }
  };
}

/**
 * Sends an email via Resend
 *
 * @param to - Recipient email address
 * @param from - Sender email address (must be verified domain)
 * @param subject - Email subject
 * @param html - HTML email body
 * @param replyTo - Optional reply-to address
 * @param tags - Optional tags for tracking (e.g., broadcast_id)
 * @returns Resend email ID
 */
export async function sendEmail(
  to: string,
  from: string,
  subject: string,
  html: string,
  replyTo?: string,
  tags?: { name: string; value: string }[]
): Promise<string> {
  if (!resend) {
    console.error('[Email] Resend client not initialized - missing API key');
    throw new Error('Resend client not configured');
  }

  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
      replyTo,
      tags,
    });

    if (error) {
      throw error;
    }

    console.log(`[Email] ✅ Email sent to ${to}: ${data?.id}`);
    return data?.id || '';
  } catch (error) {
    console.error('[Email] ❌ Send error:', error);
    throw new Error(`Failed to send email: ${error}`);
  }
}

/**
 * Sends emails to multiple recipients (broadcast)
 *
 * @param recipients - Array of recipient objects with email, subject, and html
 * @param from - Sender email address (must be verified domain)
 * @param replyTo - Optional reply-to address
 * @param tags - Optional tags for tracking (e.g., broadcast_id)
 * @returns Object with success and failed counts
 */
export async function sendBulkEmail(
  recipients: Array<{ email: string; subject: string; html: string }>,
  from: string,
  replyTo?: string,
  tags?: { name: string; value: string }[]
): Promise<{ success: number; failed: number; errors: string[] }> {
  let success = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const recipient of recipients) {
    try {
      await sendEmail(recipient.email, from, recipient.subject, recipient.html, replyTo, tags);
      success++;
    } catch (error) {
      console.error(`[Email] Failed to send to ${recipient.email}:`, error);
      failed++;
      errors.push(`${recipient.email}: ${error}`);
    }

    // Rate limiting: Resend has generous limits but add small delay to be safe
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  console.log(`[Email] Bulk send complete: ${success} success, ${failed} failed`);

  return { success, failed, errors };
}

/**
 * Validates if a phone number is in the correct format
 *
 * @param phone - Phone number to validate
 * @returns True if valid format
 */
export function isValidPhoneNumber(phone: string): boolean {
  // Must start with + followed by country code and number
  // Puerto Rico: +1787 or +1939
  const phoneRegex = /^\+1(787|939)\d{7}$/;
  return phoneRegex.test(phone);
}

/**
 * Validates if an email is in the correct format
 *
 * @param email - Email address to validate
 * @returns True if valid format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Formats a phone number to standard format
 *
 * @param phone - Phone number (various formats)
 * @returns Formatted phone number (+1787XXXXXXX)
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');

  // If it starts with 1787 or 1939, add + prefix
  if (cleaned.startsWith('1787') || cleaned.startsWith('1939')) {
    return `+${cleaned}`;
  }

  // If it starts with 787 or 939, add +1 prefix
  if (cleaned.startsWith('787') || cleaned.startsWith('939')) {
    return `+1${cleaned}`;
  }

  // Otherwise return as-is with + prefix if missing
  return cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
}

/**
 * Detects the channel from a Twilio webhook payload
 *
 * @param from - The 'From' field from Twilio webhook
 * @returns The detected channel ('whatsapp' or 'sms')
 */
export function detectChannelFromPayload(from: string): 'whatsapp' | 'sms' {
  return from.includes('whatsapp:') ? 'whatsapp' : 'sms';
}

/**
 * Extracts the phone number from a Twilio payload field
 * Removes the 'whatsapp:' prefix if present
 *
 * @param field - The phone field from Twilio (e.g., 'whatsapp:+14155238886' or '+14155238886')
 * @returns Clean phone number (e.g., '+14155238886')
 */
export function extractPhoneNumber(field: string): string {
  return field.replace('whatsapp:', '');
}

// Re-export for backward compatibility
export const isValidWhatsAppNumber = isValidPhoneNumber;
export const formatWhatsAppNumber = formatPhoneNumber;
