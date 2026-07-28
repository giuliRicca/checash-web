import { describe, expect, it, vi } from 'vitest';

const { apiRequest } = vi.hoisted(() => ({ apiRequest: vi.fn() }));

vi.mock('@/lib/api/client', () => ({ apiRequest }));

import { budgetsApi } from '~features/budgets/api/budgets-api';

describe('budgetsApi.update', () => {
  it('patches only mutable budget fields', () => {
    budgetsApi.update('budget-1', { amount: '150.00', currency: 'USD' });

    expect(apiRequest).toHaveBeenCalledWith('/budgets/budget-1', { method: 'PATCH', body: { amount: '150.00', currency: 'USD' } });
  });
});
