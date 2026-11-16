import { NavLink } from 'react-router';

import { primaryNavigation } from '@/app/navigation';
import { useLanguage } from '@/i18n/use-language';
import { cn } from '@/lib/utils';

interface NavigationListProps {
  onNavigate?: (() => void) | undefined;
}

export function NavigationList({ onNavigate }: NavigationListProps) {
  const { t } = useLanguage();

  return (
    <nav aria-label={t.primaryNavigation}>
      <ul className="flex flex-col gap-1">
        {primaryNavigation.map(({ path, labelKey, icon: Icon }) => (
          <li key={path}>
            <NavLink
              to={path}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-colors',
                  isActive
                    ? 'bg-sidebar-accent font-medium text-sidebar-accent-foreground'
                    : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground',
                )
              }
            >
              <Icon aria-hidden className="size-5 shrink-0" />
              <span className="truncate">{t.nav[labelKey]}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
