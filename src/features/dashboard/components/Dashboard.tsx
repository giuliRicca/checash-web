'use client';

import dynamic from 'next/dynamic';
import { Suspense, useCallback, useState } from 'react';

import { SuspenseLoader } from '~components/SuspenseLoader';
import { formatMoneyWithCurrency } from '@/lib/money/format';
import { PaginatedActivityList, useActivityQuery } from '~features/activity';
import { AuthenticatedApp, useAuth } from '~features/auth';
import type { AuthMode } from '~features/auth/components/AuthCard';
import { AccountCreateModal, AccountsOverview, FirstAccountOnboarding, useAccountsQuery, useNetWorthHistoryQuery, useNetWorthQuery } from '~features/accounts';
import { useMonthSummaryQuery } from '~features/transactions';
import type { Currency, NetWorthHistoryRead, NetWorthRead, TransactionMonthSummaryRead } from '~types/api';

const NetWorthGrowthChart = dynamic(
  () => import('./NetWorthGrowthChart').then((module) => module.NetWorthGrowthChart),
  {
    loading: () => <div className="h-80 animate-pulse rounded-2xl border border-border bg-surface" aria-label="Loading net worth growth" />,
    ssr: false,
  },
);

function requireToken(token: string | null, feature: string): string {
  if (token === null) {
    throw new Error(`${feature} requires an authenticated session`);
  }
  return token;
}

function DashboardContent(): JSX.Element {
  const { token, user } = useAuth();
  const authToken = requireToken(token, 'Dashboard');
  if (user === null) throw new Error('Dashboard requires current user');

  const { data: accounts } = useAccountsQuery(authToken, user.id);
  const { data: netWorth } = useNetWorthQuery(authToken, user.id);
  const { data: netWorthHistory } = useNetWorthHistoryQuery(authToken, user.id);
  const { data: monthSummary } = useMonthSummaryQuery(authToken, user.id);
  const { activity, pageNumber, previousPage, nextPage, hasPreviousPage, hasNextPage, isLoadingPage, pageError } = useActivityQuery(authToken, user.id);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleOpenCreateModal = useCallback((): void => {
    setIsCreateModalOpen(true);
  }, []);

  const handleCloseCreateModal = useCallback((): void => {
    setIsCreateModalOpen(false);
  }, []);

  return (
    <div className="flex w-full flex-col gap-8 pb-20 lg:pb-0">
      <DashboardHeader />
      <DashboardSummary netWorth={netWorth} netWorthHistory={netWorthHistory} monthSummary={monthSummary} accountCount={accounts.length} />
      <PaginatedActivityList activity={activity} emptyMessage="No activity yet. Add a transaction or transfer to see it here." hasNextPage={hasNextPage} hasPreviousPage={hasPreviousPage} isLoadingPage={isLoadingPage} onNextPage={nextPage} onPreviousPage={previousPage} pageError={pageError} pageNumber={pageNumber} title="Latest activity" />
      <AccountsOverview accounts={accounts} />
      {accounts.length === 0 ? <FirstAccountOnboarding onCreateAccount={handleOpenCreateModal} /> : null}
      {isCreateModalOpen ? <AccountCreateModal onClose={handleCloseCreateModal} /> : null}
    </div>
  );
}

function DashboardHeader(): JSX.Element {
  const { user } = useAuth();
  const name = user?.email.split('@')[0] ?? 'there';

  return (
    <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-sm font-semibold text-primary">CheCash overview</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Hi, {name}</h1>
        <p className="mt-2 text-base text-muted">Balances, accounts, and quick capture in one place.</p>
      </div>
    </header>
  );
}

interface DashboardSummaryProps {
  netWorth: NetWorthRead;
  netWorthHistory: NetWorthHistoryRead;
  monthSummary: TransactionMonthSummaryRead;
  accountCount: number;
}

function DashboardSummary({ netWorth, netWorthHistory, monthSummary, accountCount }: DashboardSummaryProps): JSX.Element {
  const [currency, setCurrency] = useState<Currency>('ARS');
  const netWorthValue = currency === 'ARS' ? netWorth.total_ars : netWorth.total_usd;
  const incomeValue = currency === 'ARS' ? monthSummary.income_ars : monthSummary.income_usd;
  const expenseValue = currency === 'ARS' ? monthSummary.expense_ars : monthSummary.expense_usd;

  return (
    <section className="flex flex-col gap-4">
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <NetWorthCard
          accountCount={accountCount}
          currency={currency}
          value={netWorthValue}
          onCurrencyChange={setCurrency}
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <MonthlyFlowCard label="Income this month" tone="success" value={formatMoneyWithCurrency(incomeValue, currency)} />
          <MonthlyFlowCard label="Expenses this month" tone="danger" value={formatMoneyWithCurrency(expenseValue, currency)} />
        </div>
      </div>
      <NetWorthGrowthChart currency={currency} history={netWorthHistory} />
    </section>
  );
}

interface NetWorthCardProps {
  accountCount: number;
  currency: Currency;
  value: string;
  onCurrencyChange: (currency: Currency) => void;
}

function NetWorthCard({ accountCount, currency, value, onCurrencyChange }: NetWorthCardProps): JSX.Element {
  return (
    <section className="overflow-hidden rounded-3xl border border-primary/30 bg-primary text-primary-foreground shadow-xl shadow-primary/10">
      <div className="relative p-5 sm:p-7">
        <div className="absolute right-4 top-4 size-24 rounded-full bg-primary-foreground/15 blur-2xl" aria-hidden="true" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="w-full">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-semibold text-primary-foreground/75">Total net worth</p>
              <CurrencyToggle value={currency} onChange={onCurrencyChange} />
            </div>
            <p className="mt-4 break-words text-4xl font-bold tracking-tight sm:text-5xl">{formatMoneyWithCurrency(value, currency)}</p>
            <p className="mt-4 text-sm text-primary-foreground/75">{accountCount} {accountCount === 1 ? 'account' : 'accounts'} connected</p>
          </div>
        </div>
      </div>
    </section>
  );
}

interface CurrencyToggleProps {
  value: Currency;
  onChange: (currency: Currency) => void;
}

function CurrencyToggle({ value, onChange }: CurrencyToggleProps): JSX.Element {
  return (
    <div className="grid grid-cols-2 rounded-2xl border border-primary-foreground/20 bg-primary-foreground/10 p-1" aria-label="Net worth currency">
      {(['ARS', 'USD'] as const).map((currency) => (
        <button
          className={currency === value ? 'min-h-11 rounded-xl bg-primary-foreground px-4 text-xs font-bold text-primary' : 'min-h-11 rounded-xl px-4 text-xs font-bold text-primary-foreground/75 transition hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/70'}
          key={currency}
          type="button"
          aria-pressed={currency === value}
          onClick={() => onChange(currency)}
        >
          {currency}
        </button>
      ))}
    </div>
  );
}

interface MonthlyFlowCardProps {
  label: string;
  tone: 'success' | 'danger';
  value: string;
}

function MonthlyFlowCard({ label, tone, value }: MonthlyFlowCardProps): JSX.Element {
  const toneClassName = tone === 'success'
    ? 'text-success bg-success-muted border-success/30'
    : 'text-danger bg-danger-muted border-danger/30';

  return (
    <article className="rounded-3xl border border-border bg-surface p-5 shadow-sm">
      <div className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${toneClassName}`}>{label}</div>
      <p className="mt-4 break-words text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{value}</p>
    </article>
  );
}

interface DashboardProps {
  authMode?: AuthMode;
}

export function Dashboard({ authMode = 'login' }: DashboardProps): JSX.Element {
  return (
    <AuthenticatedApp initialAuthMode={authMode}>
      <Suspense fallback={<SuspenseLoader label="Loading dashboard" />}>
        <DashboardContent />
      </Suspense>
    </AuthenticatedApp>
  );
}

export default Dashboard;
