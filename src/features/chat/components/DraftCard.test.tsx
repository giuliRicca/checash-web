import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { DraftCard } from '~features/chat/components/DraftCard';
import { getDraftValidationError } from '~features/chat/helpers/draft-validation';
import type { AccountRead, CategoryRead, ChatDraft } from '~types/api';

const categories: CategoryRead[] = [
  { id: 'expense', user_id: null, name: 'Miscellaneous', slug: 'miscellaneous', type: 'expense', is_system: true },
  { id: 'income', user_id: null, name: 'Income', slug: 'income', type: 'income', is_system: true },
];

const accounts: AccountRead[] = [
  { id: 'account', name: 'Cash', currency: 'ARS', opening_balance: '100.00', balance: '100.00', rate_type: 'blue', archived_at: null },
];

const usdDraft: ChatDraft = {
  amount: '10.00',
  currency: 'USD',
  account_keyword: null,
  account_id: 'account',
  category_id: 'expense',
  category_name: 'Miscellaneous',
  transaction_type: 'expense',
  description: 'Coffee',
  is_exchange: false,
  exchange_details: null,
  needs_review: true,
  occurred_at: '2026-07-23T12:00:00Z',
};

describe('getDraftValidationError', () => {
  it('rejects missing or zero amounts', () => {
    expect(getDraftValidationError('', 'expense', 'account', 'expense', '', '', categories)).toBe('Enter an amount greater than 0.');
    expect(getDraftValidationError('0', 'expense', 'account', 'expense', '', '', categories)).toBe('Enter an amount greater than 0.');
  });

  it('rejects category type mismatch', () => {
    expect(getDraftValidationError('10', 'income', 'account', 'expense', '', '', categories)).toBe('Select a category matching transaction type.');
  });

  it('rejects same-account transfers and invalid rate overrides', () => {
    expect(getDraftValidationError('10', 'transfer', 'account', '', 'account', '', categories)).toBe('Transfer accounts must be different.');
    expect(getDraftValidationError('10', 'transfer', 'account', '', 'other', '0', categories)).toBe('Rate override must be greater than 0.');
  });
});

describe('DraftCard', () => {
  it('shows parsed currency and submits user currency changes', () => {
    const onConfirm = vi.fn();
    render(<DraftCard accounts={accounts} categories={categories} draft={usdDraft} isSubmitting={false} onCancel={vi.fn()} onConfirm={onConfirm} />);

    const currency = screen.getByLabelText('Currency');
    expect(currency).toHaveValue('USD');
    fireEvent.change(currency, { target: { value: 'ARS' } });
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));

    expect(onConfirm).toHaveBeenCalledWith(expect.objectContaining({ currency: 'ARS' }));
  });
});
