'use client';

import { X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { ApiError } from '@/lib/api/errors';
import { isValidMoneyInput, parseMoneyInput } from '@/lib/money/format';
import { useLiveMoneyInput } from '@/lib/money/use-live-money-input';
import { cn } from '@/lib/ui/cn';
import { Button, Field, MoneyInput, fieldControlClassName } from '~components/ui';
import { useAccountsQuery } from '~features/accounts';
import { useAuth } from '~features/auth';
import { useCategoriesQuery } from '~features/categories';
import { useCreateTransactionMutation } from '~features/transactions/hooks/use-create-transaction';
import type { CategoryRead, Currency, TransactionType } from '~types/api';

interface AddTransactionModalProps {
  onClose: () => void;
}

function requireToken(token: string | null): string {
  if (token === null) {
    throw new Error('Add transaction requires an authenticated session');
  }
  return token;
}

function fallbackCategoryId(categories: CategoryRead[], transactionType: TransactionType): string {
  const fallbackSlug = transactionType === 'expense' ? 'miscellaneous' : 'uncategorized-income';
  return categories.find((category) => category.type === transactionType && category.slug === fallbackSlug)?.id
    ?? categories.find((category) => category.type === transactionType)?.id
    ?? '';
}

function defaultAccountId(accounts: Array<{ id: string }>, preferredAccountId: string | null): string {
  return accounts.some((account) => account.id === preferredAccountId)
    ? preferredAccountId ?? ''
    : accounts[0]?.id ?? '';
}

function defaultCategoryId(categories: CategoryRead[], preferredCategoryId: string | null): string {
  return categories.some((category) => category.id === preferredCategoryId && category.type === 'expense')
    ? preferredCategoryId ?? ''
    : fallbackCategoryId(categories, 'expense');
}

function toLocalDateTimeInput(date: Date): string {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export function AddTransactionModal({ onClose }: AddTransactionModalProps): JSX.Element {
  const { token, user } = useAuth();
  const authToken = requireToken(token);
  if (user === null) throw new Error('Transactions require current user');

  const { data: accounts } = useAccountsQuery(authToken, user.id);
  const { data: categories } = useCategoriesQuery(authToken, user.id);
  const createTransactionMutation = useCreateTransactionMutation();
  const initialAccountId = defaultAccountId(accounts, user.default_account_id);
  const initialAccount = accounts.find((account) => account.id === initialAccountId);
  const initialCategoryId = defaultCategoryId(categories, user.default_category_id);
  const [transactionType, setTransactionType] = useState<TransactionType>('expense');
  const { inputRef: amountInputRef, value: amount, onChange: handleAmountChange } = useLiveMoneyInput('');
  const [accountId, setAccountId] = useState(initialAccountId);
  const [currency, setCurrency] = useState<Currency>(initialAccount?.currency ?? 'ARS');
  const [hasChosenCurrency, setHasChosenCurrency] = useState(false);
  const [categoryId, setCategoryId] = useState(initialCategoryId);
  const [description, setDescription] = useState('');
  const [occurredAt, setOccurredAt] = useState(() => toLocalDateTimeInput(new Date()));
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const trimmedAmount = amount.trim();
  const parsedAmount = parseMoneyInput(trimmedAmount);
  const visibleCategories = categories.filter((category) => category.type === transactionType && !category.slug.startsWith('balance-adjustment-'));
  const isAmountValid = isValidMoneyInput(trimmedAmount);
  const amountError = hasSubmitted && !isAmountValid ? 'Enter an amount greater than 0.' : null;
  const canSubmit = isAmountValid && accountId.length > 0 && categoryId.length > 0 && !createTransactionMutation.isPending;
  const amountPrefix = transactionType === 'expense' ? '-' : '+';
  const submitLabel = createTransactionMutation.isPending ? 'Saving...' : `Save ${transactionType}`;
  const isDirty = trimmedAmount.length > 0 || description.trim().length > 0 || transactionType !== 'expense' || accountId !== initialAccountId || categoryId !== initialCategoryId;

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
  }, [amountInputRef, handleClose]);

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
        amount: parseMoneyInput(amount),
        currency,
        type: transactionType,
        description: description.trim() === '' ? null : description.trim(),
        occurred_at: new Date(occurredAt).toISOString(),
      });
      onClose();
    } catch (caughtError) {
      setError(caughtError instanceof ApiError ? caughtError.detail : 'Could not save transaction');
    }
  }, [accountId, amount, canSubmit, categoryId, createTransactionMutation, currency, description, occurredAt, onClose, transactionType]);

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
            <h2 id="add-transaction-title" className="mt-1 text-2xl font-semibold text-foreground">Add {transactionType}</h2>
            <p className="mt-2 text-sm text-muted">Amount, account, category. Done.</p>
          </div>
          <Button variant="ghost" size="icon" type="button" aria-label="Close add transaction" onClick={handleClose} disabled={createTransactionMutation.isPending}>
            <X size={18} />
          </Button>
          </div>
        </div>

        <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit}>
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-5 sm:px-6">
          <TransactionTypeSegment value={transactionType} onChange={(type) => {
            setTransactionType(type);
            setCategoryId(fallbackCategoryId(categories, type));
          }} />

          <Field>
            <Field.Label>Amount</Field.Label>
            <MoneyInput
              leading={<span className={cn(
                'flex min-w-12 items-center justify-center border-r border-border-strong text-lg font-bold',
                transactionType === 'expense' ? 'bg-danger-muted text-danger' : 'bg-success-muted text-success',
              )}>{amountPrefix}</span>}
                ref={amountInputRef}
                className="min-h-12 text-lg font-semibold"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={handleAmountChange}
                aria-invalid={amountError !== null}
                aria-describedby={amountError !== null ? 'transaction-amount-error' : undefined}
            />
            {amountError !== null ? <Field.Error className="mt-1" id="transaction-amount-error">{amountError}</Field.Error> : null}
          </Field>

          <Field>
            <Field.Label>Transaction currency</Field.Label>
            <div className="grid grid-cols-2 rounded-xl border border-border-strong bg-background p-1" role="group" aria-label="Transaction currency">
              {(['ARS', 'USD'] as const).map((value) => (
                <button
                  className={cn('min-h-10 rounded-lg px-3 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60', value === currency ? 'bg-primary text-primary-foreground' : 'text-muted hover:bg-surface-muted hover:text-foreground')}
                  key={value}
                  type="button"
                  aria-pressed={value === currency}
                  onClick={() => {
                    setCurrency(value);
                    setHasChosenCurrency(true);
                  }}
                >
                  {value}
                </button>
              ))}
            </div>
          </Field>

          <Field>
            <Field.Label>When</Field.Label>
            <input className={fieldControlClassName} type="datetime-local" max={toLocalDateTimeInput(new Date())} value={occurredAt} onChange={(event) => setOccurredAt(event.target.value)} />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">

            <Field>
              <Field.Label>Account</Field.Label>
              <select className={fieldControlClassName} value={accountId} onChange={(event) => {
                const nextAccountId = event.target.value;
                setAccountId(nextAccountId);
                if (!hasChosenCurrency) {
                  setCurrency(accounts.find((account) => account.id === nextAccountId)?.currency ?? 'ARS');
                }
              }}>
                {accounts.map((account) => <option key={account.id} value={account.id}>{account.name} ({account.currency})</option>)}
              </select>
            </Field>

            <Field>
              <Field.Label>Category</Field.Label>
              <select className={fieldControlClassName} value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>
                {visibleCategories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
            </Field>
          </div>

          <Field>
            <Field.Label>Description</Field.Label>
            <textarea className={`${fieldControlClassName} min-h-24 resize-y`} maxLength={500} placeholder="Optional note" value={description} onChange={(event) => setDescription(event.target.value)} />
          </Field>

          {accounts.length === 0 ? <p className="rounded-xl border border-warning/40 bg-warning-muted px-4 py-3 text-sm text-warning">Create an account before adding transactions.</p> : null}
           {visibleCategories.length === 0 ? <p className="rounded-xl border border-warning/40 bg-warning-muted px-4 py-3 text-sm text-warning">Create a {transactionType} category before adding transactions.</p> : null}
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

interface TransactionTypeSegmentProps {
  value: TransactionType;
  onChange: (value: TransactionType) => void;
}

function TransactionTypeSegment({ value, onChange }: TransactionTypeSegmentProps): JSX.Element {
  return (
    <div className="grid grid-cols-2 rounded-2xl border border-border-strong bg-background p-1" role="group" aria-label="Transaction type">
      {(['expense', 'income'] as const).map((type) => (
        <button
          className={cn(
            'min-h-11 rounded-xl px-4 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60',
            type === value ? 'bg-primary text-primary-foreground' : 'text-muted hover:bg-surface-muted hover:text-foreground',
          )}
          key={type}
          type="button"
          aria-pressed={type === value}
          onClick={() => onChange(type)}
        >
          {type === 'expense' ? 'Expense' : 'Income'}
        </button>
      ))}
    </div>
  );
}

export default AddTransactionModal;
