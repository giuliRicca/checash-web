import { apiRequest } from '@/lib/api/client';
import type { UserPreferencesRead, UserPreferencesUpdate } from '~types/api';

export const usersApi = {
  updatePreferences(payload: UserPreferencesUpdate): Promise<UserPreferencesRead> {
    return apiRequest<UserPreferencesRead, UserPreferencesUpdate>('/users/me/preferences', { method: 'PATCH', body: payload });
  },
};
