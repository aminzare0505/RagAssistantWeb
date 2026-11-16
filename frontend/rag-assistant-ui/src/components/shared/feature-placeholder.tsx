import type { LucideIcon } from 'lucide-react';
import { Link } from 'react-router';

import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/i18n/use-language';

interface FeaturePlaceholderProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

export function FeaturePlaceholder({ title, description, icon }: FeaturePlaceholderProps) {
  const { t } = useLanguage();

  return (
    <section className="mx-auto max-w-2xl py-4 sm:py-8">
      <h1 className="text-xl font-bold sm:text-2xl">{title}</h1>
      <div className="mt-6">
        <EmptyState
          icon={icon}
          title={t.features.unavailableTitle}
          description={`${description} ${t.features.unavailableNote}`}
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
