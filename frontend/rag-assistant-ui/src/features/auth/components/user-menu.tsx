import { CircleUser, LogOut } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/i18n/use-language';

import { useAuth } from '../use-auth';

export function UserMenu() {
  const { t } = useLanguage();
  const { user, logout } = useAuth();
  const displayName = user?.username ?? t.auth.accountFallback;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-11" aria-label={t.auth.accountMenu}>
          <CircleUser aria-hidden className="size-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <span className="block text-xs text-muted-foreground">{t.auth.signedInAs}</span>
          <span className="block truncate text-sm font-medium">{displayName}</span>
          {user?.email ? (
            <span dir="ltr" className="block truncate text-xs text-muted-foreground">
              {user.email}
            </span>
          ) : null}
          {user?.roles.length ? (
            <span className="block truncate text-xs text-muted-foreground">
              {t.auth.rolesLabel}: <span dir="ltr">{user.roles.join(', ')}</span>
            </span>
          ) : null}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={logout}>
          <LogOut aria-hidden className="size-4" />
          {t.auth.logout}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
