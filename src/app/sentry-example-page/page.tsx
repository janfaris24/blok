"use client";

import { Button } from "@/components/ui/button";
import * as Sentry from "@sentry/nextjs";

export default function SentryExamplePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 gap-8">
      <div className="max-w-2xl w-full space-y-8 text-center">
        <div>
          <h1 className="text-4xl font-bold mb-4">Sentry Test Page</h1>
          <p className="text-lg text-muted-foreground">
            Click the buttons below to test Sentry error tracking
          </p>
        </div>

        <div className="space-y-4">
          {/* Client-side error test */}
          <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-3">
              Test 1: Client-Side Error (Direct Capture)
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Directly captures an error to Sentry - guaranteed to work!
            </p>
            <Button
              onClick={() => {
                const error = new Error("Sentry Test Error - Client Side Direct Capture");
                Sentry.captureException(error, {
                  tags: {
                    test_type: 'client_direct',
                    location: 'test_page',
                  },
                  extra: {
                    timestamp: new Date().toISOString(),
                  },
                });
                alert('Error sent to Sentry! Check your dashboard.');
              }}
              variant="destructive"
            >
              Send Error to Sentry
            </Button>
          </div>

          {/* Manually captured error */}
          <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-3">
              Test 2: Manually Captured Error
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Manually captures an error with custom context
            </p>
            <Button
              onClick={() => {
                try {
                  throw new Error("Manually Captured Test Error");
                } catch (error) {
                  Sentry.captureException(error, {
                    tags: {
                      test_type: "manual_capture",
                    },
                    contexts: {
                      test: {
                        description: "This is a test error from the example page",
                        timestamp: new Date().toISOString(),
                      },
                    },
                  });
                }
              }}
              variant="outline"
            >
              Capture Error with Context
            </Button>
          </div>

          {/* Async error test */}
          <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-3">
              Test 3: Async Error
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Throws an error in an async function
            </p>
            <Button
              onClick={async () => {
                await new Promise((resolve) => setTimeout(resolve, 100));
                throw new Error("Sentry Test Error - Async");
              }}
              variant="secondary"
            >
              Throw Async Error
            </Button>
          </div>

          {/* Backend test */}
          <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-3">
              Test 4: Backend API Error
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Triggers a backend error that Sentry will capture
            </p>
            <Button
              onClick={async () => {
                try {
                  const response = await fetch('/api/test-sentry');
                  const data = await response.json();
                  alert(data.message);
                } catch (error) {
                  alert('Error sent to Sentry from backend!');
                }
              }}
              variant="secondary"
            >
              Test Backend Error
            </Button>
          </div>

          {/* Message test */}
          <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-3">
              Test 5: Info Message
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Sends an info-level message to Sentry (not an error)
            </p>
            <Button
              onClick={() => {
                Sentry.captureMessage("Test message from example page", {
                  level: "info",
                  tags: {
                    test_type: "message",
                  },
                });
                alert('Message sent to Sentry!');
              }}
            >
              Send Info Message
            </Button>
          </div>

          {/* Slack Alert Test - Creates NEW issue every time */}
          <div className="p-6 border rounded-lg bg-blue-50 dark:bg-blue-950">
            <h2 className="text-xl font-semibold mb-3">
              🔔 Test 6: Slack Alert Test
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Creates a UNIQUE error each time to trigger Slack notifications
            </p>
            <Button
              onClick={() => {
                const timestamp = new Date().toISOString();
                const error = new Error(`Slack Alert Test - ${timestamp}`);
                Sentry.captureException(error, {
                  tags: {
                    test_type: 'slack_alert_test',
                    location: 'test_page',
                  },
                  extra: {
                    timestamp,
                    note: 'This should trigger a Slack notification!',
                  },
                });
                alert('New error created! Check #all-blok in Slack!');
              }}
              variant="default"
              className="bg-blue-600 hover:bg-blue-700"
            >
              🔔 Trigger Slack Alert
            </Button>
          </div>
        </div>

        <div className="p-4 bg-muted rounded-lg text-left text-sm">
          <h3 className="font-semibold mb-2">📋 What to check:</h3>
          <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
            <li>Click any button above</li>
            <li>
              Go to{" "}
              <a
                href="https://blok-4e.sentry.io/issues/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                Sentry Issues Dashboard
              </a>
            </li>
            <li>You should see the error appear within a few seconds</li>
            <li>Click on the error to see full details</li>
            <li>Check for Session Replay (video of what happened)</li>
          </ol>
        </div>

        <div className="flex gap-4 justify-center">
          <Button asChild variant="outline">
            <a href="/">Back to Home</a>
          </Button>
          <Button asChild>
            <a
              href="https://blok-4e.sentry.io/issues/"
              target="_blank"
              rel="noopener noreferrer"
            >
              View Sentry Dashboard →
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
