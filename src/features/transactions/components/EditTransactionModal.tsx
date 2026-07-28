'use client';

import { Save, X } from 'lucide-react';
import type { FormEvent } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { ApiError } from '@/lib/api/errors';
import { isValidMoneyInput, parseMoneyInput } from '@/lib/money/format';
import { useLiveMoneyInput } from '@/lib/money/use-live-money-input';
import { Button, Field, MoneyInput, fieldControlClassName } from '~components/ui';
import { useAccountsQuery } from '~features/accounts/hooks/use-accounts';
import { useAuth } from '~features/auth';
import { useCategoriesQuery } from '~features/categories/hooks/use-categories';
import { useUpdateTransactionMutation } from '~features/transactions/hooks/use-transaction-mutations';
import type { ActivityItem, Currency } from '~types/api';

interface EditTransactionModalProps {
  transaction: ActivityItem;
  onClose: () => void;
}

function requireToken(token: string | null): string {
  if (token === null) throw new Error('Transactions require an authenticated session');
  return token;
}

function toLocalDateTimeInput(value: string): string {
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export function EditTransactionModal({ transaction, onClose }: EditTransactionModalProps): JSX.Element {
  const { token, user } = useAuth();
  const authToken = requireToken(token);
  if (user === null) throw new Error('Transactions require current user');
  const { data: accounts } = useAccountsQuery(authToken, user.id);
  const { data: categories } = useCategoriesQuery(authToken, user.id);
  const updateTransaction = useUpdateTransactionMutation(transaction.id);
  const initialAccountId = transaction.account_id ?? '';
  const initialCategoryId = transaction.category_id ?? '';
  const initialCurrency = transaction.currency ?? 'ARS';
  const initialOccurredAt = toLocalDateTimeInput(transaction.occurred_at ?? transaction.created_at);
  const { inputRef: amountInputRef, value: amount, onChange: handleAmountChange } = useLiveMoneyInput(transaction.amount ?? '');
  const [accountId, setAccountId] = useState(initialAccountId);
  const [categoryId, setCategoryId] = useState(initialCategoryId);
  const [currency, setCurrency] = useState<Currency>(initialCurrency);
  const [description, setDescription] = useState(transaction.description ?? '');
  const [occurredAt, setOccurredAt] = useState(initialOccurredAt);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDiscardOpen, setIsDiscardOpen] = useState(false);
  const openerRef = useRef<HTMLElement | null>(null);
  const isAmountValid = isValidMoneyInput(amount);
  const amountError = hasSubmitted && !isAmountValid ? 'Enter an amount greater than 0.' : null;
  const visibleCategories = categories.filter((category) => category.type === transaction.transaction_type && !category.slug.startsWith('balance-adjustment-'));
  const isDirty = accountId !== initialAccountId || categoryId !== initialCategoryId || amount !== (transaction.amount ?? '') || currency !== initialCurrency || description !== (transaction.description ?? '') || occurredAt !== initialOccurredAt;
  const canSubmit = isAmountValid && accountId !== '' && categoryId !== '' && !updateTransaction.isPending;

  const closeNow = useCallback((): void => onClose(), [onClose]);
  const requestClose = useCallback((): void => {
    if (updateTransaction.isPending) return;
    if (isDirty) {
      setIsDiscardOpen(true);
      return;
    }
    closeNow();
  }, [closeNow, isDirty, updateTransaction.isPending]);

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
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [requestClose]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setHasSubmitted(true);
    if (!canSubmit) return;
    setError(null);
    try {
      await updateTransaction.mutateAsync({
        account_id: accountId,
        category_id: categoryId,
        amount: parseMoneyInput(amount),
        currency,
        description: description.trim() === '' ? null : description.trim(),
        occurred_at: new Date(occurredAt).toISOString(),
      });
      closeNow();
    } catch (caughtError) {
      setError(caughtError instanceof ApiError ? caughtError.detail : 'Could not update transaction');
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-background/80 p-0 backdrop-blur-sm sm:items-center sm:p-4" role="presentation" onMouseDown={requestClose}>
      <section aria-labelledby="edit-transaction-title" aria-modal="true" className="flex max-h-[calc(100dvh-1rem)] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl border border-border bg-surface shadow-2xl sm:max-h-[calc(100vh-2rem)] sm:rounded-2xl" role="dialog" onMouseDown={(event) => event.stopPropagation()}>
        <div className="sticky top-0 z-10 border-b border-border bg-surface px-4 py-4 sm:px-6 sm:py-5"><div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-border-strong sm:hidden" aria-hidden="true" /><div className="flex items-start justify-between gap-4"><div><h2 id="edit-transaction-title" className="text-2xl font-semibold text-foreground">Edit {transaction.transaction_type}</h2><p className="mt-2 text-sm text-muted">Type stays the same. Balance and reports recalculate.</p></div><Button variant="ghost" size="icon" type="button" aria-label="Close edit transaction" onClick={requestClose} disabled={updateTransaction.isPending}><X size={18} /></Button></div></div>
        <form className="flex min-h-0 flex-1 flex-col" onSubmit={(event) => void handleSubmit(event)}>
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-5 sm:px-6">
            <Field><Field.Label>Amount</Field.Label><MoneyInput ref={amountInputRef} value={amount} onChange={handleAmountChange} aria-describedby={amountError === null ? undefined : 'edit-transaction-amount-error'} aria-invalid={amountError !== null} />{amountError === null ? null : <Field.Error className="mt-1" id="edit-transaction-amount-error">{amountError}</Field.Error>}</Field>
            <div className="grid gap-4 sm:grid-cols-2"><Field><Field.Label>Currency</Field.Label><select className={fieldControlClassName} value={currency} onChange={(event) => setCurrency(event.target.value as Currency)}><option value="ARS">ARS</option><option value="USD">USD</option></select></Field><Field><Field.Label>When</Field.Label><input className={fieldControlClassName} type="datetime-local" max={toLocalDateTimeInput(new Date().toISOString())} value={occurredAt} onChange={(event) => setOccurredAt(event.target.value)} /></Field></div>
            <div className="grid gap-4 sm:grid-cols-2"><Field><Field.Label>Account</Field.Label><select className={fieldControlClassName} value={accountId} onChange={(event) => setAccountId(event.target.value)}>{accounts.map((account) => <option key={account.id} value={account.id}>{account.name} ({account.currency})</option>)}</select></Field><Field><Field.Label>Category</Field.Label><select className={fieldControlClassName} value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>{visibleCategories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></Field></div>
            <Field><Field.Label>Description</Field.Label><textarea className={`${fieldControlClassName} min-h-24 resize-y`} maxLength={500} value={description} onChange={(event) => setDescription(event.target.value)} /></Field>
            {error === null ? null : <p className="rounded-xl border border-danger/40 bg-danger-muted px-4 py-3 text-sm text-danger" role="alert">{error}</p>}
          </div>
          <div className="sticky bottom-0 flex flex-col-reverse gap-3 border-t border-border bg-surface px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4 sm:flex-row sm:justify-end sm:px-6 sm:pb-6"><Button className="w-full sm:w-auto" variant="secondary" type="button" onClick={requestClose} disabled={updateTransaction.isPending}>Cancel</Button><Button className="w-full sm:w-auto" type="submit" disabled={!canSubmit}><Save size={17} />{updateTransaction.isPending ? 'Saving...' : 'Save transaction'}</Button></div>
        </form>
      </section>
      {isDiscardOpen ? <DiscardDialog onCancel={() => setIsDiscardOpen(false)} onDiscard={closeNow} /> : null}
    </div>
  );
}

function DiscardDialog({ onCancel, onDiscard }: { onCancel: () => void; onDiscard: () => void }): JSX.Element {
  return <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background/80 p-4" role="presentation"><section aria-labelledby="discard-transaction-title" aria-modal="true" className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl" role="alertdialog"><h2 id="discard-transaction-title" className="text-lg font-semibold text-foreground">Discard changes?</h2><p className="mt-2 text-sm text-muted">Your transaction changes will be lost.</p><div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><Button autoFocus variant="secondary" type="button" onClick={onCancel}>Keep editing</Button><Button variant="danger" type="button" onClick={onDiscard}>Discard</Button></div></section></div>;
}

export default EditTransactionModal;
