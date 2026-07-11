import { apiRequest } from '@/lib/api/client';
import type { TransactionCreate, TransactionRead } from '~types/api';

export const transactionsApi = {
  create(payload: TransactionCreate): Promise<TransactionRead> {
    return apiRequest<TransactionRead, TransactionCreate>('/transactions', {
      method: 'POST',
      body: payload,
    });
  },
};
