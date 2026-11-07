/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense, useState, useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Topbar } from '@/components/layout/Topbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileDrawer } from '@/components/layout/MobileDrawer';
import { BottomNav } from '@/components/layout/BottomNav';
import { useSettingsStore } from '@/store/useSettingsStore';

// Code-split routes with React.lazy
const HomePage = React.lazy(() => import('@/pages/HomePage'));
const LessonsPage = React.lazy(() => import('@/pages/LessonsPage'));
const LessonPage = React.lazy(() => import('@/pages/LessonPage'));
const ModelsPage = React.lazy(() => import('@/pages/ModelsPage'));
const GlossaryPage = React.lazy(() => import('@/pages/GlossaryPage'));
const SettingsPage = React.lazy(() => import('@/pages/SettingsPage'));
const NotFoundPage = React.lazy(() => import('@/pages/NotFoundPage'));

function RouteLoadingFallback() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center min-h-[50vh]">
      <div className="w-8 h-8 border-2 border-amber-600/30 border-t-amber-600 rounded-full animate-spin mb-3" />
      <span className="text-xs font-mono text-stone-500">Loading Bioverse Module...</span>
    </div>
  );
}

function AppContent() {
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const location = useLocation();
  const { theme, language } = useSettingsStore();

  // Apply dark class and RTL direction on mount/change
  useEffect(() => {
    if (theme === 'lab') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    document.documentElement.dir = language === 'he' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  // Determine if sidebar should be shown on desktop
  const isLessonRoute = location.pathname.startsWith('/lesson/');
  const isModelsRoute = location.pathname.startsWith('/models');
  const showSidebar = !isLessonRoute && !isModelsRoute;

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f5] dark:bg-[#0c0e12] text-stone-900 dark:text-stone-100 font-sans transition-colors duration-200">
      {/* Topbar navigation */}
      <Topbar onToggleMobileDrawer={() => setIsMobileDrawerOpen(true)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-row overflow-hidden relative">
        {/* Desktop Sidebar (shown on general browsing pages) */}
        {showSidebar && (
          <div className="hidden lg:block shrink-0">
            <Sidebar />
          </div>
        )}

        {/* Page Views with Lazy Suspense Fallback */}
        <main className="flex-1 overflow-y-auto min-w-0">
          <Suspense fallback={<RouteLoadingFallback />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/lessons" element={<LessonsPage />} />
              <Route path="/lesson/:lessonId" element={<LessonPage />} />
              <Route path="/models" element={<ModelsPage />} />
              <Route path="/glossary" element={<GlossaryPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </main>
      </div>

      {/* Mobile Slide-out Drawer */}
      <MobileDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
      />

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav />
    </div>
  );
}

export default function App() {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
}
