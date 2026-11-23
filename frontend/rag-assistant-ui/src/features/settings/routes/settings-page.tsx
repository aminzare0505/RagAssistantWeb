import { FileQuestion } from 'lucide-react';
import { Link, useParams } from 'react-router';

import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/i18n/use-language';

import { AiSettings } from '../components/ai-settings';
import { AppearanceSettings } from '../components/appearance-settings';
import { EmbeddingSettings } from '../components/embedding-settings';
import { GeneralSettings } from '../components/general-settings';
import { RetrievalSettings } from '../components/retrieval-settings';
import { SettingsLayout } from '../components/settings-layout';
import { isSettingsSection } from '../types';

const SECTION_CONTENT = {
  general: GeneralSettings,
  appearance: AppearanceSettings,
  ai: AiSettings,
  embedding: EmbeddingSettings,
  retrieval: RetrievalSettings,
} as const;

export function SettingsPage() {
  const { t } = useLanguage();
  const { section } = useParams();
  const activeSection = section ?? 'general';

  if (!isSettingsSection(activeSection)) {
    return (
      <EmptyState
        icon={FileQuestion}
        title={t.settings.sectionNotFoundTitle}
        description={t.settings.sectionNotFoundDescription}
        action={
          <Button asChild variant="outline">
            <Link to="/settings">{t.settings.backToSettings}</Link>
          </Button>
        }
      />
    );
  }

  const SectionContent = SECTION_CONTENT[activeSection];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">{t.nav.settings}</h1>
        <p className="mt-1 max-w-3xl text-xs leading-6 text-muted-foreground">
          {t.settings.description}
        </p>
      </div>

      <SettingsLayout>
        <SectionContent />
      </SettingsLayout>
    </div>
  );
}
