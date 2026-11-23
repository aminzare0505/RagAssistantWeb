import { ArrowLeft, FileQuestion, Info } from 'lucide-react';
import { Link, useParams } from 'react-router';

import { EmptyState } from '@/components/shared/empty-state';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/i18n/use-language';

import { DataSourceForm } from '../components/data-source-form';
import { useDataSource } from '../hooks/use-data-sources';

export function DataSourceFormPage() {
  const { t } = useLanguage();
  const { sourceId } = useParams();
  const source = useDataSource(sourceId);
  const isEdit = sourceId !== undefined;
  const backTo = isEdit && source ? `/data-sources/${source.id}` : '/data-sources';

  if (isEdit && !source) {
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

  return (
    <div className="space-y-4">
      <div>
        <Link
          to={backTo}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft aria-hidden className="size-4 rtl:rotate-180" />
          {t.dataSources.backToSources}
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-semibold tracking-tight">
            {isEdit ? t.dataSources.editTitle : t.dataSources.addTitle}
          </h1>
          <Badge tone="warning">
            <Info aria-hidden className="size-3" />
            {t.dataSources.previewBadge}
          </Badge>
        </div>
        <p className="mt-1 max-w-3xl text-xs leading-6 text-muted-foreground">
          {t.dataSources.formDescription} {t.dataSources.formPreviewNote}
        </p>
      </div>

      <Card>
        <CardContent>
          <DataSourceForm mode={isEdit ? 'edit' : 'create'} source={source} />
        </CardContent>
      </Card>
    </div>
  );
}
