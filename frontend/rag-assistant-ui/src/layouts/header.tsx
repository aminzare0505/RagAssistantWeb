import { Menu } from 'lucide-react';
import { useState } from 'react';

import { usePageTitle } from '@/app/use-page-title';
import { LanguageMenu } from '@/components/shared/language-menu';
import { ThemeMenu } from '@/components/shared/theme-menu';
import { Button } from '@/components/ui/button';
import { UserMenu } from '@/features/auth';
import { useLanguage } from '@/i18n/use-language';
import { MobileNavigation } from '@/layouts/mobile-navigation';

export function Header() {
  const { t } = useLanguage();
  const pageTitle = usePageTitle();
  const [isNavigationOpen, setNavigationOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur">
      <div className="flex h-16 items-center gap-2 px-4 sm:px-6">
        <Button
          variant="ghost"
          size="icon"
          className="size-11 lg:hidden"
          aria-label={t.header.openMenu}
          onClick={() => setNavigationOpen(true)}
        >
          <Menu aria-hidden className="size-5" />
        </Button>

        <p className="min-w-0 truncate text-sm font-semibold sm:text-base">{pageTitle}</p>

        <div className="ms-auto flex items-center gap-1">
          <LanguageMenu />
          <ThemeMenu />
          <UserMenu />
        </div>
      </div>

      <MobileNavigation open={isNavigationOpen} onOpenChange={setNavigationOpen} />
    </header>
  );
}
