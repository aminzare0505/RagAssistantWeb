import { CircleAlert, CircleCheck, Unplug, type LucideIcon } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/i18n/use-language';
import { cn } from '@/lib/utils';

import type { DataSourceStatus } from '../types';

interface StatusStyle {
  icon: LucideIcon;
  tone: 'warning' | 'success' | 'destructive';
  iconClassName: string;
}

const STATUS_STYLES: Record<DataSourceStatus, StatusStyle> = {
  connected: { icon: CircleCheck, tone: 'success', iconClassName: 'text-success' },
  disconnected: { icon: Unplug, tone: 'warning', iconClassName: 'text-warning' },
  error: { icon: CircleAlert, tone: 'destructive', iconClassName: 'text-destructive' },
};

interface DataSourceStatusBadgeProps {
  status: DataSourceStatus;
  className?: string;
}

/** Tone is never the only signal: the localized label is always rendered. */
export function DataSourceStatusBadge({ status, className }: DataSourceStatusBadgeProps) {
  const { t } = useLanguage();
  const { icon: Icon, tone, iconClassName } = STATUS_STYLES[status];

  return (
    <Badge tone={tone} className={className}>
      <Icon aria-hidden className={cn('size-3', iconClassName)} />
      {t.dataSources.status[status]}
    </Badge>
  );
}
