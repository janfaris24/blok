import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://355f9ed410f772883cdb8c26f79702ec@o4510290975064064.ingest.us.sentry.io/4510291014320128",

  // Performance Monitoring - capture 100% in dev, 10% in production
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Session Replay - capture 100% of errors, 10% of all sessions
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0.1,

  // Integrations
  integrations: [
    // Browser performance tracing
    Sentry.browserTracingIntegration(),

    // Session Replay
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // Distributed tracing - define your backend API URLs
  tracePropagationTargets: [
    "localhost",
    /^https:\/\/.*\.vercel\.app\//,
    /^https:\/\/blokpr\.co\//,
  ],

  // Environment
  environment: process.env.NODE_ENV,

  // Ignore specific errors
  ignoreErrors: [
    // Browser extensions
    "top.GLOBALS",
    "chrome-extension://",
    "moz-extension://",
    // Network errors
    "Network request failed",
    "NetworkError",
    "Failed to fetch",
    // Supabase auth (expected)
    "AuthSessionMissingError",
  ],

  beforeSend(event) {
    // Filter out Playwright test errors
    const userAgent = event.request?.headers?.['user-agent'] || '';
    if (userAgent.includes('Playwright') || userAgent.includes('Headless')) {
      return null; // Don't send test errors
    }

    // Filter out errors with test header
    if (event.request?.headers?.['x-test-run']) {
      return null;
    }

    // Filter out CI test environment
    if (process.env.CI && event.environment === 'test') {
      return null;
    }

    // Log all errors (still send to Sentry in dev for testing)
    console.log('🔴 Sentry Error:', event);
    return event;
  },
});
