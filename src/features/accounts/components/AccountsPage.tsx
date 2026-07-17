'use client';

import { Plus } from 'lucide-react';
import { Suspense, useCallback, useState } from 'react';

import { SuspenseLoader } from '~components/SuspenseLoader';
import { Button } from '~components/ui';
import { AccountCreateModal, AccountsOverview, FirstAccountOnboarding, useAccountsQuery } from '~features/accounts';
import { AuthenticatedApp, useAuth } from '~features/auth';

function requireToken(token: string | null): string {
  if (token === null) {
    throw new Error('Accounts requires an authenticated session');
  }
  return token;
}

function AccountsContent(): JSX.Element {
  const { token, user } = useAuth();
  const authToken = requireToken(token);
  if (user === null) throw new Error('Accounts require current user');
  const { data: accounts } = useAccountsQuery(authToken, user.id);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleOpenCreateModal = useCallback((): void => {
    setIsCreateModalOpen(true);
  }, []);

  const handleCloseCreateModal = useCallback((): void => {
    setIsCreateModalOpen(false);
  }, []);

  return (
    <div className="flex w-full flex-col gap-8 pb-20 lg:pb-0">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-primary">Money containers</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Accounts</h1>
          <p className="mt-2 text-base text-muted">Review balances and open an account to edit details or inspect activity.</p>
        </div>
        <Button className="w-full sm:w-auto" type="button" onClick={handleOpenCreateModal}>
          <Plus size={17} />
          Add account
        </Button>
      </header>

      <AccountsOverview accounts={accounts} />
      {accounts.length === 0 ? <FirstAccountOnboarding onCreateAccount={handleOpenCreateModal} /> : null}
      {isCreateModalOpen ? <AccountCreateModal onClose={handleCloseCreateModal} /> : null}
    </div>
  );
}

export function AccountsPage(): JSX.Element {
  return (
    <AuthenticatedApp>
      <Suspense fallback={<SuspenseLoader label="Loading accounts" />}>
        <AccountsContent />
      </Suspense>
    </AuthenticatedApp>
  );
}

export default AccountsPage;
