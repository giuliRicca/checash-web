import { apiRequest } from '@/lib/api/client';
import type { TransactionCreate, TransactionMonthSummaryRead, TransactionRead } from '~types/api';

export const transactionsApi = {
  monthSummary(token?: string | null): Promise<TransactionMonthSummaryRead> {
    return apiRequest<TransactionMonthSummaryRead>('/transactions/month-summary', { token });
  },
  create(payload: TransactionCreate): Promise<TransactionRead> {
    return apiRequest<TransactionRead, TransactionCreate>('/transactions', {
      method: 'POST',
      body: payload,
    });
  },
};
