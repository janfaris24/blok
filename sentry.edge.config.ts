import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://355f9ed410f772883cdb8c26f79702ec@o4510290975064064.ingest.us.sentry.io/4510291014320128",

  // Performance Monitoring - capture 100% in dev, 10% in production
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Environment
  environment: process.env.NODE_ENV,

  beforeSend(event) {
    // Don't send errors in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🔴 Sentry Edge Error (dev - not sent):', event);
      return null;
    }

    // Add custom tags for edge runtime
    event.tags = {
      ...event.tags,
      runtime: 'edge',
    };

    return event;
  },
});
