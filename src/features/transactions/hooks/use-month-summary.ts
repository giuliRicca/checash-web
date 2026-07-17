import { useSuspenseQuery } from '@tanstack/react-query';

import { transactionsApi } from '~features/transactions/api/transactions-api';
import type { TransactionMonthSummaryRead } from '~types/api';

export const monthSummaryQueryKey = ['transactions', 'month-summary'] as const;

export function useMonthSummaryQuery(token: string, userId: string): { data: TransactionMonthSummaryRead } {
  return useSuspenseQuery({
    queryKey: [...monthSummaryQueryKey, userId],
    queryFn: () => transactionsApi.monthSummary(token),
  });
}
