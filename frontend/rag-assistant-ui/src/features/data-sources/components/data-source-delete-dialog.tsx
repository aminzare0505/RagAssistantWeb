import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useLanguage } from '@/i18n/use-language';

import type { DataSourceRecord } from '../types';

interface DataSourceDeleteDialogProps {
  dataSource: DataSourceRecord | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: (dataSource: DataSourceRecord) => void;
}

export function DataSourceDeleteDialog({
  dataSource,
  onOpenChange,
  onConfirm,
}: DataSourceDeleteDialogProps) {
  const { t } = useLanguage();

  return (
    <Dialog
      open={dataSource !== null}
      onOpenChange={(open) => {
        if (!open) {
          onOpenChange(false);
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.dataSources.deleteDialogTitle}</DialogTitle>
          <DialogDescription>{t.dataSources.deleteDialogDescription}</DialogDescription>
        </DialogHeader>
        {dataSource ? (
          <p className="mt-4 truncate rounded-md border bg-muted px-3 py-2 text-sm">
            {dataSource.name}
          </p>
        ) : null}
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              {t.dataSources.cancel}
            </Button>
          </DialogClose>
          <Button
            type="button"
            variant="destructive"
            onClick={() => {
              if (dataSource) {
                onConfirm(dataSource);
              }
            }}
          >
            {t.dataSources.deleteConfirm}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
