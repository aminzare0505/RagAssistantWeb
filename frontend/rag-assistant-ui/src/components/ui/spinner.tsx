import { LoaderCircle } from 'lucide-react';

import { useLanguage } from '@/i18n/use-language';
import { cn } from '@/lib/utils';

const spinnerSizes = {
  sm: 'size-4',
  md: 'size-5',
  lg: 'size-6',
} as const;

interface SpinnerProps {
  className?: string;
  label?: string;
  size?: keyof typeof spinnerSizes;
}

export function Spinner({ className, label, size = 'md' }: SpinnerProps) {
  const { t } = useLanguage();

  return (
    <span role="status" className={cn('inline-flex items-center gap-2', className)}>
      <LoaderCircle aria-hidden className={cn('animate-spin', spinnerSizes[size])} />
      <span className="sr-only">{label ?? t.loading.generic}</span>
    </span>
  );
}
