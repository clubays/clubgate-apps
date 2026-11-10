import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Home, Compass } from 'lucide-react';

export const Component: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <Card withBrackets className="p-8 sm:p-12 text-center max-w-md w-full space-y-4">
        <div className="font-mono text-5xl font-bold text-[var(--accent)]">
          404
        </div>
        <h2 className="text-xl font-heading font-semibold text-[var(--text)]">
          Sector Not Located
        </h2>
        <p className="text-xs font-mono text-[var(--muted)]">
          The requested coordinate or session does not exist in local telemetry storage.
        </p>

        <div className="flex items-center justify-center gap-3 pt-4">
          <Link to="/">
            <Button variant="accent">
              <Home className="w-4 h-4 mr-1.5" />
              Return to Dashboard
            </Button>
          </Link>

          <Link to="/live">
            <Button variant="secondary">
              <Compass className="w-4 h-4 mr-1.5" />
              Live Radar
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};
