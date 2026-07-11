import type { ReactNode } from 'react';

import { cn } from '@/lib/ui/cn';

interface PanelRootProps {
  children: ReactNode;
  className?: string;
}

interface PanelSectionProps {
  children: ReactNode;
  className?: string;
}

function PanelRoot({ children, className }: PanelRootProps): JSX.Element {
  return <section className={cn('rounded-2xl border border-border bg-surface shadow-sm', className)}>{children}</section>;
}

function PanelHeader({ children, className }: PanelSectionProps): JSX.Element {
  return <div className={cn('border-b border-border px-4 py-4 sm:px-6 sm:py-5', className)}>{children}</div>;
}

function PanelTitle({ children, className }: PanelSectionProps): JSX.Element {
  return <h2 className={cn('text-lg font-semibold text-foreground', className)}>{children}</h2>;
}

function PanelBody({ children, className }: PanelSectionProps): JSX.Element {
  return <div className={cn('p-4 sm:p-6', className)}>{children}</div>;
}

export const Panel = Object.assign(PanelRoot, {
  Header: PanelHeader,
  Title: PanelTitle,
  Body: PanelBody,
});
