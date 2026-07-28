import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseMutationResult } from '@tanstack/react-query';

import { usersApi } from '~features/users/api/users-api';
import type { PasswordChange, UserPreferencesRead, UserPreferencesUpdate, UserProfileUpdate, UserRead } from '~types/api';

export function useUpdateProfileMutation(): UseMutationResult<UserRead, Error, UserProfileUpdate> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: usersApi.updateProfile,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['auth', 'me'] }),
  });
}

export function useChangePasswordMutation(): UseMutationResult<void, Error, PasswordChange> {
  return useMutation({ mutationFn: usersApi.changePassword });
}

export function useUpdatePreferencesMutation(): UseMutationResult<
  UserPreferencesRead,
  Error,
  UserPreferencesUpdate
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: usersApi.updatePreferences,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['auth', 'me'] }),
  });
}
