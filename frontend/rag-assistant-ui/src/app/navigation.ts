import { Database, FileText, MessageSquare, Settings, type LucideIcon } from 'lucide-react';

export type NavigationLabelKey = 'chat' | 'documents' | 'dataSources' | 'settings';

export interface NavigationItem {
  path: string;
  labelKey: NavigationLabelKey;
  icon: LucideIcon;
}

export const primaryNavigation: readonly NavigationItem[] = [
  { path: '/chat', labelKey: 'chat', icon: MessageSquare },
  { path: '/documents', labelKey: 'documents', icon: FileText },
  { path: '/data-sources', labelKey: 'dataSources', icon: Database },
  { path: '/settings', labelKey: 'settings', icon: Settings },
];

export function findNavigationItem(pathname: string): NavigationItem | undefined {
  return primaryNavigation.find(
    (item) => pathname === item.path || pathname.startsWith(`${item.path}/`),
  );
}
