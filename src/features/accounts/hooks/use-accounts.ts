import { useSuspenseQuery } from '@tanstack/react-query';

import { accountsApi } from '~features/accounts/api/accounts-api';
import type { AccountRead, NetWorthRead } from '~types/api';

export const accountsQueryKey = ['accounts'] as const;
export const netWorthQueryKey = ['accounts', 'net-worth'] as const;

export function useAccountsQuery(): { data: AccountRead[] } {
  return useSuspenseQuery({
    queryKey: accountsQueryKey,
    queryFn: accountsApi.list,
  });
}

export function useNetWorthQuery(): { data: NetWorthRead } {
  return useSuspenseQuery({
    queryKey: netWorthQueryKey,
    queryFn: accountsApi.netWorth,
  });
}
