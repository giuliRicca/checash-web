import { describe, expect, it, vi } from 'vitest';

const { apiRequest } = vi.hoisted(() => ({ apiRequest: vi.fn() }));

vi.mock('@/lib/api/client', () => ({ apiRequest }));

import { transactionsApi } from '~features/transactions/api/transactions-api';

describe('transaction updates', () => {
  it('patches editable transaction fields', () => {
    transactionsApi.update('transaction-1', { amount: '10.00', currency: 'USD', description: null });

    expect(apiRequest).toHaveBeenCalledWith('/transactions/transaction-1', { method: 'PATCH', body: { amount: '10.00', currency: 'USD', description: null } });
  });

  it('deletes a transaction', () => {
    transactionsApi.delete('transaction-1');

    expect(apiRequest).toHaveBeenCalledWith('/transactions/transaction-1', { method: 'DELETE' });
  });
});
