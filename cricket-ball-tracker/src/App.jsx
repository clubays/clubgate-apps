import React, { Component, lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import Spinner from './components/ui/Spinner.jsx';
import Button from './components/ui/Button.jsx';
import { RefreshCw } from 'lucide-react';

// Lazy-load every page except HomePage as requested in Section 3
const SetupGuidePage = lazy(() => import('./pages/SetupGuidePage.jsx'));
const AnalyzePage = lazy(() => import('./pages/AnalyzePage.jsx'));
const LivePage = lazy(() => import('./pages/LivePage.jsx'));
const SessionsPage = lazy(() => import('./pages/SessionsPage.jsx'));
const SessionDetailPage = lazy(() => import('./pages/SessionDetailPage.jsx'));
const SelfTestPage = lazy(() => import('./pages/SelfTestPage.jsx'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage.jsx'));

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Application error caught by ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0b0f14] text-[#e8eef5] flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#e5473f]/20 border border-[#e5473f] flex items-center justify-center text-[#e5473f] mb-4">
            <RefreshCw className="w-8 h-8" />
          </div>
          <h1 className="font-condensed text-3xl font-bold uppercase mb-2">
            Something went wrong
          </h1>
          <p className="text-sm text-[#8a9ab0] max-w-md mb-6">
            An unexpected error occurred in the tracking engine: {this.state.error?.message}
          </p>
          <Button
            variant="primary"
            icon={RefreshCw}
            onClick={() => window.location.reload()}
          >
            Reload Application
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <Suspense
        fallback={
          <div className="min-h-screen bg-[#0b0f14] flex items-center justify-center">
            <Spinner size="lg" />
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/guide" element={<SetupGuidePage />} />
          <Route path="/analyze" element={<AnalyzePage />} />
          <Route path="/analyze/:sessionId" element={<AnalyzePage />} />
          <Route path="/live" element={<LivePage />} />
          <Route path="/sessions" element={<SessionsPage />} />
          <Route path="/sessions/:sessionId" element={<SessionDetailPage />} />
          <Route path="/selftest" element={<SelfTestPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
