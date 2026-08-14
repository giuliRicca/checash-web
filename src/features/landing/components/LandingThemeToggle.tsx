'use client';

import { Moon, Sun } from 'lucide-react';

import { useTheme } from '~features/theme';

export function LandingThemeToggle(): JSX.Element {
  const { state, actions } = useTheme();
  const isDark = state.resolvedTheme === 'dark';
  const label = isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro';

  return (
    <button
      className="inline-flex size-11 touch-manipulation items-center justify-center rounded-xl text-muted transition duration-200 hover:bg-surface-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98]"
      type="button"
      aria-label={label}
      title={label}
      onClick={actions.toggleTheme}
    >
      {isDark ? <Sun aria-hidden="true" size={19} /> : <Moon aria-hidden="true" size={19} />}
    </button>
  );
}

export default LandingThemeToggle;
