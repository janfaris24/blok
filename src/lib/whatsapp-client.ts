import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

// Initialize Twilio client only if credentials are available
let client: ReturnType<typeof twilio> | null = null;

if (accountSid && authToken) {
  client = twilio(accountSid, authToken);
}

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
 * Sends WhatsApp messages to multiple recipients (broadcast)
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
 * Validates if a phone number is in the correct format for WhatsApp
 *
 * @param phone - Phone number to validate
 * @returns True if valid WhatsApp format
 */
export function isValidWhatsAppNumber(phone: string): boolean {
  // Must start with + followed by country code and number
  // Puerto Rico: +1787 or +1939
  const whatsappRegex = /^\+1(787|939)\d{7}$/;
  return whatsappRegex.test(phone);
}

/**
 * Formats a phone number to WhatsApp format
 *
 * @param phone - Phone number (various formats)
 * @returns Formatted phone number (+1787XXXXXXX)
 */
export function formatWhatsAppNumber(phone: string): string {
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
