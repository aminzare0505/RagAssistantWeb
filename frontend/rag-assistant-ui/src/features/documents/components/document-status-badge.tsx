import {
  Blocks,
  CircleAlert,
  CircleCheck,
  Clock,
  Layers,
  Upload,
  type LucideIcon,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/i18n/use-language';
import { cn } from '@/lib/utils';

import type { DocumentStatus } from '../types';

interface StatusStyle {
  icon: LucideIcon;
  tone: 'neutral' | 'info' | 'success' | 'destructive';
  iconClassName: string;
}

const STATUS_STYLES: Record<DocumentStatus, StatusStyle> = {
  uploaded: { icon: Upload, tone: 'neutral', iconClassName: 'text-muted-foreground' },
  processing: { icon: Clock, tone: 'info', iconClassName: 'text-info' },
  chunking: { icon: Blocks, tone: 'info', iconClassName: 'text-info' },
  embedding: { icon: Layers, tone: 'info', iconClassName: 'text-info' },
  indexed: { icon: CircleCheck, tone: 'success', iconClassName: 'text-success' },
  failed: { icon: CircleAlert, tone: 'destructive', iconClassName: 'text-destructive' },
};

interface DocumentStatusBadgeProps {
  status: DocumentStatus;
  className?: string;
}

/** Tone is never the only signal: the localized label is always rendered. */
export function DocumentStatusBadge({ status, className }: DocumentStatusBadgeProps) {
  const { t } = useLanguage();
  const { icon: Icon, tone, iconClassName } = STATUS_STYLES[status];

  return (
    <Badge tone={tone} className={className}>
      <Icon aria-hidden className={cn('size-3', iconClassName)} />
      {t.documents.status[status]}
    </Badge>
  );
}
