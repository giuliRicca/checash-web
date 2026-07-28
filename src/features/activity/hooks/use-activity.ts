import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { activityApi } from '~features/activity/api/activity-api';
import type { ActivityFeed } from '~types/api';

export const activityQueryKey = ['activity'] as const;

interface UseActivityResult {
  activity: ActivityFeed;
  pageNumber: number;
  previousPage: () => void;
  nextPage: () => void;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  isLoadingPage: boolean;
  pageError: string | null;
}

export function useActivityQuery(token: string, userId: string, limit = 15): UseActivityResult {
  const [pageIndex, setPageIndex] = useState(0);
  const activityQuery = useSuspenseInfiniteQuery({
    queryKey: [...activityQueryKey, userId, limit],
    queryFn: ({ pageParam }) => activityApi.list(limit, pageParam, token),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.next_cursor,
  });
  const pages = activityQuery.data.pages;
  const activity = pages[pageIndex] ?? pages[0];
  const hasPreviousPage = pageIndex > 0;
  const hasCachedNextPage = pageIndex < pages.length - 1;
  const hasNextPage = hasCachedNextPage || activity.next_cursor !== null;

  async function fetchNextPage(): Promise<void> {
    if (hasCachedNextPage) {
      setPageIndex((currentPage) => currentPage + 1);
      return;
    }
    if (activity.next_cursor === null) return;

    const result = await activityQuery.fetchNextPage();
    if (result.data !== undefined && result.data.pages.length > pageIndex + 1) {
      setPageIndex((currentPage) => currentPage + 1);
    }
  }

  return {
    activity,
    pageNumber: pageIndex + 1,
    previousPage: () => {
      setPageIndex((currentPage) => Math.max(currentPage - 1, 0));
    },
    nextPage: () => {
      void fetchNextPage();
    },
    hasPreviousPage,
    hasNextPage,
    isLoadingPage: activityQuery.isFetchingNextPage,
    pageError: activityQuery.isFetchNextPageError ? 'Could not load next activity page. Try again.' : null,
  };
}
