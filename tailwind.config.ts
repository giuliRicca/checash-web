import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background) / <alpha-value>)',
        foreground: 'hsl(var(--foreground) / <alpha-value>)',
        surface: 'hsl(var(--surface) / <alpha-value>)',
        'surface-muted': 'hsl(var(--surface-muted) / <alpha-value>)',
        'surface-elevated': 'hsl(var(--surface-elevated) / <alpha-value>)',
        border: 'hsl(var(--border) / <alpha-value>)',
        'border-strong': 'hsl(var(--border-strong) / <alpha-value>)',
        muted: 'hsl(var(--muted) / <alpha-value>)',
        'muted-foreground': 'hsl(var(--muted-foreground) / <alpha-value>)',
        primary: 'hsl(var(--primary) / <alpha-value>)',
        'primary-muted': 'hsl(var(--primary-muted) / <alpha-value>)',
        'primary-foreground': 'hsl(var(--primary-foreground) / <alpha-value>)',
        success: 'hsl(var(--success) / <alpha-value>)',
        'success-muted': 'hsl(var(--success-muted) / <alpha-value>)',
        danger: 'hsl(var(--danger) / <alpha-value>)',
        'danger-muted': 'hsl(var(--danger-muted) / <alpha-value>)',
        warning: 'hsl(var(--warning) / <alpha-value>)',
        'warning-muted': 'hsl(var(--warning-muted) / <alpha-value>)',
        info: 'hsl(var(--info) / <alpha-value>)',
        'info-muted': 'hsl(var(--info-muted) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
