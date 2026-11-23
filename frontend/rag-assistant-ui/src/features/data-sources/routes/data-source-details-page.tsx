import { ArrowLeft, FileQuestion, Info, Pencil, PlugZap, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router';

import { EmptyState } from '@/components/shared/empty-state';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/i18n/use-language';
import { formatDateTime } from '@/lib/format-date';

import { DataSourceDeleteDialog } from '../components/data-source-delete-dialog';
import { DataSourceStatusBadge } from '../components/data-source-status-badge';
import { SchemaBrowser } from '../components/schema-browser';
import { useDataSource } from '../hooks/use-data-sources';
import { announcementFromLocationState } from '../lib/announcement';
import { removeDataSource } from '../mock/data-source-preview-store';
import { getMockSchema } from '../mock/mock-schema';
import type { DataSourceRecord } from '../types';

export function DataSourceDetailsPage() {
  const { t, language } = useLanguage();
  const { sourceId } = useParams();
  const source = useDataSource(sourceId);
  const navigate = useNavigate();
  const location = useLocation();
  const [pendingDelete, setPendingDelete] = useState<DataSourceRecord | null>(null);
  const announcement = announcementFromLocationState(location.state);

  if (!source) {
    return (
      <EmptyState
        icon={FileQuestion}
        title={t.dataSources.notFoundTitle}
        description={t.dataSources.notFoundDescription}
        action={
          <Button asChild variant="outline">
            <Link to="/data-sources">{t.dataSources.backToSources}</Link>
          </Button>
        }
      />
    );
  }

  const lastSync = source.lastSyncAt
    ? formatDateTime(source.lastSyncAt, language)
    : t.dataSources.neverSynced;
  const schema = getMockSchema(source.id);

  return (
    <div className="space-y-4">
      <div>
        <Link
          to="/data-sources"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft aria-hidden className="size-4 rtl:rotate-180" />
          {t.dataSources.backToSources}
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-semibold tracking-tight" dir="auto">
            {source.name}
          </h1>
          <DataSourceStatusBadge status={source.status} />
          <Badge tone="warning">
            <Info aria-hidden className="size-3" />
            {t.dataSources.previewBadge}
          </Badge>
        </div>
        <p className="mt-1 max-w-3xl text-xs leading-6 text-muted-foreground">
          {t.dataSources.detailsPreviewNote}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t.dataSources.metadataTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="text-sm">
              <div className="flex items-center justify-between gap-3 border-t py-2 first:border-t-0 first:pt-0">
                <dt className="text-muted-foreground">{t.dataSources.nameLabel}</dt>
                <dd className="min-w-0 truncate text-end" dir="auto">
                  {source.name}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3 border-t py-2">
                <dt className="text-muted-foreground">{t.dataSources.typeLabel}</dt>
                <dd>{t.dataSources.fields.typeSqlServer}</dd>
              </div>
              <div className="flex items-center justify-between gap-3 border-t py-2">
                <dt className="text-muted-foreground">{t.dataSources.statusLabel}</dt>
                <dd>
                  <DataSourceStatusBadge status={source.status} />
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3 border-t py-2">
                <dt className="text-muted-foreground">{t.dataSources.lastSyncLabel}</dt>
                <dd className="tabular-nums">{lastSync}</dd>
              </div>
              <div className="flex items-center justify-between gap-3 border-t py-2">
                <dt className="text-muted-foreground">{t.dataSources.createdLabel}</dt>
                <dd className="tabular-nums">
                  {formatDateTime(source.createdAt, language)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3 border-t py-2">
                <dt className="text-muted-foreground">{t.dataSources.sourceIdLabel}</dt>
                <dd dir="ltr" className="truncate font-mono text-xs">
                  {source.id}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t.dataSources.connectionTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="text-sm">
              <div className="flex items-center justify-between gap-3 border-t py-2 first:border-t-0 first:pt-0">
                <dt className="text-muted-foreground">{t.dataSources.hostLabel}</dt>
                <dd dir="ltr" className="min-w-0 truncate font-mono text-xs">
                  {source.connection.host}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3 border-t py-2">
                <dt className="text-muted-foreground">{t.dataSources.portLabel}</dt>
                <dd className="tabular-nums">{source.connection.port}</dd>
              </div>
              <div className="flex items-center justify-between gap-3 border-t py-2">
                <dt className="text-muted-foreground">{t.dataSources.databaseLabel}</dt>
                <dd dir="ltr" className="min-w-0 truncate font-mono text-xs">
                  {source.connection.database}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3 border-t py-2">
                <dt className="text-muted-foreground">{t.dataSources.usernameLabel}</dt>
                <dd dir="ltr" className="min-w-0 truncate font-mono text-xs">
                  {source.connection.username}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3 border-t py-2">
                <dt className="text-muted-foreground">{t.dataSources.credentialLabel}</dt>
                <dd>
                  <Badge tone={source.hasCredential ? 'success' : 'neutral'}>
                    {source.hasCredential
                      ? t.dataSources.credentialConfigured
                      : t.dataSources.credentialMissing}
                  </Badge>
                </dd>
              </div>
            </dl>
            <p className="mt-4 border-t pt-4 text-xs leading-6 text-muted-foreground">
              {t.dataSources.connectionNote}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t.dataSources.schemaTitle}</CardTitle>
          <p className="text-xs leading-6 text-muted-foreground">
            {t.dataSources.schemaPreviewNote}
          </p>
        </CardHeader>
        <CardContent>
          <SchemaBrowser schema={schema} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild>
              <Link to={`/data-sources/${source.id}/edit`}>
                <Pencil aria-hidden />
                {t.dataSources.editSource}
              </Link>
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled
              aria-describedby="test-connection-note"
              title={t.dataSources.testUnavailable}
            >
              <PlugZap aria-hidden />
              {t.dataSources.testConnection}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => setPendingDelete(source)}
            >
              <Trash2 aria-hidden />
              {t.dataSources.deleteSource}
            </Button>
          </div>
          <p id="test-connection-note" className="text-xs leading-6 text-muted-foreground">
            {t.dataSources.testUnavailable}
          </p>
        </CardContent>
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
        onConfirm={(deleted) => {
          removeDataSource(deleted.id);
          void navigate('/data-sources', {
            replace: true,
            state: { announcement: t.dataSources.deletedAnnouncement(deleted.name) },
          });
        }}
      />
    </div>
  );
}
