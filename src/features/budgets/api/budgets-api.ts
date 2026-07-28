import { apiRequest } from '@/lib/api/client';
import type { BudgetCreate, BudgetMonthSummary, BudgetRead, BudgetUpdate } from '~types/api';

export const budgetsApi = {
  monthSummary(token?: string | null): Promise<BudgetMonthSummary[]> {
    return apiRequest<BudgetMonthSummary[]>('/budgets/month-summary', { token });
  },
  create(payload: BudgetCreate): Promise<BudgetRead> {
    return apiRequest<BudgetRead, BudgetCreate>('/budgets', { method: 'POST', body: payload });
  },
  update(budgetId: string, payload: BudgetUpdate): Promise<BudgetRead> {
    return apiRequest<BudgetRead, BudgetUpdate>(`/budgets/${budgetId}`, { method: 'PATCH', body: payload });
  },
  delete(budgetId: string): Promise<void> {
    return apiRequest<void>(`/budgets/${budgetId}`, { method: 'DELETE' });
  },
};
