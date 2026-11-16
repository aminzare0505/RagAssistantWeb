import { Spinner } from '@/components/ui/spinner';
import { useLanguage } from '@/i18n/use-language';

export function RouteLoading() {
  const { t } = useLanguage();

  return (
    <div className="flex min-h-40 items-center justify-center py-16" aria-busy="true">
      <Spinner size="lg" label={t.loading.generic} />
    </div>
  );
}
