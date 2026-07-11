'use client';

import type { ReactNode } from 'react';

import { SuspenseLoader } from '~components/SuspenseLoader';
import { AppShell } from '~components/ui';
import { AuthCard } from '~features/auth/components/AuthCard';
import { useAuth } from '~features/auth/hooks/use-auth';
import { AddTransactionProvider } from '~features/transactions';

interface AuthenticatedAppProps {
  children: ReactNode;
}

export function AuthenticatedApp({ children }: AuthenticatedAppProps): JSX.Element {
  const { logout, token, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return (
      <main className="min-h-screen bg-background p-6 text-foreground">
        <SuspenseLoader label="Restoring session" />
      </main>
    );
  }

  if (token === null) {
    return (
      <main className="flex min-h-screen items-center bg-background p-6 text-foreground">
        <AuthCard />
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
