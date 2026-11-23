import { X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/i18n/use-language';

import type { UploadRow } from '../hooks/use-document-upload';
import { formatBytes, truncateMiddle } from '../lib/format';
import type { FileValidationError } from '../lib/validation';

const ERROR_LABEL_KEYS: Record<
  FileValidationError,
  'unsupportedType' | 'emptyFile' | 'tooLarge' | 'duplicate'
> = {
  'unsupported-type': 'unsupportedType',
  'empty-file': 'emptyFile',
  'too-large': 'tooLarge',
  duplicate: 'duplicate',
};

interface UploadFileRowProps {
  row: UploadRow;
  onRemove: (id: string) => void;
  onAdd: (id: string) => void;
}

export function UploadFileRow({ row, onRemove, onAdd }: UploadFileRowProps) {
  const { t, language } = useLanguage();
  const phaseLabel =
    row.phase === 'uploading'
      ? t.documents.phaseUploading
      : row.phase === 'done'
        ? t.documents.phaseDone
        : t.documents.phaseError;

  return (
    <li className="rounded-lg border p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p
            dir="ltr"
            title={row.fileName}
            className="truncate text-start text-sm font-medium"
          >
            {truncateMiddle(row.fileName, 40)}
          </p>
          <p className="mt-0.5 text-xs tabular-nums text-muted-foreground">
            {formatBytes(row.sizeBytes, language)} · {phaseLabel}
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={`${t.documents.removeFile}: ${row.fileName}`}
          onClick={() => onRemove(row.id)}
          className="size-10 shrink-0 text-muted-foreground"
        >
          <X aria-hidden />
        </Button>
      </div>

      {row.phase === 'uploading' ? (
        <Progress value={null} label={t.documents.phaseUploading} className="mt-2" />
      ) : null}

      {row.error ? (
        <p role="alert" className="mt-2 text-xs leading-6 text-destructive">
          {t.documents.validation[ERROR_LABEL_KEYS[row.error]]}{' '}
          {t.documents.validation.fixHint}
        </p>
      ) : null}

      {row.phase === 'done' ? (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Button type="button" size="sm" variant="outline" onClick={() => onAdd(row.id)}>
            {t.documents.addToPreviewList}
          </Button>
          <span className="text-[11px] leading-5 text-muted-foreground">
            {t.documents.addToPreviewListHint}
          </span>
        </div>
      ) : null}
    </li>
  );
}
