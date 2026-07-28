import { describe, expect, it } from 'vitest';

import { groupBudgetChartRows, sortBudgetSummaries } from '~features/budgets/helpers/budget-summary';
import type { BudgetMonthSummary } from '~types/api';

function budget(overrides: Partial<BudgetMonthSummary>): BudgetMonthSummary {
  return {
    id: 'budget-1',
    category_id: 'category-1',
    category_name: 'Food',
    amount: '100.00',
    currency: 'ARS',
    created_at: '2026-07-01T00:00:00Z',
    spent: '25.00',
    remaining: '75.00',
    percentage: '25.00',
    status: 'on_track',
    ...overrides,
  };
}

describe('budget summary helpers', () => {
  it('sorts attention-needed budgets before on-track budgets', () => {
    const sorted = sortBudgetSummaries([
      budget({ id: 'on-track', category_name: 'Transport', percentage: '80.00' }),
      budget({ id: 'at-limit', category_name: 'Food', percentage: '100.00', status: 'at_limit' }),
      budget({ id: 'over-budget', category_name: 'Home', percentage: '120.00', status: 'over_budget' }),
    ]);

    expect(sorted.map((item) => item.id)).toEqual(['over-budget', 'at-limit', 'on-track']);
  });

  it('groups finite ARS and USD rows without mixing currencies', () => {
    const groups = groupBudgetChartRows([
      budget({ id: 'ars', currency: 'ARS', spent: '40.00' }),
      budget({ id: 'usd', currency: 'USD', category_name: 'Travel', amount: '10.00', spent: '7.00', percentage: '70.00' }),
      budget({ id: 'invalid', amount: 'not-money' }),
    ]);

    expect(groups.ARS.map((item) => item.id)).toEqual(['ars']);
    expect(groups.USD).toEqual([expect.objectContaining({ id: 'usd', amount: 10 })]);
  });

  it('assigns stable colors from category IDs', () => {
    const first = groupBudgetChartRows([budget({ category_id: 'food' })]);
    const second = groupBudgetChartRows([budget({ category_id: 'food' })]);

    expect(first.ARS[0]?.color).toBe(second.ARS[0]?.color);
  });
});
