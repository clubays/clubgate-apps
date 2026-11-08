import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import PageShell from '../components/layout/PageShell.jsx';
import Button from '../components/ui/Button.jsx';

export default function NotFoundPage() {
  return (
    <PageShell>
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <span className="font-condensed text-8xl font-black text-[#243146]">404</span>
        <h1 className="font-condensed text-3xl font-bold text-[#e8eef5] mt-2 mb-2 uppercase">
          Delivery Not Found
        </h1>
        <p className="text-sm text-[#8a9ab0] max-w-sm mb-6">
          The pitch or analysis session you were looking for does not exist or has been removed.
        </p>
        <Link to="/">
          <Button icon={Home} variant="primary">
            Return to Home
          </Button>
        </Link>
      </div>
    </PageShell>
  );
}
