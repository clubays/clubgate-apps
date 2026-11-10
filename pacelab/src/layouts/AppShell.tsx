import React, { useState } from 'react';
import { NavLink, Outlet, useMatches } from 'react-router-dom';
import { Logo } from '@/components/brand/Logo';
import { Segmented } from '@/components/ui/Segmented';
import { useSettingsStore } from '@/store/settingsStore';
import { cn } from '@/utils/cn';
import {
  Activity,
  Compass,
  Sliders,
  History,
  BookOpen,
  Film,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  Home as HomeIcon,
  Video,
} from 'lucide-react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export const AppShell: React.FC = () => {
  useDocumentTitle();
  const [collapsed, setCollapsed] = useState(false);
  const { units, setUnits, theme, toggleTheme } = useSettingsStore();
  const matches = useMatches();

  // Extract breadcrumbs from route handles
  const currentCrumb = [...matches].reverse().find(
    (m) => m.handle && typeof m.handle === 'object' && 'crumb' in (m.handle as Record<string, unknown>)
  );
  const crumbText = currentCrumb ? (currentCrumb.handle as { crumb: string }).crumb : 'Dashboard';

  const navItems = [
    { to: '/', label: 'Dashboard', icon: HomeIcon, end: true },
    { to: '/calibrate', label: 'Calibrate', icon: Compass },
    { to: '/live', label: 'Live Tracking', icon: Activity, highlight: true },
    { to: '/analyze', label: 'Analyze Video', icon: Film },
    { to: '/sessions', label: 'Sessions', icon: History },
    { to: '/guide', label: 'Field Guide', icon: BookOpen },
    { to: '/settings', label: 'Settings', icon: Sliders },
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--bg)] text-[var(--text)] font-sans">
      {/* Desktop Sidebar (240px -> 72px) */}
      <aside
        className={cn(
          'hidden md:flex flex-col border-r border-[var(--line)] bg-[var(--surface)] transition-all duration-300 z-30 select-none flex-shrink-0',
          collapsed ? 'w-[72px]' : 'w-[240px]'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-[var(--line)]">
          {!collapsed ? (
            <Logo size="sm" showBadge />
          ) : (
            <div className="mx-auto">
              <Logo size="sm" showBadge={false} />
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className={cn(
              'p-1.5 rounded-[4px] text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] cursor-pointer transition-colors',
              collapsed && 'hidden'
            )}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-2.5 py-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-[4px] text-xs font-mono font-medium transition-all duration-150 cursor-pointer',
                    isActive
                      ? 'bg-[var(--accent)] text-[#05080c] font-semibold shadow-xs'
                      : item.highlight
                      ? 'text-[var(--speed)] bg-[var(--speed)]/10 hover:bg-[var(--speed)]/20 border border-[var(--speed)]/30'
                      : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)]',
                    collapsed && 'justify-center px-0'
                  )
                }
                title={collapsed ? item.label : undefined}
              >
                <Icon className={cn('w-4 h-4 flex-shrink-0', item.highlight && !collapsed && 'text-[var(--speed)]')} />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* Collapsed Toggle Button */}
        {collapsed && (
          <div className="p-3 border-t border-[var(--line)] flex justify-center">
            <button
              onClick={() => setCollapsed(false)}
              className="p-1.5 rounded text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-14 sm:h-16 border-b border-[var(--line)] bg-[var(--surface)] px-4 sm:px-6 flex items-center justify-between gap-4 z-20 flex-shrink-0">
          {/* Breadcrumb / Page Title */}
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="hidden sm:inline font-mono text-xs text-[var(--muted)]">PACELAB //</span>
            <h1 className="font-heading font-semibold text-sm sm:text-base text-[var(--text)] tracking-tight truncate">
              {crumbText}
            </h1>
          </div>

          {/* Right Controls: Units Selector + Theme Toggle */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <Segmented
              size="sm"
              value={units}
              onChange={(u) => setUnits(u as typeof units)}
              options={[
                { value: 'km/h', label: 'KM/H' },
                { value: 'mph', label: 'MPH' },
                { value: 'm/s', label: 'M/S' },
              ]}
            />

            <button
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'night' ? 'Day' : 'Night'} mode`}
              className="p-2 rounded-[4px] border border-[var(--line)] bg-[var(--surface-2)] text-[var(--text)] hover:border-[var(--accent)] hover:text-[var(--accent)] cursor-pointer transition-colors"
            >
              {theme === 'night' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* Page Body Viewport */}
        <main className="flex-1 overflow-y-auto relative pb-20 md:pb-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Tab Bar (Safe-Area aware) */}
      <nav
        aria-label="Mobile navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 h-16 border-t border-[var(--line)] bg-[var(--surface)]/95 backdrop-blur-md flex items-center justify-around px-2 z-40 select-none pb-[env(safe-area-inset-bottom)]"
      >
        {[
          { to: '/', label: 'Home', icon: HomeIcon, end: true },
          { to: '/live', label: 'Live', icon: Activity, highlight: true },
          { to: '/sessions', label: 'Sessions', icon: History },
          { to: '/settings', label: 'Settings', icon: Sliders },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 text-[10px] font-mono transition-colors cursor-pointer',
                  isActive
                    ? 'text-[var(--accent)] font-semibold'
                    : item.highlight
                    ? 'text-[var(--speed)]'
                    : 'text-[var(--muted)] hover:text-[var(--text)]'
                )
              }
            >
              <Icon className={cn('w-5 h-5 mb-0.5', item.highlight && 'stroke-2')} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};
