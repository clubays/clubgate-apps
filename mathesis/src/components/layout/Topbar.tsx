import React from "react";
import { Link } from "react-router-dom";
import { Menu, Search, Sun, Moon } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { ProgressRing } from "../common/ProgressRing";

interface TopbarProps {
  breadcrumb?: React.ReactNode;
}

export const Topbar: React.FC<TopbarProps> = ({ breadcrumb }) => {
  const { theme, toggleTheme, overallProgress, setSearchOpen, setMobileMenuOpen } = useApp();

  const isMac = typeof navigator !== "undefined" && navigator.platform?.toUpperCase().indexOf("MAC") >= 0;

  return (
    <header className="sticky top-0 z-30 h-14 flex items-center gap-3.5 px-5 border-b border-[var(--line)] bg-[var(--bg)]/90 backdrop-blur-md transition-colors duration-300">
      <button
        onClick={() => setMobileMenuOpen(true)}
        className="md:hidden w-9 h-9 rounded flex items-center justify-center text-[var(--ink)] hover:bg-[var(--chip)] transition-colors"
        aria-label="Open contents"
      >
        <Menu className="w-5 h-5" />
      </button>

      <Link to="/" className="flex items-center gap-2.5 group">
        <div className="w-7 h-7 border-[1.5px] border-[var(--ink)] rounded flex items-center justify-center font-serif italic text-lg leading-none bg-[var(--panel)] shadow-sm group-hover:border-[var(--accent)] transition-colors">
          ∫
        </div>
        <div className="font-serif font-bold text-xl tracking-tight text-[var(--ink)]">
          Mathesis
        </div>
      </Link>

      {breadcrumb && (
        <nav
          className="hidden sm:flex items-center gap-2 ml-2 font-mono text-[11px] text-[var(--muted)] whitespace-nowrap overflow-hidden text-ellipsis"
          aria-label="Breadcrumb"
        >
          {breadcrumb}
        </nav>
      )}

      <div className="flex-1" />

      <button
        onClick={() => setSearchOpen(true)}
        className="h-8.5 sm:min-w-[240px] px-2.5 sm:px-3 bg-[var(--panel)] border border-[var(--line)] rounded flex items-center gap-2 text-[var(--muted)] text-[12.5px] hover:border-[var(--accent)] hover:text-[var(--ink)] transition-all shadow-xs"
        aria-label="Search lessons and formulas"
      >
        <Search className="w-4 h-4 shrink-0" />
        <span className="hidden sm:inline">Search lessons & formulas…</span>
        <kbd className="hidden sm:inline-block ml-auto font-mono text-[10px] bg-[var(--chip)] px-1.5 py-0.5 rounded text-[var(--ink)] border border-[var(--line)]">
          {isMac ? "⌘K" : "Ctrl K"}
        </kbd>
      </button>

      <button
        onClick={toggleTheme}
        className="w-8.5 h-8.5 rounded flex items-center justify-center text-[var(--ink)] hover:bg-[var(--chip)] transition-colors"
        title={theme === "board" ? "Switch to paper theme" : "Switch to blackboard theme"}
        aria-label="Toggle theme"
      >
        {theme === "board" ? (
          <Sun className="w-4.5 h-4.5 text-[var(--accent)]" />
        ) : (
          <Moon className="w-4.5 h-4.5" />
        )}
      </button>

      <div className="ml-1" title={`Overall course completion: ${overallProgress.pct}%`}>
        <ProgressRing size={30} pct={overallProgress.pct}>
          {overallProgress.pct}%
        </ProgressRing>
      </div>
    </header>
  );
};
