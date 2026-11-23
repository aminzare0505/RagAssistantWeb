import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/i18n/use-language';

import { SettingsSection } from './settings-section';

export function EmbeddingSettings() {
  const { t } = useLanguage();

  const rows = [
    { label: t.settings.embedding.modelLabel },
    { label: t.settings.embedding.tokenizerLabel },
  ];

  return (
    <SettingsSection
      title={t.settings.embedding.title}
      description={t.settings.embedding.description}
    >
      <dl className="text-sm">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex flex-wrap items-center justify-between gap-3 border-t py-2 first:border-t-0 first:pt-0"
          >
            <dt className="text-muted-foreground">{row.label}</dt>
            <dd>
              <Badge tone="neutral">{t.settings.embedding.serverManaged}</Badge>
            </dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 border-t pt-4 text-xs leading-6 text-muted-foreground">
        {t.settings.embedding.noEndpointNote}
      </p>
    </SettingsSection>
  );
}
