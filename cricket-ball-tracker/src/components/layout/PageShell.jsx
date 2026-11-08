import React, { useState } from 'react';
import Header from './Header.jsx';
import Footer from './Footer.jsx';
import SettingsDrawer from '../analyze/SettingsDrawer.jsx';

export default function PageShell({ children, noFooter = false }) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f14] text-[#e8eef5]">
      <Header onOpenSettings={() => setIsSettingsOpen(true)} />
      <main className="flex-1 flex flex-col pb-16 md:pb-0 overflow-x-hidden">
        {children}
      </main>
      {!noFooter && <Footer />}
      <SettingsDrawer isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
}
