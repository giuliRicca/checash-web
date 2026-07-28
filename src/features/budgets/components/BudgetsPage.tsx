'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';

import { formatMoneyWithCurrency } from '@/lib/money/format';
import { Button, Panel, ProgressBar } from '~components/ui';
import { useAuth } from '~features/auth';
import { BudgetDeleteDialog } from '~features/budgets/components/BudgetDeleteDialog';
import { BudgetModal } from '~features/budgets/components/BudgetModal';
import { sortBudgetSummaries } from '~features/budgets/helpers/budget-summary';
import { useBudgetSummaryQuery } from '~features/budgets/hooks/use-budgets';
import { useCategoriesQuery } from '~features/categories';
import type { BudgetMonthSummary } from '~types/api';

const BudgetChart = dynamic(() => import('./BudgetChart').then((module) => module.BudgetChart), {
  loading: () => <div className="h-72 animate-pulse rounded-2xl border border-border bg-surface" aria-label="Loading budget progress" />,
  ssr: false,
});

function requireToken(token: string | null): string {
  if (token === null) throw new Error('Budgets require an authenticated session');
  return token;
}

function statusLabel(status: BudgetMonthSummary['status']): string {
  if (status === 'over_budget') return 'Over budget';
  if (status === 'at_limit') return 'At limit';
  return 'On track';
}

function progressTone(status: BudgetMonthSummary['status']): 'primary' | 'warning' | 'danger' {
  if (status === 'over_budget') return 'danger';
  if (status === 'at_limit') return 'warning';
  return 'primary';
}

function statusClassName(status: BudgetMonthSummary['status']): string {
  if (status === 'over_budget') return 'border-danger/30 bg-danger-muted text-danger';
  if (status === 'at_limit') return 'border-warning/40 bg-warning-muted text-warning';
  return 'border-primary/30 bg-primary/10 text-primary';
}

export function BudgetsPage(): JSX.Element {
  const { token, user } = useAuth();
  const authToken = requireToken(token);
  if (user === null) throw new Error('Budgets require current user');
  const { data: budgets } = useBudgetSummaryQuery(authToken, user.id);
  const { data: categories } = useCategoriesQuery(authToken, user.id);
  const [modalBudget, setModalBudget] = useState<BudgetMonthSummary | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deleteBudget, setDeleteBudget] = useState<BudgetMonthSummary | null>(null);
  const sortedBudgets = sortBudgetSummaries(budgets);

  return (
    <div className="flex w-full flex-col gap-8 pb-20 lg:pb-0">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-sm font-semibold text-primary">Monthly spending plan</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Budgets</h1><p className="mt-2 text-base text-muted">Track each expense category against its current monthly limit.</p></div>
        <Button type="button" onClick={() => setIsCreateOpen(true)}>Add budget</Button>
      </header>
      {sortedBudgets.length === 0 ? <EmptyBudgets onCreate={() => setIsCreateOpen(true)} /> : <>
        <BudgetChart budgets={sortedBudgets} />
        <section aria-label="Budget limits" className="grid gap-4">{sortedBudgets.map((budget) => <BudgetCard budget={budget} key={budget.id} onDelete={() => setDeleteBudget(budget)} onEdit={() => setModalBudget(budget)} />)}</section>
      </>}
      {isCreateOpen ? <BudgetModal categories={categories} onClose={() => setIsCreateOpen(false)} /> : null}
      {modalBudget === null ? null : <BudgetModal budget={modalBudget} categories={categories} onClose={() => setModalBudget(null)} />}
      {deleteBudget === null ? null : <BudgetDeleteDialog budget={deleteBudget} onClose={() => setDeleteBudget(null)} />}
    </div>
  );
}

function EmptyBudgets({ onCreate }: { onCreate: () => void }): JSX.Element {
  return <Panel><Panel.Body className="flex flex-col items-start gap-4 py-8"><div><h2 className="text-lg font-semibold text-foreground">No budgets yet</h2><p className="mt-1 text-sm text-muted">Add a limit for an expense category to track this month&apos;s spending.</p></div><Button type="button" onClick={onCreate}>Add first budget</Button></Panel.Body></Panel>;
}

function BudgetCard({ budget, onEdit, onDelete }: { budget: BudgetMonthSummary; onEdit: () => void; onDelete: () => void }): JSX.Element {
  const percentage = Number(budget.percentage);
  const boundedPercentage = Number.isFinite(percentage) ? Math.min(Math.max(percentage, 0), 100) : 0;
  const remaining = Number(budget.remaining);
  const overBudget = Number.isFinite(remaining) && remaining < 0;
  const exactProgress = Number.isFinite(percentage) ? `${percentage.toFixed(0)}%` : 'Unknown progress';
  const progressDescription = `${budget.category_name}: ${exactProgress} of ${formatMoneyWithCurrency(budget.amount, budget.currency)} limit. ${statusLabel(budget.status)}.`;

  return <Panel><Panel.Body><div className="flex flex-wrap items-start justify-between gap-4"><div><div className="flex flex-wrap items-center gap-2"><h2 className="text-lg font-semibold text-foreground">{budget.category_name}</h2><span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${statusClassName(budget.status)}`}>{statusLabel(budget.status)}</span></div><p className="mt-1 text-sm text-muted">{formatMoneyWithCurrency(budget.spent, budget.currency)} of {formatMoneyWithCurrency(budget.amount, budget.currency)}</p></div><div className="flex gap-2"><Button variant="secondary" size="sm" type="button" onClick={onEdit}>Edit</Button><Button variant="ghost" size="sm" type="button" onClick={onDelete}>Delete</Button></div></div><ProgressBar ariaLabel={progressDescription} className="mt-4 h-3" tone={progressTone(budget.status)} value={boundedPercentage} /><div className="mt-3 flex flex-wrap justify-between gap-x-4 gap-y-1 text-sm"><p className={overBudget ? 'font-semibold text-danger' : 'text-muted'}>{overBudget ? `${formatMoneyWithCurrency(Math.abs(remaining), budget.currency)} over budget` : `${formatMoneyWithCurrency(budget.remaining, budget.currency)} remaining`}</p><p className="font-semibold text-foreground">{exactProgress}</p></div></Panel.Body></Panel>;
}

export default BudgetsPage;
