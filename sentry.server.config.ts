import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://355f9ed410f772883cdb8c26f79702ec@o4510290975064064.ingest.us.sentry.io/4510291014320128",

  // Performance Monitoring - capture 100% in dev, 10% in production
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Environment
  environment: process.env.NODE_ENV,

  // Ignore specific errors
  ignoreErrors: [
    // Supabase auth refresh errors (normal behavior)
    "refresh_token_not_found",
    "invalid_grant",
    "AuthSessionMissingError",
  ],

  beforeSend(event) {
    // Log all errors (still send to Sentry in dev for testing)
    console.log('🔴 Sentry Server Error:', event);

    // Add custom tags for easier filtering
    event.tags = {
      ...event.tags,
      service: 'blok-api',
    };

    return event;
  },

  // Add integrations for tracking
  integrations: [
    // Capture console errors
    Sentry.captureConsoleIntegration({
      levels: ['error'],
    }),
  ],
});
