import { apiRequest } from '@/lib/api/client';
import type { PasswordChange, UserPreferencesRead, UserPreferencesUpdate, UserProfileUpdate, UserRead } from '~types/api';

export const usersApi = {
  updateProfile(payload: UserProfileUpdate): Promise<UserRead> {
    return apiRequest<UserRead, UserProfileUpdate>('/users/me', { method: 'PATCH', body: payload });
  },
  changePassword(payload: PasswordChange): Promise<void> {
    return apiRequest<void, PasswordChange>('/users/me/password', { method: 'POST', body: payload });
  },
  updatePreferences(payload: UserPreferencesUpdate): Promise<UserPreferencesRead> {
    return apiRequest<UserPreferencesRead, UserPreferencesUpdate>('/users/me/preferences', { method: 'PATCH', body: payload });
  },
};
