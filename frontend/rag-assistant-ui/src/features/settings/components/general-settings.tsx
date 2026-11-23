import { useAuth } from '@/features/auth';
import { useLanguage } from '@/i18n/use-language';
import { env } from '@/lib/env';

import { SettingsSection } from './settings-section';

export function GeneralSettings() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const apiBase = env.apiBaseUrl || t.settings.general.sameOrigin;

  const rows: Array<{ label: string; value: string; ltr?: boolean }> = [
    {
      label: t.settings.general.usernameLabel,
      value: user?.username ?? t.settings.general.notProvided,
    },
    {
      label: t.settings.general.emailLabel,
      value: user?.email ?? t.settings.general.notProvided,
      ltr: true,
    },
    { label: t.settings.general.appNameLabel, value: t.appName },
    { label: t.settings.general.apiBaseLabel, value: apiBase, ltr: true },
    { label: t.settings.general.environmentLabel, value: env.appEnv, ltr: true },
  ];

  return (
    <SettingsSection
      title={t.settings.general.title}
      description={t.settings.general.description}
    >
      <dl className="text-sm">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between gap-3 border-t py-2 first:border-t-0 first:pt-0"
          >
            <dt className="text-muted-foreground">{row.label}</dt>
            <dd
              dir={row.ltr ? 'ltr' : undefined}
              className="min-w-0 truncate font-medium"
            >
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 border-t pt-4 text-xs leading-6 text-muted-foreground">
        {t.settings.general.readOnlyNote}
      </p>
    </SettingsSection>
  );
}
