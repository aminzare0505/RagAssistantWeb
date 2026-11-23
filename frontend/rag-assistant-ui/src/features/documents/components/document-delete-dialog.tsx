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

import type { DocumentRecord } from '../types';

interface DocumentDeleteDialogProps {
  document: DocumentRecord | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: (document: DocumentRecord) => void;
}

export function DocumentDeleteDialog({
  document,
  onOpenChange,
  onConfirm,
}: DocumentDeleteDialogProps) {
  const { t } = useLanguage();

  return (
    <Dialog
      open={document !== null}
      onOpenChange={(open) => {
        if (!open) {
          onOpenChange(false);
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.documents.deleteDialogTitle}</DialogTitle>
          <DialogDescription>{t.documents.deleteDialogDescription}</DialogDescription>
        </DialogHeader>
        {document ? (
          <p
            dir="ltr"
            className="mt-4 truncate rounded-md border bg-muted px-3 py-2 text-start text-sm"
          >
            {document.fileName}
          </p>
        ) : null}
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              {t.documents.cancel}
            </Button>
          </DialogClose>
          <Button
            type="button"
            variant="destructive"
            onClick={() => {
              if (document) {
                onConfirm(document);
              }
            }}
          >
            {t.documents.deleteConfirm}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
