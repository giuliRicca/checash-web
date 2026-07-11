import type { ReactNode } from 'react';

import { cn } from '@/lib/ui/cn';

type IconBadgeTone = 'primary' | 'success' | 'danger' | 'warning' | 'info' | 'neutral';

interface IconBadgeProps {
  tone?: IconBadgeTone;
  children: ReactNode;
  className?: string;
}

const toneClasses: Record<IconBadgeTone, string> = {
  primary: 'bg-primary-muted text-primary',
  success: 'bg-success-muted text-success',
  danger: 'bg-danger-muted text-danger',
  warning: 'bg-warning-muted text-warning',
  info: 'bg-info-muted text-info',
  neutral: 'bg-surface-elevated text-muted',
};

export function IconBadge({ tone = 'neutral', children, className }: IconBadgeProps): JSX.Element {
  return <span className={cn('inline-flex size-11 items-center justify-center rounded-xl', toneClasses[tone], className)}>{children}</span>;
}
