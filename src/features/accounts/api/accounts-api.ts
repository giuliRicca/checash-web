import { apiRequest } from '@/lib/api/client';
import type { AccountCreate, AccountRead, AccountUpdate, ActivityFeed, NetWorthRead } from '~types/api';

export const accountsApi = {
  list(token?: string | null): Promise<AccountRead[]> {
    return apiRequest<AccountRead[]>('/accounts', { token });
  },
  get(accountId: string, token?: string | null): Promise<AccountRead> {
    return apiRequest<AccountRead>(`/accounts/${accountId}`, { token });
  },
  netWorth(token?: string | null): Promise<NetWorthRead> {
    return apiRequest<NetWorthRead>('/accounts/net-worth', { token });
  },
  create(payload: AccountCreate): Promise<AccountRead> {
    return apiRequest<AccountRead, AccountCreate>('/accounts', { method: 'POST', body: payload });
  },
  update(accountId: string, payload: AccountUpdate): Promise<AccountRead> {
    return apiRequest<AccountRead, AccountUpdate>(`/accounts/${accountId}`, { method: 'PATCH', body: payload });
  },
  activity(accountId: string, cursor?: string | null, token?: string | null): Promise<ActivityFeed> {
    const query = cursor === null || cursor === undefined ? '' : `?cursor=${encodeURIComponent(cursor)}`;
    return apiRequest<ActivityFeed>(`/accounts/${accountId}/activity${query}`, { token });
  },
};
