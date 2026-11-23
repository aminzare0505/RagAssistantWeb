import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/i18n/use-language';

export function DocumentsLoading() {
  const { t } = useLanguage();

  return (
    <div role="status" aria-label={t.documents.loadingLabel} className="space-y-3 p-4">
      {Array.from({ length: 5 }, (_, index) => (
        <div key={index} className="flex items-center gap-4">
          <Skeleton className="h-4 min-w-0 flex-1" />
          <Skeleton className="hidden h-4 w-16 sm:block" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="size-9 shrink-0 rounded-md" />
        </div>
      ))}
      <span className="sr-only">{t.documents.loadingLabel}</span>
    </div>
  );
}
