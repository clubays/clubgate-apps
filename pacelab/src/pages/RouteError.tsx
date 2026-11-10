import React from 'react';
import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

export const RouteError: React.FC = () => {
  const error = useRouteError();

  let title = 'Telemetry Fault';
  let message = 'An unexpected error occurred while processing the telemetry pipeline.';

  if (isRouteErrorResponse(error)) {
    title = `${error.status} ${error.statusText}`;
    message = error.data?.message || error.statusText || message;
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <div className="min-h-screen w-screen bg-[var(--bg)] text-[var(--text)] flex items-center justify-center p-4">
      <Card withBrackets className="p-8 sm:p-12 text-center max-w-lg w-full space-y-4 shadow-2xl">
        <div className="w-14 h-14 rounded-full bg-[var(--danger)]/15 border border-[var(--danger)]/30 text-[var(--danger)] flex items-center justify-center mx-auto mb-2">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <h1 className="text-xl sm:text-2xl font-bold font-heading text-[var(--text)]">
          {title}
        </h1>

        <p className="text-xs font-mono text-[var(--muted)] leading-relaxed bg-[var(--surface-2)] p-3 rounded border border-[var(--line)]">
          {message}
        </p>

        <div className="flex items-center justify-center gap-3 pt-4">
          <Button variant="accent" onClick={() => window.location.reload()}>
            <RefreshCw className="w-4 h-4 mr-1.5" />
            Retry
          </Button>

          <Link to="/">
            <Button variant="secondary">
              <Home className="w-4 h-4 mr-1.5" />
              Return Home
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};
