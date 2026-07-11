import { apiRequest } from '@/lib/api/client';
import type { TokenResponse, UserRead } from '~types/api';

interface AuthCredentials {
  email: string;
  password: string;
}

export const authApi = {
  register(credentials: AuthCredentials): Promise<TokenResponse> {
    return apiRequest<TokenResponse, AuthCredentials>('/auth/register', {
      method: 'POST',
      body: credentials,
      token: null,
    });
  },
  login(credentials: AuthCredentials): Promise<TokenResponse> {
    return apiRequest<TokenResponse, AuthCredentials>('/auth/login', {
      method: 'POST',
      body: credentials,
      token: null,
    });
  },
  me(token: string): Promise<UserRead> {
    return apiRequest<UserRead>('/auth/me', { token });
  },
};
