import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';

export async function GET() {
  try {
    // Test 1: Throw an error
    throw new Error('Test Backend Error from API Route');
  } catch (error) {
    // Manually capture it
    Sentry.captureException(error, {
      tags: {
        test_type: 'api_route',
        location: '/api/test-sentry',
      },
      extra: {
        message: 'This is a test error from the backend API',
        timestamp: new Date().toISOString(),
      },
    });

    return NextResponse.json(
      {
        error: 'Test error sent to Sentry!',
        message: 'Check your Sentry dashboard at https://blok-4e.sentry.io/issues/',
      },
      { status: 500 }
    );
  }
}
