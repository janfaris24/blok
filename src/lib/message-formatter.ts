/**
 * Message formatting utilities for adding sender indicators
 * to distinguish between AI bot and admin messages
 */

export type SenderType = 'ai' | 'admin' | 'resident';
export type Language = 'es' | 'en';

/**
 * Adds a visual indicator prefix to messages based on sender type
 *
 * @param message - The original message content
 * @param senderType - Who is sending the message ('ai', 'admin', or 'resident')
 * @param language - Preferred language for admin label ('es' or 'en')
 * @returns Formatted message with appropriate indicator prefix
 *
 * @example
 * formatMessageWithIndicator("Hola, ¿cómo puedo ayudarte?", "ai", "es")
 * // Returns: "🤖 Hola, ¿cómo puedo ayudarte?"
 *
 * formatMessageWithIndicator("I'll look into this issue", "admin", "en")
 * // Returns: "👤 Admin: I'll look into this issue"
 */
export function formatMessageWithIndicator(
  message: string,
  senderType: SenderType,
  language: Language = 'es'
): string {
  // Residents don't get indicators (they're the ones receiving messages)
  if (senderType === 'resident') {
    return message;
  }

  // AI bot indicator - clean, just emoji
  if (senderType === 'ai') {
    return `🤖 ${message}`;
  }

  // Admin indicator - language-specific but shorter
  if (senderType === 'admin') {
    const adminLabel = language === 'es' ? 'Admin' : 'Admin';
    return `👤 ${adminLabel}: ${message}`;
  }

  // Fallback: return message as-is
  return message;
}

/**
 * Checks if a message already has an indicator prefix
 * Useful to avoid double-prefixing
 *
 * @param message - Message to check
 * @returns True if message starts with an indicator emoji
 */
export function hasIndicator(message: string): boolean {
  return message.startsWith('🤖') || message.startsWith('👤');
}

/**
 * Removes indicator prefix from a message
 * Useful for database storage or processing
 *
 * @param message - Message with potential indicator
 * @returns Message without indicator prefix
 */
export function removeIndicator(message: string): string {
  if (!hasIndicator(message)) {
    return message;
  }

  // Remove everything up to and including the first colon and space
  const colonIndex = message.indexOf(':');
  if (colonIndex === -1) {
    return message; // No colon found, return as-is
  }

  return message.substring(colonIndex + 1).trim();
}
