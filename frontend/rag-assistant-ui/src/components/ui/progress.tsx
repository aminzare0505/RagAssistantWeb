import { cn } from '@/lib/utils';

interface ProgressProps {
  /**
   * 0–100 for a determinate bar, or `null` when the remaining work is unknown.
   * The upload preview uses `null` because no byte count exists.
   */
  value: number | null;
  label: string;
  className?: string;
}

export function Progress({ value, label, className }: ProgressProps) {
  const isDeterminate = value !== null && Number.isFinite(value);
  const safeValue = isDeterminate ? Math.min(100, Math.max(0, value)) : 0;
  const rounded = Math.round(safeValue);

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={isDeterminate ? rounded : undefined}
      aria-valuetext={isDeterminate ? `${rounded}%` : label}
      className={cn('relative h-1.5 w-full overflow-hidden rounded-full bg-muted', className)}
    >
      {isDeterminate ? (
        <div
          className="h-full rounded-full bg-primary transition-[width]"
          style={{ width: `${safeValue}%` }}
        />
      ) : (
        <div className="progress-indeterminate absolute inset-y-0 rounded-full bg-primary" />
      )}
    </div>
  );
}
