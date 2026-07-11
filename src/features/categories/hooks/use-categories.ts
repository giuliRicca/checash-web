import { useSuspenseQuery } from '@tanstack/react-query';

import { categoriesApi } from '~features/categories/api/categories-api';
import type { CategoryRead } from '~types/api';

export const categoriesQueryKey = ['categories'] as const;

export function useCategoriesQuery(): { data: CategoryRead[] } {
  return useSuspenseQuery({
    queryKey: categoriesQueryKey,
    queryFn: categoriesApi.list,
    staleTime: 5 * 60_000,
  });
}
