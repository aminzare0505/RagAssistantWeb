import { Link } from 'react-router';

import { ErrorState } from '@/components/shared/error-state';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/i18n/use-language';

export function RouteErrorPage() {
  const { t } = useLanguage();

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-4">
        <h1 className="text-lg font-semibold">{t.errors.routeTitle}</h1>
        <ErrorState
          title={t.errors.routeTitle}
          description={t.errors.routeDescription}
          action={
            <Button asChild>
              <Link to="/">{t.actions.goHome}</Link>
            </Button>
          }
        />
      </div>
    </div>
  );
}
