import React from 'react';
import { Outlet } from 'react-router-dom';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export const FocusLayout: React.FC = () => {
  useDocumentTitle('Live Radar | PaceLab');

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black text-[var(--text)] font-sans select-none touch-none">
      <Outlet />
    </div>
  );
};
