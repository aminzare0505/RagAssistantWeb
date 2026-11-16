import { Spinner } from '@/components/ui/spinner';
import { useLanguage } from '@/i18n/use-language';

export function SessionLoading() {
  const { t } = useLanguage();

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <Spinner size="lg" label={t.auth.restoringSession} />
    </div>
  );
}
