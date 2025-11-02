'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to Sentry
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
          <div className="max-w-md text-center space-y-4">
            <h2 className="text-2xl font-bold">Algo salió mal</h2>
            <p className="text-muted-foreground">
              Lo sentimos, ocurrió un error inesperado. Nuestro equipo ha sido notificado.
            </p>
            {error.digest && (
              <p className="text-xs text-muted-foreground">
                Error ID: {error.digest}
              </p>
            )}
            <div className="flex gap-4 justify-center">
              <Button onClick={reset}>Intentar nuevamente</Button>
              <Button variant="outline" onClick={() => window.location.href = '/'}>
                Ir al inicio
              </Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
