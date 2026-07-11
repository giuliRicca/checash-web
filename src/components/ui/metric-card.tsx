import type { ReactNode } from 'react';

import { cn } from '@/lib/ui/cn';
import { IconBadge } from '@/components/ui/icon-badge';

type MetricTone = 'primary' | 'success' | 'danger' | 'neutral';

interface MetricCardProps {
  label: string;
  value: string;
  icon: ReactNode;
  tone?: MetricTone;
  trend?: string;
  className?: string;
}

const trendClasses: Record<MetricTone, string> = {
  primary: 'text-primary',
  success: 'text-success',
  danger: 'text-danger',
  neutral: 'text-muted',
};

export function MetricCard({ label, value, icon, tone = 'neutral', trend, className }: MetricCardProps): JSX.Element {
  return (
    <article className={cn('rounded-2xl border border-border bg-surface p-6 shadow-sm', className)}>
      <div className="flex items-start justify-between gap-4">
        <IconBadge tone={tone === 'neutral' ? 'neutral' : tone}>{icon}</IconBadge>
        {trend !== undefined ? <p className={cn('text-sm font-semibold', trendClasses[tone])}>{trend}</p> : null}
      </div>
      <div className="mt-5">
        <p className="text-sm text-muted">{label}</p>
        <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">{value}</p>
      </div>
    </article>
  );
}
