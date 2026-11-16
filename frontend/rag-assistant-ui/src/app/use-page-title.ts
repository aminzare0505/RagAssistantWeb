import { useEffect } from 'react';
import { useLocation } from 'react-router';

import type { Messages } from '@/i18n/messages';
import { useLanguage } from '@/i18n/use-language';

import { findNavigationItem } from './navigation';

function resolvePageTitle(pathname: string, t: Messages): string {
  const navigationItem = findNavigationItem(pathname);
  if (navigationItem) {
    return t.nav[navigationItem.labelKey];
  }
  if (pathname === '/') {
    return t.nav.home;
  }
  if (pathname.startsWith('/design-system')) {
    return t.designSystem.title;
  }
  return t.notFound.title;
}

export function usePageTitle(): string {
  const { pathname } = useLocation();
  const { t } = useLanguage();
  const title = resolvePageTitle(pathname, t);

  useEffect(() => {
    document.title = `${title} — ${t.appName}`;
  }, [title, t.appName]);

  return title;
}
