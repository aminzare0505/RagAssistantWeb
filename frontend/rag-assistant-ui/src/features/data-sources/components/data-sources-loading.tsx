import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/i18n/use-language';

export function DataSourcesLoading() {
  const { t } = useLanguage();

  return (
    <div role="status" aria-label={t.dataSources.loadingLabel} className="space-y-3 p-4">
      {Array.from({ length: 4 }, (_, index) => (
        <Skeleton key={index} className="h-16 w-full" />
      ))}
      <span className="sr-only">{t.dataSources.loadingLabel}</span>
    </div>
  );
}
