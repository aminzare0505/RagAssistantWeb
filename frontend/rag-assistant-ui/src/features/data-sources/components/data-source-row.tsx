import { Eye, Pencil, Trash2 } from 'lucide-react';
import { Link } from 'react-router';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/i18n/use-language';
import { formatDateTime } from '@/lib/format-date';

import type { DataSourceRecord } from '../types';
import { DataSourceStatusBadge } from './data-source-status-badge';

interface DataSourceRowProps {
  source: DataSourceRecord;
  onRequestDelete: (source: DataSourceRecord) => void;
}

export function DataSourceRow({ source, onRequestDelete }: DataSourceRowProps) {
  const { t, language } = useLanguage();
  const lastSync = source.lastSyncAt ? formatDateTime(source.lastSyncAt, language) : '';

  return (
    <li className="grid gap-2 border-t p-4 md:grid-cols-[minmax(0,1.6fr)_minmax(0,0.7fr)_minmax(0,0.9fr)_minmax(0,1fr)_auto] md:items-center md:gap-4">
      <div className="min-w-0">
        <Link
          to={`/data-sources/${source.id}`}
          className="block truncate font-medium hover:underline"
          dir="auto"
        >
          {source.name}
        </Link>
        <p dir="ltr" className="mt-0.5 truncate text-start text-xs text-muted-foreground">
          {source.connection.host}:{source.connection.port}/{source.connection.database}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground md:sr-only">
          {t.dataSources.columns.type}:
        </span>
        <Badge tone="neutral" title={t.dataSources.typePreviewNote}>
          {t.dataSources.fields.typeSqlServer}
        </Badge>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground md:sr-only">
          {t.dataSources.columns.status}:
        </span>
        <DataSourceStatusBadge status={source.status} />
      </div>
      <div className="text-xs text-muted-foreground">
        <span className="md:sr-only">{t.dataSources.columns.lastSync}: </span>
        <span className={lastSync ? 'tabular-nums' : undefined}>
          {lastSync || t.dataSources.neverSynced}
        </span>
      </div>
      <div
        className="flex items-center gap-1 md:justify-end"
        role="group"
        aria-label={t.dataSources.actionsLabel}
      >
        <Button asChild variant="ghost" size="icon" className="size-11 md:size-9">
          <Link
            to={`/data-sources/${source.id}`}
            aria-label={`${t.dataSources.viewDetails} — ${source.name}`}
          >
            <Eye aria-hidden />
          </Link>
        </Button>
        <Button asChild variant="ghost" size="icon" className="size-11 md:size-9">
          <Link
            to={`/data-sources/${source.id}/edit`}
            aria-label={`${t.dataSources.editSource} — ${source.name}`}
          >
            <Pencil aria-hidden />
          </Link>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-11 text-destructive hover:text-destructive md:size-9"
          aria-label={`${t.dataSources.deleteSource} — ${source.name}`}
          onClick={() => onRequestDelete(source)}
        >
          <Trash2 aria-hidden />
        </Button>
      </div>
    </li>
  );
}
