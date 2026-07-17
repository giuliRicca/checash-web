'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

interface ThemeContextValue {
  state: {
    mode: ThemeMode;
    resolvedTheme: ResolvedTheme;
  };
  actions: {
    setMode: (mode: ThemeMode) => void;
    toggleTheme: () => void;
  };
  meta: {
    isSystem: boolean;
  };
}

interface ThemeProviderProps {
  children: ReactNode;
}

const THEME_STORAGE_KEY = 'checash.theme';
const ThemeContext = createContext<ThemeContextValue | null>(null);

function isThemeMode(value: string | null): value is ThemeMode {
  return value === 'light' || value === 'dark' || value === 'system';
}

function getStoredThemeMode(): ThemeMode {
  if (typeof window === 'undefined') {
    return 'system';
  }

  const storedValue = window.localStorage.getItem(THEME_STORAGE_KEY);
  return isThemeMode(storedValue) ? storedValue : 'system';
}

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') {
    return 'dark';
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolveTheme(mode: ThemeMode): ResolvedTheme {
  return mode === 'system' ? getSystemTheme() : mode;
}

function applyResolvedTheme(theme: ResolvedTheme): void {
  if (typeof document === 'undefined') {
    return;
  }

  document.documentElement.classList.toggle('dark', theme === 'dark');
  document.documentElement.dataset.theme = theme;
}

export function ThemeProvider({ children }: ThemeProviderProps): JSX.Element {
  const [mode, setModeState] = useState<ThemeMode>('system');
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('dark');

  useEffect(() => {
    const storedMode = getStoredThemeMode();
    const resolved = resolveTheme(storedMode);

    // Server render cannot read theme storage; hydrate after mounting.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setModeState(storedMode);
    setResolvedTheme(resolved);
    applyResolvedTheme(resolved);
  }, []);

  useEffect(() => {
    if (mode !== 'system') {
      return undefined;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    function handleSystemThemeChange(): void {
      const resolved = getSystemTheme();
      setResolvedTheme(resolved);
      applyResolvedTheme(resolved);
    }

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, [mode]);

  function setMode(nextMode: ThemeMode): void {
    const resolved = resolveTheme(nextMode);

    window.localStorage.setItem(THEME_STORAGE_KEY, nextMode);
    setModeState(nextMode);
    setResolvedTheme(resolved);
    applyResolvedTheme(resolved);
  }

  const value = useMemo<ThemeContextValue>(
    () => ({
      state: {
        mode,
        resolvedTheme,
      },
      actions: {
        setMode,
        toggleTheme: () => setMode(resolvedTheme === 'dark' ? 'light' : 'dark'),
      },
      meta: {
        isSystem: mode === 'system',
      },
    }),
    [mode, resolvedTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (context === null) {
    throw new Error('useTheme must be used inside ThemeProvider');
  }

  return context;
}
