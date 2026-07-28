'use client';

import { ArrowDownLeft, ArrowRightLeft, ArrowUpRight, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { formatMoneyWithCurrency } from '@/lib/money/format';
import { cn } from '@/lib/ui/cn';
import { Button, Panel } from '~components/ui';
import { EditTransactionModal } from '~features/transactions/components/EditTransactionModal';
import { TransactionDeleteDialog } from '~features/transactions/components/TransactionDeleteDialog';
import type { ActivityFeed, ActivityItem } from '~types/api';

interface ActivityListProps {
  activity: ActivityFeed;
  title: string;
  emptyMessage: string;
  onLoadMore: () => void;
  hasMore: boolean;
  isLoadingMore: boolean;
  loadMoreError: string | null;
}

interface PaginatedActivityListProps {
  activity: ActivityFeed;
  title: string;
  emptyMessage: string;
  pageNumber: number;
  onPreviousPage: () => void;
  onNextPage: () => void;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  isLoadingPage: boolean;
  pageError: string | null;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

function ActivityRow({ item, onDelete, onEdit }: { item: ActivityItem; onDelete: () => void; onEdit: () => void }): JSX.Element {
  const isTransfer = item.kind === 'transfer';
  const isIncome = item.transaction_type === 'income';
  const isAdjustment = item.is_adjustment;
  const amountLabel = isTransfer
    ? `${formatMoneyWithCurrency(item.source_amount, item.source_currency)} -> ${formatMoneyWithCurrency(item.destination_amount, item.destination_currency)}`
    : formatMoneyWithCurrency(item.amount, item.currency);
  const accountImpact = !isTransfer && item.currency !== item.account_currency
    ? `Account impact: ${formatMoneyWithCurrency(item.account_amount, item.account_currency)}`
    : null;
  const title = isTransfer ? 'Transfer' : isAdjustment ? 'Balance adjustment' : isIncome ? 'Income' : 'Expense';
  const description = item.description ?? item.category_name ?? 'No description';
  const toneClassName = isTransfer
    ? 'bg-primary-muted text-primary'
    : isAdjustment
      ? 'bg-primary-muted text-primary'
      : isIncome
      ? 'bg-success-muted text-success'
      : 'bg-danger-muted text-danger';
  const canManageTransaction = item.kind === 'transaction' && !isAdjustment;

  return (
    <article className="grid gap-3 p-4 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:p-5">
      <div className={cn('flex size-11 items-center justify-center rounded-2xl', toneClassName)} aria-hidden="true">
        {isTransfer || isAdjustment ? <ArrowRightLeft size={18} /> : isIncome ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-semibold text-foreground">{title}</h3>
          {item.category_name === null || isTransfer ? null : <span className="rounded-full bg-background px-2.5 py-1 text-xs font-semibold text-muted">{item.category_name}</span>}
        </div>
        <p className="mt-1 truncate text-sm text-muted">{description}</p>
        {accountImpact === null ? null : <p className="mt-1 text-xs font-medium text-muted-foreground">{accountImpact}</p>}
        <p className="mt-1 text-xs font-medium text-muted-foreground">{formatDate(item.occurred_at ?? item.created_at)}</p>
      </div>
       <div className="flex flex-wrap items-center gap-2 sm:justify-end"><p className="break-words text-left text-base font-bold text-foreground sm:text-right">{amountLabel}</p>{canManageTransaction ? <><Button size="icon" variant="secondary" type="button" aria-label="Edit" onClick={onEdit}><Pencil size={16} /></Button><Button className="hover:bg-danger-muted hover:text-danger focus-visible:ring-danger/60" size="icon" variant="ghost" type="button" aria-label="Delete" onClick={onDelete}><Trash2 size={16} /></Button></> : null}</div>
    </article>
  );
}

function ActivityItems({ activity, emptyMessage }: Pick<ActivityListProps, 'activity' | 'emptyMessage'>): JSX.Element {
  const [editingTransaction, setEditingTransaction] = useState<ActivityItem | null>(null);
  const [deletingTransaction, setDeletingTransaction] = useState<ActivityItem | null>(null);
  if (activity.items.length === 0) return <div className="p-6 text-sm text-muted">{emptyMessage}</div>;

  return (
    <>
      <div className="divide-y divide-border" role="list">
        {activity.items.map((item) => <div key={`${item.kind}-${item.id}`} role="listitem"><ActivityRow item={item} onDelete={() => setDeletingTransaction(item)} onEdit={() => setEditingTransaction(item)} /></div>)}
      </div>
      {editingTransaction === null ? null : <EditTransactionModal transaction={editingTransaction} onClose={() => setEditingTransaction(null)} />}
      {deletingTransaction === null ? null : <TransactionDeleteDialog transaction={deletingTransaction} onClose={() => setDeletingTransaction(null)} />}
    </>
  );
}

export function ActivityList({ activity, title, emptyMessage, onLoadMore, hasMore, isLoadingMore, loadMoreError }: ActivityListProps): JSX.Element {
  return (
    <Panel>
      <Panel.Header className="flex items-center justify-between gap-4">
        <Panel.Title>{title}</Panel.Title>
        <span aria-live="polite" className="rounded-full bg-background px-3 py-1 text-xs font-bold text-muted">{activity.items.length} items</span>
      </Panel.Header>
      <Panel.Body className="p-0">
        <ActivityItems activity={activity} emptyMessage={emptyMessage} />
        {hasMore ? (
          <div className="border-t border-border p-4">
            {loadMoreError === null ? null : <p className="mb-3 text-sm font-medium text-danger" role="status">{loadMoreError}</p>}
            <Button aria-busy={isLoadingMore} className="w-full" variant="secondary" type="button" onClick={onLoadMore} disabled={isLoadingMore}>
              {isLoadingMore ? 'Loading more activity...' : 'Load more'}
            </Button>
          </div>
        ) : null}
      </Panel.Body>
    </Panel>
  );
}

export function PaginatedActivityList({ activity, title, emptyMessage, pageNumber, onPreviousPage, onNextPage, hasPreviousPage, hasNextPage, isLoadingPage, pageError }: PaginatedActivityListProps): JSX.Element {
  const showPagination = hasPreviousPage || hasNextPage;

  return (
    <Panel>
      <Panel.Header className="flex items-center justify-between gap-4">
        <Panel.Title>{title}</Panel.Title>
        <span className="rounded-full bg-background px-3 py-1 text-xs font-bold text-muted">{activity.items.length} items</span>
      </Panel.Header>
      <Panel.Body className="p-0">
        <ActivityItems activity={activity} emptyMessage={emptyMessage} />
        {showPagination ? (
          <div className="border-t border-border p-4">
            {pageError === null ? null : <p className="mb-3 text-sm font-medium text-danger" role="status">{pageError}</p>}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p aria-live="polite" className="text-sm font-semibold text-muted">Page {pageNumber}</p>
              <div className="flex gap-2">
                <Button variant="secondary" type="button" onClick={onPreviousPage} disabled={!hasPreviousPage || isLoadingPage}>Previous</Button>
                <Button variant="secondary" type="button" onClick={onNextPage} disabled={!hasNextPage || isLoadingPage}>
                  {isLoadingPage ? 'Loading page...' : 'Next'}
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </Panel.Body>
    </Panel>
  );
}
