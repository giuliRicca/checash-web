import { apiRequest } from '@/lib/api/client';
import type { CategoryRead } from '~types/api';

export const categoriesApi = {
  list(): Promise<CategoryRead[]> {
    return apiRequest<CategoryRead[]>('/categories');
  },
};
