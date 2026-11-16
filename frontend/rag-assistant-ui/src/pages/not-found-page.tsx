import { FileQuestion } from 'lucide-react';
import { Link } from 'react-router';

import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/i18n/use-language';

export function NotFoundPage() {
  const { t } = useLanguage();

  return (
    <section className="mx-auto max-w-xl py-8">
      <p dir="ltr" className="text-center font-mono text-sm text-muted-foreground">
        404
      </p>
      <h1 className="mt-2 text-center text-xl font-bold sm:text-2xl">{t.notFound.title}</h1>
      <div className="mt-6">
        <EmptyState
          icon={FileQuestion}
          title={t.notFound.title}
          description={t.notFound.description}
          action={
            <Button asChild variant="outline">
              <Link to="/">{t.actions.goHome}</Link>
            </Button>
          }
        />
      </div>
    </section>
  );
}
