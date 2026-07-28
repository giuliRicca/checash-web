'use client';

import { useEffect, useRef, useState } from 'react';

import { ApiError } from '@/lib/api/errors';
import { Button } from '~components/ui';
import { useDeleteBudgetMutation } from '~features/budgets/hooks/use-budgets';
import type { BudgetMonthSummary } from '~types/api';

interface BudgetDeleteDialogProps {
  budget: BudgetMonthSummary;
  onClose: () => void;
}

export function BudgetDeleteDialog({ budget, onClose }: BudgetDeleteDialogProps): JSX.Element {
  const deleteBudget = useDeleteBudgetMutation();
  const [error, setError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLElement>(null);

  useEffect(() => {
    dialogRef.current?.querySelector<HTMLButtonElement>('[data-cancel]')?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  }, []);

  async function handleDelete(): Promise<void> {
    setError(null);
    try {
      await deleteBudget.mutateAsync(budget.id);
      onClose();
    } catch (caughtError) {
      setError(caughtError instanceof ApiError ? caughtError.detail : 'Could not delete budget');
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm" role="presentation" onMouseDown={deleteBudget.isPending ? undefined : onClose}>
      <section ref={dialogRef} aria-labelledby="delete-budget-title" aria-modal="true" className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl" role="alertdialog" onMouseDown={(event) => event.stopPropagation()}>
        <h2 id="delete-budget-title" className="text-lg font-semibold text-foreground">Delete {budget.category_name} budget?</h2>
        <p className="mt-2 text-sm text-muted">This removes the limit. Your transactions remain unchanged.</p>
        {error === null ? null : <p className="mt-4 rounded-xl border border-danger/40 bg-danger-muted px-4 py-3 text-sm text-danger" role="alert">{error}</p>}
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button data-cancel variant="secondary" type="button" onClick={onClose} disabled={deleteBudget.isPending}>Cancel</Button>
          <Button variant="danger" type="button" onClick={() => void handleDelete()} disabled={deleteBudget.isPending}>{deleteBudget.isPending ? 'Deleting...' : 'Delete budget'}</Button>
        </div>
      </section>
    </div>
  );
}

export default BudgetDeleteDialog;
