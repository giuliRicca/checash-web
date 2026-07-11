import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { AppProviders } from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'Che Cash',
  description: 'Chat-driven dual-currency personal finance app',
};

interface RootLayoutProps {
  children: ReactNode;
}

const themeScript = `
(() => {
  try {
    const storedTheme = window.localStorage.getItem('checash.theme');
    const mode = storedTheme === 'light' || storedTheme === 'dark' || storedTheme === 'system' ? storedTheme : 'system';
    const resolvedTheme = mode === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : mode;
    document.documentElement.classList.toggle('dark', resolvedTheme === 'dark');
    document.documentElement.dataset.theme = resolvedTheme;
  } catch {
    document.documentElement.classList.add('dark');
    document.documentElement.dataset.theme = 'dark';
  }
})();
`;

export default function RootLayout({ children }: RootLayoutProps): JSX.Element {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
