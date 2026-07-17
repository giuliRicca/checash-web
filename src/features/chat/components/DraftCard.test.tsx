import { describe, expect, it } from 'vitest';

import { getDraftValidationError } from '~features/chat/helpers/draft-validation';
import type { CategoryRead } from '~types/api';

const categories: CategoryRead[] = [
  { id: 'expense', user_id: null, name: 'Miscellaneous', slug: 'miscellaneous', type: 'expense', is_system: true },
  { id: 'income', user_id: null, name: 'Income', slug: 'income', type: 'income', is_system: true },
];

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
