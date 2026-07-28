import { apiRequest } from '@/lib/api/client';
import type { ActivityFeed } from '~types/api';

export const activityApi = {
  list(limit: number, cursor?: string | null, token?: string | null): Promise<ActivityFeed> {
    const query = new URLSearchParams({ limit: String(limit) });
    if (cursor !== null && cursor !== undefined) query.set('cursor', cursor);
    return apiRequest<ActivityFeed>(`/activity?${query.toString()}`, { token });
  },
};
