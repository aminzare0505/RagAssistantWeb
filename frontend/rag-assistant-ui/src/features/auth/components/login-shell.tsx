import { FileSearch } from 'lucide-react';
import type { ReactNode } from 'react';

import { LanguageMenu } from '@/components/shared/language-menu';
import { ThemeMenu } from '@/components/shared/theme-menu';
import { useLanguage } from '@/i18n/use-language';

import { SessionLoading } from './session-loading';
import { useAuth } from '../use-auth';

interface LoginShellProps {
  children: ReactNode;
}

export function LoginShell({ children }: LoginShellProps) {
  const { t } = useLanguage();
  const { status } = useAuth();

  if (status === 'restoring') {
    return <SessionLoading />;
  }

  return (
    <div className="flex min-h-dvh flex-col bg-muted/30">
      <header className="flex items-center justify-between gap-2 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <FileSearch aria-hidden className="size-5" />
          </span>
          <span className="text-sm font-semibold">{t.appName}</span>
        </div>
        <div className="flex items-center gap-1">
          <LanguageMenu />
          <ThemeMenu />
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 pb-12">
        <div className="w-full max-w-sm">{children}</div>
      </main>
    </div>
  );
}
