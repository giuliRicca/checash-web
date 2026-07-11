'use client';

import { useState } from 'react';

import { Button, Field, Panel, fieldControlClassName } from '~components/ui';
import type { AccountRead, CategoryRead, ChatDraft, TransactionType } from '~types/api';

interface DraftCardProps {
  draft: ChatDraft;
  accounts: AccountRead[];
  categories: CategoryRead[];
  onConfirm: (draft: ChatDraft) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function DraftCard({ draft, accounts, categories, onConfirm, onCancel, isSubmitting }: DraftCardProps): JSX.Element {
  const [amount, setAmount] = useState(draft.amount);
  const [transactionType, setTransactionType] = useState<ChatDraft['transaction_type']>(draft.transaction_type);
  const [accountId, setAccountId] = useState(draft.account_id ?? accounts[0]?.id ?? '');
  const [categoryId, setCategoryId] = useState(draft.category_id ?? categories[0]?.id ?? '');
  const [description, setDescription] = useState(draft.description ?? '');
  const [destinationAccountId, setDestinationAccountId] = useState(draft.exchange_details?.destination_account_id ?? accounts.find((account) => account.id !== draft.account_id)?.id ?? '');
  const [rateOverride, setRateOverride] = useState(draft.exchange_details?.rate_override ?? '');

  function buildDraft(): ChatDraft {
    const isExchange = transactionType === 'transfer';
    const selectedCategory = categories.find((category) => category.id === categoryId) ?? null;

    return {
      ...draft,
      amount,
      account_id: accountId,
      category_id: isExchange ? draft.category_id : categoryId,
      category_name: isExchange ? draft.category_name : selectedCategory?.name ?? draft.category_name,
      transaction_type: transactionType,
      description: description.trim() === '' ? null : description.trim(),
      is_exchange: isExchange,
      exchange_details: isExchange
        ? {
            destination_currency: accounts.find((account) => account.id === destinationAccountId)?.currency ?? draft.exchange_details?.destination_currency ?? null,
            destination_account_keyword: draft.exchange_details?.destination_account_keyword ?? null,
            destination_account_id: destinationAccountId,
            rate_override: rateOverride.trim() === '' ? null : rateOverride.trim(),
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
          <input className={fieldControlClassName} value={amount} onChange={(event) => setAmount(event.target.value)} />
        </Field>
        <Field>
          <Field.Label>Type</Field.Label>
          <select className={fieldControlClassName} value={transactionType} onChange={(event) => setTransactionType(event.target.value as TransactionType | 'transfer')}>
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
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
          </Field>
        )}
        {transactionType === 'transfer' ? (
          <Field>
            <Field.Label>Rate override</Field.Label>
            <input className={fieldControlClassName} value={rateOverride} onChange={(event) => setRateOverride(event.target.value)} placeholder="Optional" />
          </Field>
        ) : null}
        <Field className="sm:col-span-2">
          <Field.Label>Description</Field.Label>
          <textarea className={`${fieldControlClassName} min-h-20`} value={description} onChange={(event) => setDescription(event.target.value)} />
        </Field>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <Button className="w-full sm:w-auto" type="button" onClick={() => onConfirm(buildDraft())} disabled={isSubmitting}>
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
