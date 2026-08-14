'use client';

import type { ReactNode } from 'react';

import { SuspenseLoader } from '~components/SuspenseLoader';
import { AppShell } from '~components/ui';
import { AuthCard } from '~features/auth/components/AuthCard';
import type { AuthMode } from '~features/auth/components/AuthCard';
import { useAuth } from '~features/auth/hooks/use-auth';
import { AddTransactionProvider } from '~features/transactions';

interface AuthenticatedAppProps {
  children: ReactNode;
  initialAuthMode?: AuthMode;
}

export function AuthenticatedApp({ children, initialAuthMode = 'login' }: AuthenticatedAppProps): JSX.Element {
  const { logout, token, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return (
      <main className="min-h-[100dvh] bg-background p-6 text-foreground">
        <SuspenseLoader label="Restaurando sesión" />
      </main>
    );
  }

  if (token === null) {
    return (
      <main className="flex min-h-[100dvh] items-center bg-background p-6 text-foreground">
        <AuthCard initialMode={initialAuthMode} />
      </main>
    );
  }

  return (
    <AddTransactionProvider>
      <AppShell onLogout={logout}>{children}</AppShell>
    </AddTransactionProvider>
  );
}

export default AuthenticatedApp;
