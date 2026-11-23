import { Database, Info, Plus } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router';

import { EmptyState } from '@/components/shared/empty-state';
import { ErrorState } from '@/components/shared/error-state';
import { PreviewStateControl } from '@/components/shared/preview-state-control';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/i18n/use-language';

import { DataSourceDeleteDialog } from '../components/data-source-delete-dialog';
import { DataSourceList } from '../components/data-source-list';
import { DataSourcesLoading } from '../components/data-sources-loading';
import { useDataSources } from '../hooks/use-data-sources';
import { announcementFromLocationState } from '../lib/announcement';
import {
  removeDataSource,
  resetDataSourcePreviewStore,
} from '../mock/data-source-preview-store';
import type { DataSourceRecord } from '../types';

export function DataSourcesPage() {
  const { t } = useLanguage();
  const location = useLocation();
  const { dataSources, previewState, setPreviewState } = useDataSources();
  const [pendingDelete, setPendingDelete] = useState<DataSourceRecord | null>(null);
  const [announcement, setAnnouncement] = useState(() =>
    announcementFromLocationState(location.state),
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight">{t.nav.dataSources}</h1>
            <Badge tone="warning">
              <Info aria-hidden className="size-3" />
              {t.dataSources.previewBadge}
            </Badge>
          </div>
          <p className="mt-1 max-w-3xl text-xs leading-6 text-muted-foreground">
            {t.dataSources.previewNotice}
          </p>
        </div>
        <Button asChild>
          <Link to="/data-sources/new">
            <Plus aria-hidden />
            {t.dataSources.addSource}
          </Link>
        </Button>
      </div>

      <PreviewStateControl
        state={previewState}
        onChange={setPreviewState}
        labels={t.dataSources.previewState}
        onReset={() => {
          resetDataSourcePreviewStore();
          setPreviewState('ready');
        }}
      />

      <p className="text-xs leading-6 text-muted-foreground">{t.dataSources.typePreviewNote}</p>

      <Card>
        {previewState === 'loading' ? (
          <DataSourcesLoading />
        ) : previewState === 'error' ? (
          <div className="p-4">
            <ErrorState
              title={t.dataSources.errorTitle}
              description={t.dataSources.errorDescription}
              action={
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPreviewState('ready')}
                >
                  {t.dataSources.errorRetry}
                </Button>
              }
            />
          </div>
        ) : dataSources.length === 0 ? (
          <div className="p-4">
            <EmptyState
              icon={Database}
              title={t.dataSources.emptyTitle}
              description={t.dataSources.emptyDescription}
              action={
                <Button asChild variant="outline" size="sm">
                  <Link to="/data-sources/new">{t.dataSources.addSource}</Link>
                </Button>
              }
            />
          </div>
        ) : (
          <DataSourceList dataSources={dataSources} onRequestDelete={setPendingDelete} />
        )}
      </Card>

      <p role="status" aria-live="polite" className="sr-only">
        {announcement}
      </p>

      <DataSourceDeleteDialog
        dataSource={pendingDelete}
        onOpenChange={(open) => {
          if (!open) {
            setPendingDelete(null);
          }
        }}
        onConfirm={(source) => {
          removeDataSource(source.id);
          setAnnouncement(t.dataSources.deletedAnnouncement(source.name));
          setPendingDelete(null);
        }}
      />
    </div>
  );
}
