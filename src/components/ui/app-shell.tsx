'use client';

import { BarChart3, Landmark, LayoutDashboard, LogOut, MessageCircle, Moon, Plus, Settings, Sun, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/ui/cn';
import { useAddTransaction } from '~features/transactions';
import { useTheme } from '~features/theme';

interface AppShellProps {
  children: ReactNode;
  onLogout: () => void;
}

interface NavItemProps {
  href?: string;
  icon: ReactNode;
  label: string;
  isActive?: boolean;
}

function NavItem({ href, icon, label, isActive = false }: NavItemProps): JSX.Element {
  const className = cn(
    'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    isActive ? 'bg-primary-muted text-primary' : 'text-muted hover:bg-surface-muted hover:text-foreground',
    href === undefined ? 'cursor-default opacity-75' : undefined,
  );

  if (href === undefined) {
    return (
      <button className={className} type="button">
        {icon}
        <span>{label}</span>
      </button>
    );
  }

  return (
    <Link className={className} href={href}>
      {icon}
      <span>{label}</span>
    </Link>
  );
}

function MobileNavItem({ href, icon, label, isActive = false }: NavItemProps): JSX.Element {
  const className = cn(
    'flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl px-2 text-[11px] font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    isActive ? 'bg-primary-muted text-primary' : 'text-muted hover:bg-surface-muted hover:text-foreground',
    href === undefined ? 'cursor-default opacity-75' : undefined,
  );

  if (href === undefined) {
    return (
      <button className={className} type="button">
        {icon}
        <span>{label}</span>
      </button>
    );
  }

  return (
    <Link className={className} href={href}>
      {icon}
      <span>{label}</span>
    </Link>
  );
}

export function AppShell({ children, onLogout }: AppShellProps): JSX.Element {
  const { state, actions } = useTheme();
  const { openAddTransactionModal } = useAddTransaction();
  const pathname = usePathname();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const isDark = state.resolvedTheme === 'dark';
  const themeLabel = isDark ? 'Switch to light mode' : 'Switch to dark mode';
  const isAccountsActive = pathname === '/accounts' || pathname.startsWith('/accounts/');

  function handleLogout(): void {
    setIsUserMenuOpen(false);
    onLogout();
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <a className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-xl focus:bg-surface focus:px-4 focus:py-3 focus:text-sm focus:font-semibold focus:text-foreground focus:ring-2 focus:ring-primary" href="#main-content">
        Skip to main content
      </a>
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-lg font-bold text-primary-foreground shadow-sm shadow-primary/30">$</div>
            <span className="text-xl font-bold tracking-tight text-foreground">CheCash</span>
          </div>

          <nav className="hidden items-center gap-2 lg:flex" aria-label="Primary navigation">
            <NavItem href="/" icon={<LayoutDashboard size={16} />} label="Dashboard" isActive={pathname === '/'} />
            <NavItem href="/chat" icon={<MessageCircle size={16} />} label="Chat" isActive={pathname === '/chat'} />
            <NavItem icon={<BarChart3 size={16} />} label="Budgets" />
            <NavItem href="/accounts" icon={<Landmark size={16} />} label="Accounts" isActive={isAccountsActive} />
          </nav>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" type="button" aria-label={themeLabel} title={themeLabel} onClick={actions.toggleTheme}>
              {isDark ? <Sun size={17} /> : <Moon size={17} />}
            </Button>
            <Button className="hidden sm:inline-flex" type="button" onClick={openAddTransactionModal}>
              <Plus size={17} />
              Add Transaction
            </Button>
            <div className="relative">
              <Button
                variant="secondary"
                size="sm"
                type="button"
                aria-expanded={isUserMenuOpen}
                aria-label="Open user menu"
                onClick={() => setIsUserMenuOpen((current) => !current)}
              >
                <User size={17} />
              </Button>
              {isUserMenuOpen ? (
                <div className="absolute right-0 mt-2 w-44 overflow-hidden rounded-2xl border border-border bg-surface shadow-lg">
                  <Link
                    className="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-muted transition hover:bg-surface-muted hover:text-foreground"
                    href="/settings"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <Settings size={16} />
                    Settings
                  </Link>
                  <button
                    className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-semibold text-danger transition hover:bg-danger-muted"
                    type="button"
                    onClick={handleLogout}
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </header>
      <main id="main-content" className="mx-auto w-full max-w-7xl px-4 py-6 pb-32 sm:px-8 lg:py-10 lg:pb-10">
        {children}
      </main>
      <button
        className="fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom))] left-1/2 z-30 flex size-14 -translate-x-1/2 touch-manipulation items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-2xl shadow-primary/30 transition duration-200 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-95 sm:hidden"
        type="button"
        aria-label="Add transaction"
        onClick={openAddTransactionModal}
      >
        <Plus size={24} />
      </button>
      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/95 px-3 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 backdrop-blur lg:hidden" aria-label="Mobile navigation">
        <div className="mx-auto grid max-w-md grid-cols-4 gap-1">
          <MobileNavItem href="/" icon={<LayoutDashboard size={18} />} label="Home" isActive={pathname === '/'} />
          <MobileNavItem href="/chat" icon={<MessageCircle size={18} />} label="Chat" isActive={pathname === '/chat'} />
          <MobileNavItem icon={<BarChart3 size={18} />} label="Budget" />
          <MobileNavItem href="/accounts" icon={<Landmark size={18} />} label="Accounts" isActive={isAccountsActive} />
        </div>
      </nav>
    </div>
  );
}
