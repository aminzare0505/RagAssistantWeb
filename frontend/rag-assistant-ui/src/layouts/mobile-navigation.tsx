import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { useLanguage } from '@/i18n/use-language';
import { SidebarContent } from '@/layouts/sidebar';

interface MobileNavigationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileNavigation({ open, onOpenChange }: MobileNavigationProps) {
  const { t } = useLanguage();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent side="start" className="p-0">
        <DialogTitle className="sr-only">{t.primaryNavigation}</DialogTitle>
        <DialogDescription className="sr-only">{t.appTagline}</DialogDescription>
        <div className="h-full overflow-y-auto">
          <SidebarContent onNavigate={() => onOpenChange(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
