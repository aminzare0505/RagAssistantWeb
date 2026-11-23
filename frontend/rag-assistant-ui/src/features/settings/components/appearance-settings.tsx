import { useId } from 'react';

import { Select } from '@/components/ui/select';
import { isLanguage } from '@/i18n/messages';
import { useLanguage } from '@/i18n/use-language';
import { isTheme, useTheme } from '@/theme/use-theme';

import { SettingsSection } from './settings-section';

export function AppearanceSettings() {
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const themeId = useId();
  const languageId = useId();

  return (
    <SettingsSection
      title={t.settings.appearance.title}
      description={t.settings.appearance.description}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor={themeId} className="text-sm font-medium">
            {t.settings.appearance.themeLabel}
          </label>
          <Select
            id={themeId}
            value={theme}
            onChange={(event) => {
              if (isTheme(event.target.value)) {
                setTheme(event.target.value);
              }
            }}
          >
            <option value="light">{t.settings.appearance.themeLight}</option>
            <option value="dark">{t.settings.appearance.themeDark}</option>
            <option value="system">{t.settings.appearance.themeSystem}</option>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor={languageId} className="text-sm font-medium">
            {t.settings.appearance.languageLabel}
          </label>
          <Select
            id={languageId}
            value={language}
            onChange={(event) => {
              if (isLanguage(event.target.value)) {
                setLanguage(event.target.value);
              }
            }}
          >
            <option value="fa">{t.settings.appearance.languageFa}</option>
            <option value="en">{t.settings.appearance.languageEn}</option>
          </Select>
        </div>
      </div>
      <p className="mt-4 border-t pt-4 text-xs leading-6 text-muted-foreground">
        {t.settings.appearance.savedNote}
      </p>
    </SettingsSection>
  );
}
