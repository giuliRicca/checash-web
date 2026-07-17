'use client';

import { ArrowDownLeft, ArrowLeft, ArrowRightLeft, ArrowUpRight, Landmark, Pencil, Save, X } from 'lucide-react';
import Link from 'next/link';
import { Suspense, useCallback, useEffect, useState } from 'react';

import { ApiError } from '@/lib/api/errors';
import { formatMoneyWithCurrency } from '@/lib/money/format';
import { cn } from '@/lib/ui/cn';
import { SuspenseLoader } from '~components/SuspenseLoader';
import { Button, Field, IconBadge, Panel, fieldControlClassName } from '~components/ui';
import { AuthenticatedApp, useAuth } from '~features/auth';
import { rateTypeOptions, useAccountDetailQueries, useUpdateAccountMutation } from '~features/accounts';
import type { AccountRead, ActivityFeed, ActivityItem, Currency, RateType } from '~types/api';

interface AccountDetailPageProps {
  accountId: string;
}

interface AccountDetailContentProps {
  accountId: string;
}

interface AccountSummaryProps {
  account: AccountRead;
  onEdit: () => void;
}

interface AccountEditModalProps {
  account: AccountRead;
  onClose: () => void;
}

interface AccountActivityListProps {
  activity: ActivityFeed;
  onLoadMore: () => void;
  hasMore: boolean;
  isLoadingMore: boolean;
}

interface ActivityRowProps {
  item: ActivityItem;
}

function requireToken(token: string | null): string {
  if (token === null) {
    throw new Error('Account details require an authenticated session');
  }
  return token;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

function AccountDetailContent({ accountId }: AccountDetailContentProps): JSX.Element {
  const { token, user } = useAuth();
  const authToken = requireToken(token);
  if (user === null) throw new Error('Account details require current user');
  const { account, activity, loadMore, hasMore, isLoadingMore } = useAccountDetailQueries(authToken, user.id, accountId);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleOpenEditModal = useCallback((): void => {
    setIsEditModalOpen(true);
  }, []);

  const handleCloseEditModal = useCallback((): void => {
    setIsEditModalOpen(false);
  }, []);

  return (
    <div className="flex w-full flex-col gap-8 pb-20 lg:pb-0">
      <div>
        <Link className="inline-flex min-h-11 items-center gap-2 rounded-xl px-1 text-sm font-semibold text-muted transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70" href="/accounts">
          <ArrowLeft size={16} />
          Back to accounts
        </Link>
      </div>

      <AccountSummary account={account} onEdit={handleOpenEditModal} />

      <AccountActivityList activity={activity} onLoadMore={loadMore} hasMore={hasMore} isLoadingMore={isLoadingMore} />
      {isEditModalOpen ? <AccountEditModal account={account} onClose={handleCloseEditModal} /> : null}
    </div>
  );
}

function AccountSummary({ account, onEdit }: AccountSummaryProps): JSX.Element {
  return (
    <section className="overflow-hidden rounded-3xl border border-primary/30 bg-primary text-primary-foreground shadow-xl shadow-primary/10">
      <div className="relative p-5 sm:p-7">
        <div className="absolute right-4 top-4 size-28 rounded-full bg-primary-foreground/15 blur-2xl" aria-hidden="true" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <IconBadge className="bg-primary-foreground/15 text-primary-foreground">
                <Landmark size={22} />
              </IconBadge>
              <span className="rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-bold text-primary-foreground/85">{account.currency}</span>
              {account.archived_at === null ? null : <span className="rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-bold text-primary-foreground/85">Archived</span>}
            </div>
            <h1 className="mt-5 break-words text-3xl font-bold tracking-tight sm:text-5xl">{account.name}</h1>
            <p className="mt-3 text-sm font-semibold text-primary-foreground/75">Current balance</p>
            <p className="mt-1 break-words text-4xl font-bold tracking-tight sm:text-5xl">{formatMoneyWithCurrency(account.balance, account.currency)}</p>
          </div>
          <dl className="grid gap-3 lg:min-w-80">
            <SummaryStat label="Rate type" value={account.rate_type.toUpperCase()} />
          </dl>
        </div>
        <div className="relative mt-6 flex justify-end">
          <Button className="border-primary-foreground/20 bg-primary-foreground !text-primary hover:bg-primary-foreground/90" variant="secondary" type="button" onClick={onEdit}>
            <Pencil size={17} />
            Edit account
          </Button>
        </div>
      </div>
    </section>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }): JSX.Element {
  return (
    <div className="rounded-2xl border border-primary-foreground/15 bg-primary-foreground/10 p-4">
      <dt className="text-xs font-bold uppercase tracking-wide text-primary-foreground/60">{label}</dt>
      <dd className="mt-2 break-words text-lg font-bold text-primary-foreground">{value}</dd>
    </div>
  );
}

function AccountEditModal({ account, onClose }: AccountEditModalProps): JSX.Element {
  const updateAccount = useUpdateAccountMutation(account.id);
  const [name, setName] = useState(account.name);
  const [rateType, setRateType] = useState<RateType>(account.rate_type);
  const [error, setError] = useState<string | null>(null);
  const trimmedName = name.trim();
  const hasChanges = trimmedName !== account.name || rateType !== account.rate_type;
  const canSubmit = trimmedName.length > 0 && hasChanges && !updateAccount.isPending;
  const isDirty = hasChanges || error !== null;

  const handleClose = useCallback((): void => {
    if (!updateAccount.isPending) {
      onClose();
    }
  }, [onClose, updateAccount.isPending]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        handleClose();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleClose]);

  const handleSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    setError(null);

    try {
      await updateAccount.mutateAsync({ name: trimmedName, rate_type: rateType });
      onClose();
    } catch (caughtError) {
      setError(caughtError instanceof ApiError ? caughtError.detail : 'Could not update account');
    }
  }, [canSubmit, onClose, rateType, trimmedName, updateAccount]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-background/80 p-0 backdrop-blur-sm sm:items-center sm:p-4" role="presentation" onMouseDown={isDirty ? undefined : handleClose}>
      <section
        aria-labelledby="edit-account-title"
        aria-modal="true"
        className="flex max-h-[calc(100dvh-1rem)] w-full max-w-xl flex-col overflow-hidden rounded-t-3xl border border-border bg-surface shadow-2xl sm:max-h-[calc(100vh-2rem)] sm:rounded-2xl"
        role="dialog"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 z-10 border-b border-border bg-surface px-4 py-4 sm:px-6 sm:py-5">
          <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-border-strong sm:hidden" aria-hidden="true" />
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id="edit-account-title" className="text-2xl font-semibold text-foreground">Edit account</h2>
              <p className="mt-2 text-sm text-muted">Update the display name and exchange rate type.</p>
            </div>
            <Button variant="ghost" size="icon" type="button" aria-label="Close edit account" onClick={handleClose} disabled={updateAccount.isPending}>
              <X size={18} />
            </Button>
          </div>
        </div>

        <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit}>
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-5 sm:px-6">
            <Field>
              <Field.Label>Name</Field.Label>
              <input className={fieldControlClassName} maxLength={120} required value={name} onChange={(event) => setName(event.target.value)} />
            </Field>

            <Field>
              <Field.Label>Rate type</Field.Label>
              <select className={fieldControlClassName} value={rateType} onChange={(event) => setRateType(event.target.value as RateType)}>
                {rateTypeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </Field>

            {error === null ? null : <p className="rounded-xl border border-danger/40 bg-danger-muted px-4 py-3 text-sm text-danger" role="alert">{error}</p>}
          </div>

          <div className="sticky bottom-0 flex flex-col-reverse gap-3 border-t border-border bg-surface px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4 sm:flex-row sm:justify-end sm:px-6 sm:pb-6">
            <Button className="w-full sm:w-auto" variant="secondary" type="button" onClick={handleClose} disabled={updateAccount.isPending}>Cancel</Button>
            <Button className="w-full sm:w-auto" type="submit" disabled={!canSubmit}>
              <Save size={17} />
              {updateAccount.isPending ? 'Saving...' : 'Save changes'}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}

function AccountActivityList({ activity, onLoadMore, hasMore, isLoadingMore }: AccountActivityListProps): JSX.Element {
  return (
    <Panel>
      <Panel.Header className="flex items-center justify-between gap-4">
        <Panel.Title>Activity</Panel.Title>
        <span className="rounded-full bg-background px-3 py-1 text-xs font-bold text-muted">{activity.items.length} items</span>
      </Panel.Header>
      <Panel.Body className="p-0">
        {activity.items.length === 0 ? (
          <div className="p-6 text-sm text-muted">No transactions or transfers for this account yet.</div>
        ) : (
          <div className="divide-y divide-border">
            {activity.items.map((item) => <ActivityRow key={`${item.kind}-${item.id}`} item={item} />)}
          </div>
        )}
        {hasMore ? (
          <div className="border-t border-border p-4">
            <Button className="w-full" variant="secondary" type="button" onClick={onLoadMore} disabled={isLoadingMore}>
              {isLoadingMore ? 'Loading...' : 'Load more'}
            </Button>
          </div>
        ) : null}
      </Panel.Body>
    </Panel>
  );
}

function ActivityRow({ item }: ActivityRowProps): JSX.Element {
  const isTransfer = item.kind === 'transfer';
  const isIncome = item.transaction_type === 'income';
  const amountLabel = isTransfer
    ? `${formatMoneyWithCurrency(item.source_amount, item.source_currency)} -> ${formatMoneyWithCurrency(item.destination_amount, item.destination_currency)}`
    : formatMoneyWithCurrency(item.amount, item.currency);
  const title = isTransfer ? 'Transfer' : isIncome ? 'Income' : 'Expense';
  const description = item.description ?? item.category_name ?? 'No description';
  const toneClassName = isTransfer
    ? 'bg-primary-muted text-primary'
    : isIncome
      ? 'bg-success-muted text-success'
      : 'bg-danger-muted text-danger';

  return (
    <article className="grid gap-3 p-4 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:p-5">
      <div className={cn('flex size-11 items-center justify-center rounded-2xl', toneClassName)}>
        {isTransfer ? <ArrowRightLeft size={18} /> : isIncome ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-semibold text-foreground">{title}</h3>
          {item.category_name === null || isTransfer ? null : <span className="rounded-full bg-background px-2.5 py-1 text-xs font-semibold text-muted">{item.category_name}</span>}
        </div>
        <p className="mt-1 truncate text-sm text-muted">{description}</p>
        <p className="mt-1 text-xs font-medium text-muted-foreground">{formatDate(item.created_at)}</p>
      </div>
      <p className="break-words text-left text-base font-bold text-foreground sm:text-right">{amountLabel}</p>
    </article>
  );
}

export function AccountDetailPage({ accountId }: AccountDetailPageProps): JSX.Element {
  return (
    <AuthenticatedApp>
      <Suspense fallback={<SuspenseLoader label="Loading account" />}>
        <AccountDetailContent accountId={accountId} />
      </Suspense>
    </AuthenticatedApp>
  );
}

export default AccountDetailPage;
