import { FileText } from 'lucide-react';
import { Link } from 'react-router';

import { useLanguage } from '@/i18n/use-language';
import { NavigationList } from '@/layouts/navigation-list';
import { env } from '@/lib/env';

interface SidebarContentProps {
  onNavigate?: (() => void) | undefined;
}

export function SidebarContent({ onNavigate }: SidebarContentProps) {
  const { t } = useLanguage();

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 shrink-0 items-center border-b border-sidebar-border px-5">
        <Link
          to="/"
          onClick={onNavigate}
          className="flex min-w-0 items-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <FileText aria-hidden className="size-4" />
          </span>
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-sm font-semibold">{t.appName}</span>
            <span className="truncate text-xs text-muted-foreground">{t.appTagline}</span>
          </span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <NavigationList onNavigate={onNavigate} />
      </div>

      <div className="shrink-0 border-t border-sidebar-border p-4 text-xs leading-6 text-muted-foreground">
        <p className="flex items-center gap-1.5">
          <span>{t.home.environmentLabel}:</span>
          <span dir="ltr" className="font-mono text-foreground">
            {env.appEnv}
          </span>
        </p>
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 start-0 z-40 hidden w-72 border-e border-sidebar-border bg-sidebar text-sidebar-foreground lg:block">
      <SidebarContent />
    </aside>
  );
}
