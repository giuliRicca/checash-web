'use client';

import { Suspense } from 'react';
import { Plus } from 'lucide-react';

import { SuspenseLoader } from '~components/SuspenseLoader';
import { Button } from '~components/ui';
import { AuthenticatedApp, useAuth } from '~features/auth';
import { AccountsOverview, FirstAccountOnboarding, useAccountsQuery, useNetWorthQuery } from '~features/accounts';
import { useAddTransaction } from '~features/transactions';
import type { NetWorthRead } from '~types/api';

function formatMoney(value: string, currency: string): string {
  return `${currency} ${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function DashboardContent(): JSX.Element {
  const { data: accounts } = useAccountsQuery();
  const { data: netWorth } = useNetWorthQuery();

  return (
    <div className="flex w-full flex-col gap-8 pb-20 lg:pb-0">
      <DashboardHeader />
      <BalanceHero netWorth={netWorth} accountCount={accounts.length} />
      <AccountsOverview accounts={accounts} netWorth={netWorth} />
      {accounts.length === 0 ? <FirstAccountOnboarding /> : null}
    </div>
  );
}

function DashboardHeader(): JSX.Element {
  const { user } = useAuth();
  const name = user?.email.split('@')[0] ?? 'there';

  return (
    <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-sm font-semibold text-brand">CheCash overview</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Hi, {name}</h1>
        <p className="mt-2 text-base text-muted">Balances, accounts, and quick capture in one place.</p>
      </div>
    </header>
  );
}

interface BalanceHeroProps {
  netWorth: NetWorthRead;
  accountCount: number;
}

function BalanceHero({ netWorth, accountCount }: BalanceHeroProps): JSX.Element {
  const { openAddTransactionModal } = useAddTransaction();

  return (
    <section className="overflow-hidden rounded-3xl border border-primary/30 bg-primary text-primary-foreground shadow-xl shadow-primary/10">
      <div className="relative p-5 sm:p-7">
        <div className="absolute right-4 top-4 size-24 rounded-full bg-brand/25 blur-2xl" aria-hidden="true" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-primary-foreground/75">Total picture</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-primary-foreground/65">ARS</p>
                <p className="mt-1 text-3xl font-bold tracking-tight">{formatMoney(netWorth.total_ars, 'ARS')}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-primary-foreground/65">USD</p>
                <p className="mt-1 text-3xl font-bold tracking-tight">{formatMoney(netWorth.total_usd, 'USD')}</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-primary-foreground/75">{accountCount} {accountCount === 1 ? 'account' : 'accounts'} connected</p>
          </div>
          <Button className="bg-brand text-brand-foreground hover:bg-brand/90 sm:min-w-44" type="button" onClick={openAddTransactionModal}>
            <Plus size={18} />
            Add movement
          </Button>
        </div>
      </div>
    </section>
  );
}

export function Dashboard(): JSX.Element {
  return (
    <AuthenticatedApp>
      <Suspense fallback={<SuspenseLoader label="Loading dashboard" />}>
        <DashboardContent />
      </Suspense>
    </AuthenticatedApp>
  );
}

export default Dashboard;
