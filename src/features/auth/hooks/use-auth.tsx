'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { clearStoredToken, getStoredToken, setStoredToken } from '@/lib/auth/token-store';
import { onUnauthorized } from '@/lib/api/client';
import { authApi } from '~features/auth/api/auth-api';
import type { UserRead } from '~types/api';

interface AuthCredentials {
  email: string;
  password: string;
}

interface AuthContextValue {
  token: string | null;
  user: UserRead | null;
  isBootstrapping: boolean;
  login: (credentials: AuthCredentials) => Promise<void>;
  register: (credentials: AuthCredentials) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps): JSX.Element {
  const queryClient = useQueryClient();
  const [token, setToken] = useState<string | null>(null);
  const [hasLoadedToken, setHasLoadedToken] = useState(false);

  useEffect(() => {
    setToken(getStoredToken());
    setHasLoadedToken(true);
  }, []);

  useEffect(() => onUnauthorized(() => {
    clearStoredToken();
    setToken(null);
    queryClient.clear();
  }), [queryClient]);

  const meQuery = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => authApi.me(token ?? ''),
    enabled: token !== null,
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setStoredToken(data.access_token);
      setToken(data.access_token);
    },
  });

  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      setStoredToken(data.access_token);
      setToken(data.access_token);
    },
  });

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user: meQuery.data ?? null,
      isBootstrapping: !hasLoadedToken || (token !== null && meQuery.data === undefined && meQuery.error === null),
      login: async (credentials) => {
        await loginMutation.mutateAsync(credentials);
      },
      register: async (credentials) => {
        await registerMutation.mutateAsync(credentials);
      },
      logout: () => {
        clearStoredToken();
        setToken(null);
        queryClient.clear();
      },
    }),
    [hasLoadedToken, loginMutation, meQuery.data, meQuery.error, queryClient, registerMutation, token],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
