import { Link, Outlet } from 'react-router';

import { useLanguage } from '@/i18n/use-language';
import { Header } from '@/layouts/header';
import { Sidebar } from '@/layouts/sidebar';

export function AppShell() {
  const { t } = useLanguage();

  return (
    <div className="min-h-dvh bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-3 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:text-primary-foreground"
      >
        {t.skipToContent}
      </a>

      <Sidebar />

      <div className="flex min-h-dvh flex-col lg:ps-72">
        <Header />

        <main id="main-content" className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:py-8">
          <Outlet />
        </main>

        <footer className="border-t">
          <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-4 text-xs text-muted-foreground sm:px-6">
            <span>{t.footer.note}</span>
            <Link
              to="/design-system"
              className="underline-offset-4 hover:text-foreground hover:underline"
            >
              {t.footer.designSystem}
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
