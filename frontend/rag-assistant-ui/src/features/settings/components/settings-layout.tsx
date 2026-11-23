import type { ReactNode } from 'react';
import { NavLink } from 'react-router';

import { useLanguage } from '@/i18n/use-language';

import { SETTINGS_SECTIONS, type SettingsSection } from '../types';

const SECTION_PATHS: Record<SettingsSection, string> = {
  general: '/settings',
  appearance: '/settings/appearance',
  ai: '/settings/ai',
  embedding: '/settings/embedding',
  retrieval: '/settings/retrieval',
};

interface SettingsLayoutProps {
  children: ReactNode;
}

export function SettingsLayout({ children }: SettingsLayoutProps) {
  const { t } = useLanguage();

  return (
    <div className="grid gap-4 md:grid-cols-[12rem_minmax(0,1fr)] md:items-start">
      <nav
        aria-label={t.settings.sectionsLabel}
        className="min-w-0 md:sticky md:top-4"
      >
        <ul className="flex gap-1 overflow-x-auto rounded-lg border bg-card p-1 md:flex-col">
          {SETTINGS_SECTIONS.map((section) => (
            <li key={section} className="shrink-0">
              <NavLink
                to={SECTION_PATHS[section]}
                end
                className={({ isActive }) =>
                  [
                    'block whitespace-nowrap rounded-md px-3 py-2 text-sm transition-colors',
                    isActive
                      ? 'bg-secondary font-medium text-secondary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                  ].join(' ')
                }
              >
                {t.settings.sections[section]}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
