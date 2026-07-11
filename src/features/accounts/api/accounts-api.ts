import { apiRequest } from '@/lib/api/client';
import type { AccountCreate, AccountRead, NetWorthRead } from '~types/api';

export const accountsApi = {
  list(): Promise<AccountRead[]> {
    return apiRequest<AccountRead[]>('/accounts');
  },
  netWorth(): Promise<NetWorthRead> {
    return apiRequest<NetWorthRead>('/accounts/net-worth');
  },
  create(payload: AccountCreate): Promise<AccountRead> {
    return apiRequest<AccountRead, AccountCreate>('/accounts', { method: 'POST', body: payload });
  },
};
