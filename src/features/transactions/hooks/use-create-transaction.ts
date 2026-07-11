import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseMutationResult } from '@tanstack/react-query';

import { accountsQueryKey, netWorthQueryKey } from '~features/accounts';
import { transactionsApi } from '~features/transactions/api/transactions-api';
import type { TransactionCreate, TransactionRead } from '~types/api';

export function useCreateTransactionMutation(): UseMutationResult<TransactionRead, Error, TransactionCreate> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: transactionsApi.create,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: accountsQueryKey }),
        queryClient.invalidateQueries({ queryKey: netWorthQueryKey }),
      ]);
    },
  });
}
