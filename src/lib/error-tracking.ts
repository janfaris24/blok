import * as Sentry from '@sentry/nextjs';

/**
 * Track API errors with context
 */
export function trackAPIError(
  error: Error,
  context: {
    endpoint: string;
    method: string;
    statusCode?: number;
    userId?: string;
    buildingId?: string;
  }
) {
  Sentry.captureException(error, {
    tags: {
      type: 'api_error',
      endpoint: context.endpoint,
      method: context.method,
      status_code: context.statusCode,
    },
    contexts: {
      api: {
        endpoint: context.endpoint,
        method: context.method,
        statusCode: context.statusCode,
      },
    },
    user: context.userId ? { id: context.userId } : undefined,
    extra: {
      buildingId: context.buildingId,
    },
  });
}

/**
 * Track Supabase errors
 */
export function trackSupabaseError(
  error: Error,
  context: {
    table?: string;
    operation: 'select' | 'insert' | 'update' | 'delete' | 'rpc';
    userId?: string;
  }
) {
  Sentry.captureException(error, {
    tags: {
      type: 'supabase_error',
      table: context.table,
      operation: context.operation,
    },
    contexts: {
      supabase: {
        table: context.table,
        operation: context.operation,
      },
    },
    user: context.userId ? { id: context.userId } : undefined,
  });
}

/**
 * Track WhatsApp/Twilio errors
 */
export function trackWhatsAppError(
  error: Error,
  context: {
    phone: string;
    buildingId: string;
    messageType: 'broadcast' | 'conversation' | 'auto_response';
  }
) {
  Sentry.captureException(error, {
    tags: {
      type: 'whatsapp_error',
      message_type: context.messageType,
    },
    contexts: {
      whatsapp: {
        phone: context.phone,
        messageType: context.messageType,
      },
    },
    extra: {
      buildingId: context.buildingId,
    },
  });
}

/**
 * Track AI (Anthropic) errors
 */
export function trackAIError(
  error: Error,
  context: {
    model: string;
    prompt?: string;
    buildingId?: string;
  }
) {
  Sentry.captureException(error, {
    tags: {
      type: 'ai_error',
      model: context.model,
    },
    contexts: {
      ai: {
        model: context.model,
        promptLength: context.prompt?.length,
      },
    },
    extra: {
      buildingId: context.buildingId,
      // Don't send full prompt for privacy
      promptPreview: context.prompt?.substring(0, 100),
    },
  });
}

/**
 * Track Stripe payment errors
 */
export function trackPaymentError(
  error: Error,
  context: {
    userId: string;
    amount?: number;
    currency?: string;
    paymentMethod?: string;
  }
) {
  Sentry.captureException(error, {
    tags: {
      type: 'payment_error',
    },
    contexts: {
      payment: {
        amount: context.amount,
        currency: context.currency,
        paymentMethod: context.paymentMethod,
      },
    },
    user: { id: context.userId },
  });
}

/**
 * Track custom events (non-errors)
 */
export function trackEvent(
  eventName: string,
  data?: Record<string, any>
) {
  Sentry.captureMessage(eventName, {
    level: 'info',
    extra: data,
  });
}

/**
 * Set user context for error tracking
 */
export function setUserContext(user: {
  id: string;
  email?: string;
  buildingId?: string;
  role?: string;
}) {
  Sentry.setUser({
    id: user.id,
    email: user.email,
  });

  Sentry.setContext('building', {
    buildingId: user.buildingId,
    role: user.role,
  });
}

/**
 * Clear user context (on logout)
 */
export function clearUserContext() {
  Sentry.setUser(null);
}
