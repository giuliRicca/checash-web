'use client';

import { ArrowDownLeft, ArrowUpRight, Check, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { ApiError } from '@/lib/api/errors';
import { cn } from '@/lib/ui/cn';
import { Button, Field, fieldControlClassName } from '~components/ui';
import { useAccountsQuery } from '~features/accounts';
import { useCategoriesQuery } from '~features/categories';
import { useCreateTransactionMutation } from '~features/transactions/hooks/use-create-transaction';
import type { TransactionType } from '~types/api';

interface AddTransactionModalProps {
  onClose: () => void;
}

export function AddTransactionModal({ onClose }: AddTransactionModalProps): JSX.Element {
  const { data: accounts } = useAccountsQuery();
  const { data: categories } = useCategoriesQuery();
  const createTransactionMutation = useCreateTransactionMutation();
  const [transactionType, setTransactionType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? '');
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? '');
  const [description, setDescription] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const amountInputRef = useRef<HTMLInputElement>(null);
  const trimmedAmount = amount.trim();
  const amountValue = Number(trimmedAmount);
  const isAmountValid = trimmedAmount.length > 0 && Number.isFinite(amountValue) && amountValue > 0;
  const amountError = hasSubmitted && !isAmountValid ? 'Enter an amount greater than 0.' : null;
  const canSubmit = isAmountValid && accountId.length > 0 && categoryId.length > 0 && !createTransactionMutation.isPending;
  const selectedAccount = accounts.find((account) => account.id === accountId) ?? null;
  const directionLabel = transactionType === 'expense' ? 'Money out' : 'Money in';
  const amountPrefix = transactionType === 'expense' ? '-' : '+';
  const submitLabel = createTransactionMutation.isPending ? 'Saving...' : `Save ${transactionType}`;
  const isDirty = trimmedAmount.length > 0 || description.trim().length > 0 || transactionType !== 'expense' || accountId !== (accounts[0]?.id ?? '') || categoryId !== (categories[0]?.id ?? '');

  const handleClose = useCallback((): void => {
    if (!createTransactionMutation.isPending) {
      onClose();
    }
  }, [createTransactionMutation.isPending, onClose]);

  useEffect(() => {
    amountInputRef.current?.focus();

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
    setHasSubmitted(true);

    if (!canSubmit) {
      setError(null);
      return;
    }

    setError(null);

    try {
      await createTransactionMutation.mutateAsync({
        account_id: accountId,
        category_id: categoryId,
        amount: trimmedAmount,
        type: transactionType,
        description: description.trim() === '' ? null : description.trim(),
      });
      onClose();
    } catch (caughtError) {
      setError(caughtError instanceof ApiError ? caughtError.detail : 'Could not save transaction');
    }
  }, [accountId, canSubmit, categoryId, createTransactionMutation, description, onClose, transactionType, trimmedAmount]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-background/80 p-0 backdrop-blur-sm sm:items-center sm:p-4" role="presentation" onMouseDown={isDirty ? undefined : handleClose}>
      <section
        aria-labelledby="add-transaction-title"
        aria-modal="true"
        className="flex max-h-[calc(100dvh-1rem)] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl border border-border bg-surface shadow-2xl sm:max-h-[calc(100vh-2rem)] sm:rounded-2xl"
        role="dialog"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 z-10 border-b border-border bg-surface px-4 py-4 sm:px-6 sm:py-5">
          <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-border-strong sm:hidden" aria-hidden="true" />
          <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="add-transaction-title" className="mt-1 text-2xl font-semibold text-foreground">Add transaction</h2>
            <p className="mt-2 text-sm text-muted">Choose money in or out, then fill the details.</p>
          </div>
          <Button variant="ghost" size="icon" type="button" aria-label="Close add transaction" onClick={handleClose} disabled={createTransactionMutation.isPending}>
            <X size={18} />
          </Button>
          </div>
        </div>

        <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit}>
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-5 sm:px-6">
          <div className="grid gap-3 sm:grid-cols-2" role="group" aria-label="Transaction type">
            <TransactionTypeOption
              description="Purchases, bills, or any money leaving an account."
              icon={<ArrowDownLeft size={20} />}
              isSelected={transactionType === 'expense'}
              label="Expense"
              tone="danger"
              onSelect={() => setTransactionType('expense')}
            />
            <TransactionTypeOption
              description="Salary, refunds, or any money added to an account."
              icon={<ArrowUpRight size={20} />}
              isSelected={transactionType === 'income'}
              label="Income"
              tone="success"
              onSelect={() => setTransactionType('income')}
            />
          </div>

          <Field>
            <Field.Label>Amount</Field.Label>
            <div className="flex overflow-hidden rounded-xl border border-border-strong bg-background focus-within:border-primary">
              <span className={cn(
                'flex min-w-12 items-center justify-center border-r border-border-strong text-lg font-bold',
                transactionType === 'expense' ? 'bg-danger-muted text-danger' : 'bg-success-muted text-success',
              )}>{amountPrefix}</span>
              <input
                ref={amountInputRef}
                className="min-h-12 min-w-0 flex-1 bg-transparent px-4 py-3 text-lg font-semibold text-foreground outline-none placeholder:text-muted-foreground"
                inputMode="decimal"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                aria-invalid={amountError !== null}
                aria-describedby={amountError !== null ? 'transaction-amount-error' : 'transaction-amount-help'}
              />
            </div>
            {amountError !== null ? <Field.Error className="mt-1" id="transaction-amount-error">{amountError}</Field.Error> : null}
            {amountError === null ? <span className="text-sm text-muted-foreground" id="transaction-amount-help">Saved as a positive amount. {directionLabel} controls the balance change.</span> : null}
          </Field>

          <div className="rounded-xl border border-border bg-surface-elevated px-4 py-3 text-sm text-muted">
            {selectedAccount === null ? 'Select an account to preview the balance direction.' : `${amountPrefix} ${trimmedAmount || '0.00'} ${selectedAccount.currency} will be applied to ${selectedAccount.name}.`}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">

            <Field>
              <Field.Label>Account</Field.Label>
              <select className={fieldControlClassName} value={accountId} onChange={(event) => setAccountId(event.target.value)}>
                {accounts.map((account) => <option key={account.id} value={account.id}>{account.name} ({account.currency})</option>)}
              </select>
            </Field>

            <Field>
              <Field.Label>Category</Field.Label>
              <select className={fieldControlClassName} value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>
                {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
            </Field>
          </div>

          <Field>
            <Field.Label>Description</Field.Label>
            <textarea className={`${fieldControlClassName} min-h-24 resize-y`} maxLength={500} placeholder="Optional note" value={description} onChange={(event) => setDescription(event.target.value)} />
          </Field>

          {accounts.length === 0 ? <p className="rounded-xl border border-warning/40 bg-warning-muted px-4 py-3 text-sm text-warning">Create an account before adding transactions.</p> : null}
          {categories.length === 0 ? <p className="rounded-xl border border-warning/40 bg-warning-muted px-4 py-3 text-sm text-warning">Create a category before adding transactions.</p> : null}
          {error !== null ? <p className="rounded-xl border border-danger/40 bg-danger-muted px-4 py-3 text-sm text-danger" role="alert">{error}</p> : null}
          </div>

          <div className="sticky bottom-0 flex flex-col-reverse gap-3 border-t border-border bg-surface px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4 sm:flex-row sm:justify-end sm:px-6 sm:pb-6">
            <Button className="w-full sm:w-auto" variant="secondary" type="button" onClick={handleClose} disabled={createTransactionMutation.isPending}>Cancel</Button>
            <Button className="w-full sm:w-auto" type="submit" disabled={!canSubmit}>{submitLabel}</Button>
          </div>
        </form>
      </section>
    </div>
  );
}

interface TransactionTypeOptionProps {
  description: string;
  icon: JSX.Element;
  isSelected: boolean;
  label: string;
  tone: 'danger' | 'success';
  onSelect: () => void;
}

function TransactionTypeOption({ description, icon, isSelected, label, tone, onSelect }: TransactionTypeOptionProps): JSX.Element {
  const toneClasses = tone === 'danger'
    ? 'border-danger/60 bg-danger-muted text-danger'
    : 'border-success/60 bg-success-muted text-success';

  return (
    <button
      className={cn(
        'min-h-28 cursor-pointer rounded-2xl border p-4 text-left transition hover:border-primary/70 hover:bg-surface-elevated focus:outline-none focus:ring-2 focus:ring-primary/60 active:scale-[0.99]',
        isSelected ? toneClasses : 'border-border-strong bg-background text-muted',
      )}
      type="button"
      aria-pressed={isSelected}
      onClick={onSelect}
    >
      <span className="flex items-start justify-between gap-3">
        <span className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl border border-current/20 bg-current/10">{icon}</span>
          <span>
            <span className="block text-base font-semibold text-foreground">{label}</span>
            <span className="mt-1 block text-sm font-medium">{tone === 'danger' ? 'Money out' : 'Money in'}</span>
          </span>
        </span>
        {isSelected ? <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-current/15"><Check size={16} /></span> : null}
      </span>
      <span className="mt-4 block text-sm leading-5 text-muted">{description}</span>
    </button>
  );
}

export default AddTransactionModal;
