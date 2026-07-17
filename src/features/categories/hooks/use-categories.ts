import { useSuspenseQuery } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseMutationResult } from '@tanstack/react-query';

import { categoriesApi } from '~features/categories/api/categories-api';
import type { CategoryCreate, CategoryRead, CategoryUpdate } from '~types/api';

export const categoriesQueryKey = ['categories'] as const;

export function useCategoriesQuery(token: string, userId: string): { data: CategoryRead[] } {
  return useSuspenseQuery({
    queryKey: [...categoriesQueryKey, userId],
    queryFn: () => categoriesApi.list(token),
    staleTime: 5 * 60_000,
  });
}

export function useCreateCategoryMutation(): UseMutationResult<CategoryRead, Error, CategoryCreate> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: categoriesApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: categoriesQueryKey }),
  });
}

export function useUpdateCategoryMutation(
  categoryId: string,
): UseMutationResult<CategoryRead, Error, CategoryUpdate> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => categoriesApi.update(categoryId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: categoriesQueryKey }),
  });
}

export function useDeleteCategoryMutation(): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: categoriesApi.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: categoriesQueryKey }),
  });
}
