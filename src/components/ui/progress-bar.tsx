import { cn } from '@/lib/ui/cn';

type ProgressTone = 'primary' | 'success' | 'warning' | 'info' | 'danger';

interface ProgressBarProps {
  value: number;
  tone?: ProgressTone;
  className?: string;
}

const toneClasses: Record<ProgressTone, string> = {
  primary: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  info: 'bg-info',
  danger: 'bg-danger',
};

export function ProgressBar({ value, tone = 'primary', className }: ProgressBarProps): JSX.Element {
  const width = Math.min(Math.max(value, 0), 100);

  return (
    <div className={cn('h-2 overflow-hidden rounded-full bg-surface-elevated', className)}>
      <div className={cn('h-full rounded-full', toneClasses[tone])} style={{ width: `${width}%` }} />
    </div>
  );
}
