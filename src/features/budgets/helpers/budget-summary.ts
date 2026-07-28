import type { BudgetMonthSummary, Currency } from '~types/api';

export interface BudgetChartRow {
  id: string;
  categoryName: string;
  amount: number;
  color: string;
}

const chartColors = ['#2563eb', '#7c3aed', '#db2777', '#ea580c', '#ca8a04', '#16a34a', '#0891b2', '#4f46e5', '#be123c', '#65a30d'];

function colorForCategory(categoryId: string): string {
  let hash = 0;
  for (let index = 0; index < categoryId.length; index += 1) {
    hash = (hash * 31 + categoryId.charCodeAt(index)) | 0;
  }
  return chartColors[Math.abs(hash) % chartColors.length] ?? chartColors[0];
}

const statusOrder: Record<BudgetMonthSummary['status'], number> = {
  over_budget: 0,
  at_limit: 1,
  on_track: 2,
};

export function sortBudgetSummaries(budgets: BudgetMonthSummary[]): BudgetMonthSummary[] {
  return [...budgets].sort((left, right) => {
    const statusDifference = statusOrder[left.status] - statusOrder[right.status];
    if (statusDifference !== 0) return statusDifference;

    const percentageDifference = Number(right.percentage) - Number(left.percentage);
    if (Number.isFinite(percentageDifference) && percentageDifference !== 0) return percentageDifference;

    return left.category_name.localeCompare(right.category_name, 'es');
  });
}

export function groupBudgetChartRows(budgets: BudgetMonthSummary[]): Record<Currency, BudgetChartRow[]> {
  const groups: Record<Currency, BudgetChartRow[]> = { ARS: [], USD: [] };

  for (const budget of sortBudgetSummaries(budgets)) {
    const amount = Number(budget.amount);
    if (!Number.isFinite(amount) || amount <= 0) continue;

    groups[budget.currency].push({
      id: budget.id,
      categoryName: budget.category_name,
      amount,
      color: colorForCategory(budget.category_id),
    });
  }

  return groups;
}
