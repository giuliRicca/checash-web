import { useSuspenseInfiniteQuery, useSuspenseQuery } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseMutationResult } from '@tanstack/react-query';

import { accountsApi } from '~features/accounts/api/accounts-api';
import { activityQueryKey } from '~features/activity';
import type { AccountAdjustmentCreate, AccountCreate, AccountRead, AccountUpdate, ActivityFeed, NetWorthHistoryRead, NetWorthRead, TransactionRead } from '~types/api';

export const accountsQueryKey = ['accounts'] as const;
export const netWorthQueryKey = ['accounts', 'net-worth'] as const;
export const netWorthHistoryQueryKey = ['accounts', 'net-worth-history'] as const;
export const accountQueryKey = (accountId: string): readonly ['accounts', 'detail', string] => ['accounts', 'detail', accountId] as const;
export const accountActivityQueryKey = (accountId: string): readonly ['accounts', 'activity', string] => ['accounts', 'activity', accountId] as const;

export function useAccountsQuery(token: string, userId: string): { data: AccountRead[] } {
  return useSuspenseQuery({
    queryKey: [...accountsQueryKey, userId],
    queryFn: () => accountsApi.list(token),
  });
}

export function useAccountQuery(token: string, userId: string, accountId: string): { data: AccountRead } {
  return useSuspenseQuery({
    queryKey: [...accountQueryKey(accountId), userId],
    queryFn: () => accountsApi.get(accountId, token),
  });
}

export function useNetWorthQuery(token: string, userId: string): { data: NetWorthRead } {
  return useSuspenseQuery({
    queryKey: [...netWorthQueryKey, userId],
    queryFn: () => accountsApi.netWorth(token),
  });
}

export function useNetWorthHistoryQuery(token: string, userId: string): { data: NetWorthHistoryRead } {
  return useSuspenseQuery({
    queryKey: [...netWorthHistoryQueryKey, userId],
    queryFn: () => accountsApi.netWorthHistory(token),
  });
}

export function useAccountDetailQueries(token: string, userId: string, accountId: string): {
  account: AccountRead;
  activity: ActivityFeed;
  loadMore: () => void;
  hasMore: boolean;
  isLoadingMore: boolean;
  loadMoreError: string | null;
} {
  const accountQuery = useSuspenseQuery({
    queryKey: [...accountQueryKey(accountId), userId],
    queryFn: () => accountsApi.get(accountId, token),
  });
  const activityQuery = useSuspenseInfiniteQuery({
    queryKey: [...accountActivityQueryKey(accountId), userId],
    queryFn: ({ pageParam }) => accountsApi.activity(accountId, pageParam, token),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.next_cursor,
  });

  return {
    account: accountQuery.data,
    activity: {
      items: activityQuery.data.pages.flatMap((page) => page.items),
      next_cursor: activityQuery.data.pages.at(-1)?.next_cursor ?? null,
    },
    loadMore: () => {
      void activityQuery.fetchNextPage();
    },
    hasMore: activityQuery.hasNextPage,
    isLoadingMore: activityQuery.isFetchingNextPage,
    loadMoreError: activityQuery.isFetchNextPageError ? 'Could not load more activity. Try again.' : null,
  };
}

export function useCreateAccountMutation(): UseMutationResult<AccountRead, Error, AccountCreate> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: accountsApi.create,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: accountsQueryKey }),
        queryClient.invalidateQueries({ queryKey: netWorthQueryKey }),
        queryClient.invalidateQueries({ queryKey: netWorthHistoryQueryKey }),
      ]);
    },
  });
}

export function useUpdateAccountMutation(accountId: string): UseMutationResult<AccountRead, Error, AccountUpdate> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => accountsApi.update(accountId, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: accountsQueryKey }),
        queryClient.invalidateQueries({ queryKey: accountQueryKey(accountId) }),
        queryClient.invalidateQueries({ queryKey: accountActivityQueryKey(accountId) }),
        queryClient.invalidateQueries({ queryKey: netWorthQueryKey }),
        queryClient.invalidateQueries({ queryKey: netWorthHistoryQueryKey }),
      ]);
    },
  });
}

export function useCreateAccountAdjustmentMutation(accountId: string): UseMutationResult<TransactionRead, Error, AccountAdjustmentCreate> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => accountsApi.adjustBalance(accountId, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: accountsQueryKey }),
        queryClient.invalidateQueries({ queryKey: accountQueryKey(accountId) }),
        queryClient.invalidateQueries({ queryKey: accountActivityQueryKey(accountId) }),
        queryClient.invalidateQueries({ queryKey: activityQueryKey }),
        queryClient.invalidateQueries({ queryKey: netWorthQueryKey }),
        queryClient.invalidateQueries({ queryKey: netWorthHistoryQueryKey }),
      ]);
    },
  });
}

export function useDeleteAccountMutation(accountId: string): UseMutationResult<void, Error, void> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => accountsApi.delete(accountId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: accountsQueryKey }),
        queryClient.invalidateQueries({ queryKey: activityQueryKey }),
        queryClient.invalidateQueries({ queryKey: netWorthQueryKey }),
        queryClient.invalidateQueries({ queryKey: netWorthHistoryQueryKey }),
        queryClient.invalidateQueries({ queryKey: ['auth', 'me'] }),
      ]);
    },
  });
}
