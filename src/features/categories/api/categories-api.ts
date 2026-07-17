import { apiRequest } from '@/lib/api/client';
import type { CategoryCreate, CategoryRead, CategoryUpdate } from '~types/api';

export const categoriesApi = {
  list(token?: string | null): Promise<CategoryRead[]> {
    return apiRequest<CategoryRead[]>('/categories', { token });
  },
  create(payload: CategoryCreate): Promise<CategoryRead> {
    return apiRequest<CategoryRead, CategoryCreate>('/categories', { method: 'POST', body: payload });
  },
  update(categoryId: string, payload: CategoryUpdate): Promise<CategoryRead> {
    return apiRequest<CategoryRead, CategoryUpdate>(`/categories/${categoryId}`, { method: 'PATCH', body: payload });
  },
  delete(categoryId: string): Promise<void> {
    return apiRequest<void>(`/categories/${categoryId}`, { method: 'DELETE' });
  },
};
