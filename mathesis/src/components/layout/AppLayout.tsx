import React from "react";
import { Outlet } from "react-router-dom";
import { X } from "lucide-react";
import { Topbar } from "./Topbar";
import { Sidebar } from "./Sidebar";
import { SearchPalette } from "./SearchPalette";
import { useApp } from "../../context/AppContext";

export const AppLayout: React.FC = () => {
  const { mobileMenuOpen, setMobileMenuOpen, toastMessage } = useApp();

  return (
    <div className="min-h-screen flex flex-col">
      <Topbar />

      {/* Main Grid Shell */}
      <div className="flex-1 w-full max-w-[1500px] mx-auto grid grid-cols-1 md:grid-cols-[280px_minmax(0,1fr)] min-h-[calc(100vh-56px)]">
        {/* Desktop Sidebar */}
        <div className="hidden md:block border-r border-[var(--line)] sticky top-14 h-[calc(100vh-56px)] bg-[var(--bg)]/40">
          <Sidebar />
        </div>

        {/* Content View */}
        <main className="min-w-0">
          <Outlet />
        </main>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed top-0 bottom-0 left-0 w-[84vw] max-w-[320px] bg-[var(--panel)] border-r border-[var(--line)] shadow-2xl z-50 flex flex-col">
            <div className="h-14 px-4 border-b border-[var(--line)] flex items-center justify-between">
              <span className="font-serif font-bold text-lg text-[var(--ink)]">
                Course Contents
              </span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 text-[var(--muted)] hover:text-[var(--ink)] rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <Sidebar onLinkClick={() => setMobileMenuOpen(false)} />
            </div>
          </div>
        </div>
      )}

      {/* Search Palette Dialog */}
      <SearchPalette />

      {/* Floating Toast Notification */}
      <div
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 font-mono text-xs px-4 py-2 bg-[var(--ink)] text-[var(--panel)] rounded shadow-xl pointer-events-none transition-all duration-200 ${
          toastMessage
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-3 pointer-events-none"
        }`}
      >
        {toastMessage}
      </div>
    </div>
  );
};
