'use client';

import { useState } from 'react';

import { parseMoneyInput } from '@/lib/money/format';
import { useLiveMoneyInput } from '@/lib/money/use-live-money-input';
import { Button, Field, MoneyInput, Panel, fieldControlClassName } from '~components/ui';
import { getDraftValidationError } from '~features/chat/helpers/draft-validation';
import type { AccountRead, CategoryRead, ChatDraft, Currency, TransactionType } from '~types/api';

interface DraftCardProps {
  draft: ChatDraft;
  accounts: AccountRead[];
  categories: CategoryRead[];
  onConfirm: (draft: ChatDraft) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

function fallbackCategoryId(categories: CategoryRead[], transactionType: TransactionType): string {
  const fallbackSlug = transactionType === 'expense' ? 'miscellaneous' : 'uncategorized-income';
  return categories.find((category) => category.type === transactionType && category.slug === fallbackSlug)?.id
    ?? categories.find((category) => category.type === transactionType)?.id
    ?? '';
}

function toLocalDateTimeInput(value: string | null): string {
  const date = value === null ? new Date() : new Date(value);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export function DraftCard({ draft, accounts, categories, onConfirm, onCancel, isSubmitting }: DraftCardProps): JSX.Element {
  const { value: amount, onChange: handleAmountChange } = useLiveMoneyInput(draft.amount);
  const [transactionType, setTransactionType] = useState<ChatDraft['transaction_type']>(draft.transaction_type);
  const [accountId, setAccountId] = useState(draft.account_id ?? accounts[0]?.id ?? '');
  const [currency, setCurrency] = useState<Currency>(draft.currency);
  const initialType = draft.transaction_type === 'transfer' ? 'expense' : draft.transaction_type;
  const initialCategory = categories.find((category) => category.id === draft.category_id);
  const [categoryId, setCategoryId] = useState(
    initialCategory?.type === initialType ? initialCategory.id : fallbackCategoryId(categories, initialType),
  );
  const [description, setDescription] = useState(draft.description ?? '');
  const [occurredAt, setOccurredAt] = useState(() => toLocalDateTimeInput(draft.occurred_at));
  const [destinationAccountId, setDestinationAccountId] = useState(draft.exchange_details?.destination_account_id ?? accounts.find((account) => account.id !== draft.account_id)?.id ?? '');
  const { value: rateOverride, onChange: handleRateOverrideChange } = useLiveMoneyInput(draft.exchange_details?.rate_override ?? '');
  const visibleCategories = transactionType === 'transfer'
    ? []
    : categories.filter((category) => category.type === transactionType && !category.slug.startsWith('balance-adjustment-'));
  const validationError = getDraftValidationError(
    amount,
    transactionType,
    accountId,
    categoryId,
    destinationAccountId,
    rateOverride,
    categories,
  );

  function buildDraft(): ChatDraft {
    const isExchange = transactionType === 'transfer';
    const selectedCategory = categories.find((category) => category.id === categoryId) ?? null;

    return {
      ...draft,
      amount: parseMoneyInput(amount),
      currency,
      account_id: accountId,
      category_id: isExchange ? draft.category_id : categoryId,
      category_name: isExchange ? draft.category_name : selectedCategory?.name ?? draft.category_name,
      transaction_type: transactionType,
      description: description.trim() === '' ? null : description.trim(),
      occurred_at: new Date(occurredAt).toISOString(),
      is_exchange: isExchange,
      exchange_details: isExchange
        ? {
            destination_currency: accounts.find((account) => account.id === destinationAccountId)?.currency ?? draft.exchange_details?.destination_currency ?? null,
            destination_account_keyword: draft.exchange_details?.destination_account_keyword ?? null,
            destination_account_id: destinationAccountId,
            rate_override: rateOverride.trim() === '' ? null : parseMoneyInput(rateOverride),
          }
        : null,
      needs_review: false,
    };
  }

  return (
    <Panel className="border-primary/30 text-left">
      <Panel.Body>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-primary">Draft</p>
            <h3 className="mt-1 text-lg font-semibold text-foreground">Review before saving</h3>
          </div>
          {draft.needs_review ? <span className="rounded-full bg-warning-muted px-3 py-1 text-xs font-semibold text-warning">Needs review</span> : null}
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Field>
          <Field.Label>Amount</Field.Label>
          <MoneyInput value={amount} onChange={handleAmountChange} />
        </Field>
        {transactionType === 'transfer' ? null : <Field>
          <Field.Label>Currency</Field.Label>
          <select className={fieldControlClassName} value={currency} onChange={(event) => setCurrency(event.target.value as Currency)}>
            <option value="ARS">ARS</option>
            <option value="USD">USD</option>
          </select>
        </Field>}
        <Field>
          <Field.Label>Type</Field.Label>
          <select className={fieldControlClassName} value={transactionType} onChange={(event) => {
            const type = event.target.value as TransactionType | 'transfer';
            setTransactionType(type);
            if (type !== 'transfer') setCategoryId(fallbackCategoryId(categories, type));
          }}>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
            <option value="transfer">Transfer</option>
          </select>
        </Field>
        <Field>
          <Field.Label>Account</Field.Label>
          <select className={fieldControlClassName} value={accountId} onChange={(event) => setAccountId(event.target.value)}>
            {accounts.map((account) => <option key={account.id} value={account.id}>{account.name} ({account.currency})</option>)}
          </select>
        </Field>
        {transactionType === 'transfer' ? (
          <Field>
            <Field.Label>Destination</Field.Label>
            <select className={fieldControlClassName} value={destinationAccountId} onChange={(event) => setDestinationAccountId(event.target.value)}>
              {accounts.map((account) => <option key={account.id} value={account.id}>{account.name} ({account.currency})</option>)}
            </select>
          </Field>
        ) : (
          <Field>
            <Field.Label>Category</Field.Label>
            <select className={fieldControlClassName} value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>
              {visibleCategories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
          </Field>
        )}
        {transactionType === 'transfer' ? (
          <Field>
            <Field.Label>Rate override</Field.Label>
            <MoneyInput value={rateOverride} onChange={handleRateOverrideChange} placeholder="Optional" />
          </Field>
        ) : null}
        <Field className="sm:col-span-2">
          <Field.Label>Description</Field.Label>
          <textarea className={`${fieldControlClassName} min-h-20`} value={description} onChange={(event) => setDescription(event.target.value)} />
        </Field>
        {transactionType === 'transfer' ? null : <Field>
          <Field.Label>When</Field.Label>
          <input className={fieldControlClassName} type="datetime-local" max={toLocalDateTimeInput(null)} value={occurredAt} onChange={(event) => setOccurredAt(event.target.value)} />
        </Field>}
      </div>

        {validationError === null ? null : <p className="mt-4 text-sm text-danger" role="alert">{validationError}</p>}
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Button className="w-full sm:w-auto" type="button" onClick={() => onConfirm(buildDraft())} disabled={isSubmitting || validationError !== null}>
            {isSubmitting ? 'Saving...' : 'Confirm'}
          </Button>
          <Button className="w-full sm:w-auto" variant="secondary" type="button" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        </div>
      </Panel.Body>
    </Panel>
  );
}

export default DraftCard;
