import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import type { UseMutationResult } from '@tanstack/react-query';

import { budgetsApi } from '~features/budgets/api/budgets-api';
import type { BudgetCreate, BudgetMonthSummary, BudgetRead, BudgetUpdate } from '~types/api';

export const budgetsQueryKey = ['budgets'] as const;
export const budgetSummaryQueryKey = ['budgets', 'month-summary'] as const;

export function useBudgetSummaryQuery(token: string, userId: string): { data: BudgetMonthSummary[] } {
  return useSuspenseQuery({ queryKey: [...budgetSummaryQueryKey, userId], queryFn: () => budgetsApi.monthSummary(token) });
}

export function useCreateBudgetMutation(): UseMutationResult<BudgetRead, Error, BudgetCreate> {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: budgetsApi.create, onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: budgetsQueryKey }); } });
}

export function useUpdateBudgetMutation(budgetId: string): UseMutationResult<BudgetRead, Error, BudgetUpdate> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => budgetsApi.update(budgetId, payload),
    onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: budgetsQueryKey }); },
  });
}

export function useDeleteBudgetMutation(): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: budgetsApi.delete, onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: budgetsQueryKey }); } });
}
