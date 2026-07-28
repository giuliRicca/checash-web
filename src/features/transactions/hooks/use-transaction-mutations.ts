import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseMutationResult } from '@tanstack/react-query';

import { accountsQueryKey, netWorthHistoryQueryKey, netWorthQueryKey } from '~features/accounts/hooks/use-accounts';
import { activityQueryKey } from '~features/activity/hooks/use-activity';
import { budgetSummaryQueryKey } from '~features/budgets/hooks/use-budgets';
import { transactionsApi } from '~features/transactions/api/transactions-api';
import { monthSummaryQueryKey } from '~features/transactions/hooks/use-month-summary';
import type { TransactionRead, TransactionUpdate } from '~types/api';

async function invalidateTransactionData(queryClient: ReturnType<typeof useQueryClient>): Promise<void> {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: accountsQueryKey }),
    queryClient.invalidateQueries({ queryKey: netWorthQueryKey }),
    queryClient.invalidateQueries({ queryKey: netWorthHistoryQueryKey }),
    queryClient.invalidateQueries({ queryKey: monthSummaryQueryKey }),
    queryClient.invalidateQueries({ queryKey: budgetSummaryQueryKey }),
    queryClient.invalidateQueries({ queryKey: activityQueryKey }),
  ]);
}

export function useUpdateTransactionMutation(transactionId: string): UseMutationResult<TransactionRead, Error, TransactionUpdate> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => transactionsApi.update(transactionId, payload),
    onSuccess: async () => invalidateTransactionData(queryClient),
  });
}

export function useDeleteTransactionMutation(): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: transactionsApi.delete,
    onSuccess: async () => invalidateTransactionData(queryClient),
  });
}
