'use client';

import { Save, X } from 'lucide-react';
import type { FormEvent } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { ApiError } from '@/lib/api/errors';
import { isValidMoneyInput, parseMoneyInput } from '@/lib/money/format';
import { useLiveMoneyInput } from '@/lib/money/use-live-money-input';
import { Button, Field, MoneyInput, fieldControlClassName } from '~components/ui';
import { useCreateBudgetMutation, useUpdateBudgetMutation } from '~features/budgets/hooks/use-budgets';
import type { BudgetMonthSummary, CategoryRead, Currency } from '~types/api';

interface BudgetModalProps {
  budget?: BudgetMonthSummary;
  categories: CategoryRead[];
  onClose: () => void;
}

function eligibleCategories(categories: CategoryRead[]): CategoryRead[] {
  return categories.filter((category) => category.type === 'expense' && !category.slug.startsWith('balance-adjustment-'));
}

export function BudgetModal({ budget, categories, onClose }: BudgetModalProps): JSX.Element {
  const isEditing = budget !== undefined;
  const createBudget = useCreateBudgetMutation();
  const updateBudget = useUpdateBudgetMutation(budget?.id ?? '');
  const initialCurrency = budget?.currency ?? 'ARS';
  const { inputRef: amountInputRef, value: amount, onChange: handleAmountChange } = useLiveMoneyInput(budget?.amount ?? '');
  const [categoryId, setCategoryId] = useState(budget?.category_id ?? eligibleCategories(categories)[0]?.id ?? '');
  const [currency, setCurrency] = useState<Currency>(initialCurrency);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDiscardOpen, setIsDiscardOpen] = useState(false);
  const openerRef = useRef<HTMLElement | null>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const isPending = createBudget.isPending || updateBudget.isPending;
  const isAmountValid = isValidMoneyInput(amount);
  const amountError = hasSubmitted && !isAmountValid ? 'Enter an amount greater than 0.' : null;
  const isDirty = amount !== (budget?.amount ?? '') || currency !== initialCurrency || (!isEditing && categoryId !== (eligibleCategories(categories)[0]?.id ?? ''));
  const canSubmit = isAmountValid && categoryId !== '' && !isPending;

  const closeNow = useCallback((): void => {
    onClose();
  }, [onClose]);

  const requestClose = useCallback((): void => {
    if (isPending) return;
    if (isDirty) {
      setIsDiscardOpen(true);
      return;
    }
    closeNow();
  }, [closeNow, isDirty, isPending]);

  useEffect(() => {
    openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    amountInputRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
      openerRef.current?.focus();
    };
  }, [amountInputRef]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        event.preventDefault();
        requestClose();
      }
      if (event.key !== 'Tab' || isDiscardOpen) return;
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), select:not([disabled])');
      if (focusable === undefined || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isDiscardOpen, requestClose]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setHasSubmitted(true);
    if (!canSubmit) return;
    setError(null);

    try {
      if (budget === undefined) {
        await createBudget.mutateAsync({ category_id: categoryId, amount: parseMoneyInput(amount), currency });
      } else {
        await updateBudget.mutateAsync({ amount: parseMoneyInput(amount), currency });
      }
      closeNow();
    } catch (caughtError) {
      setError(caughtError instanceof ApiError ? caughtError.detail : `Could not ${isEditing ? 'update' : 'create'} budget`);
    }
  }

  const availableCategories = eligibleCategories(categories);
  const title = isEditing ? `Edit ${budget.category_name} budget` : 'Create budget';

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-background/80 p-0 backdrop-blur-sm sm:items-center sm:p-4" role="presentation" onMouseDown={requestClose}>
      <section ref={dialogRef} aria-labelledby="budget-modal-title" aria-modal="true" className="flex max-h-[calc(100dvh-1rem)] w-full max-w-xl flex-col overflow-hidden rounded-t-3xl border border-border bg-surface shadow-2xl sm:max-h-[calc(100vh-2rem)] sm:rounded-2xl" role="dialog" onMouseDown={(event) => event.stopPropagation()}>
        <div className="sticky top-0 z-10 border-b border-border bg-surface px-4 py-4 sm:px-6 sm:py-5">
          <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-border-strong sm:hidden" aria-hidden="true" />
          <div className="flex items-start justify-between gap-4">
            <div><h2 id="budget-modal-title" className="text-2xl font-semibold text-foreground">{title}</h2><p className="mt-2 text-sm text-muted">Set a current-month spending limit.</p></div>
            <Button variant="ghost" size="icon" type="button" aria-label="Close budget form" onClick={requestClose} disabled={isPending}><X size={18} /></Button>
          </div>
        </div>
        <form className="flex min-h-0 flex-1 flex-col" onSubmit={(event) => void handleSubmit(event)}>
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-5 sm:px-6">
            <Field>
              <Field.Label>Expense category</Field.Label>
              {isEditing ? <input className={fieldControlClassName} readOnly value={budget.category_name} /> : <select className={fieldControlClassName} value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>{availableCategories.length === 0 ? <option value="">No eligible categories</option> : availableCategories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select>}
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field><Field.Label>Monthly limit</Field.Label><MoneyInput ref={amountInputRef} placeholder="0.00" value={amount} onChange={handleAmountChange} aria-describedby={amountError === null ? undefined : 'budget-amount-error'} aria-invalid={amountError !== null} />{amountError === null ? null : <Field.Error className="mt-1" id="budget-amount-error">{amountError}</Field.Error>}</Field>
              <Field><Field.Label>Currency</Field.Label><select className={fieldControlClassName} value={currency} onChange={(event) => setCurrency(event.target.value as Currency)}><option value="ARS">ARS</option><option value="USD">USD</option></select></Field>
            </div>
            {error === null ? null : <p className="rounded-xl border border-danger/40 bg-danger-muted px-4 py-3 text-sm text-danger" role="alert">{error}</p>}
          </div>
          <div className="sticky bottom-0 flex flex-col-reverse gap-3 border-t border-border bg-surface px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4 sm:flex-row sm:justify-end sm:px-6 sm:pb-6"><Button className="w-full sm:w-auto" variant="secondary" type="button" onClick={requestClose} disabled={isPending}>Cancel</Button><Button className="w-full sm:w-auto" type="submit" disabled={!canSubmit}><Save size={17} />{isPending ? 'Saving...' : isEditing ? 'Save budget' : 'Create budget'}</Button></div>
        </form>
      </section>
      {isDiscardOpen ? <DiscardDialog onCancel={() => setIsDiscardOpen(false)} onDiscard={closeNow} /> : null}
    </div>
  );
}

function DiscardDialog({ onCancel, onDiscard }: { onCancel: () => void; onDiscard: () => void }): JSX.Element {
  return <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background/80 p-4" role="presentation"><section aria-labelledby="discard-budget-title" aria-modal="true" className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl" role="alertdialog"><h2 id="discard-budget-title" className="text-lg font-semibold text-foreground">Discard changes?</h2><p className="mt-2 text-sm text-muted">Your budget changes will be lost.</p><div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><Button autoFocus variant="secondary" type="button" onClick={onCancel}>Keep editing</Button><Button variant="danger" type="button" onClick={onDiscard}>Discard</Button></div></section></div>;
}

export default BudgetModal;
