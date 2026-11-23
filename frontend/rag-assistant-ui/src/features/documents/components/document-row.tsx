import { RotateCcw, Trash2 } from 'lucide-react';
import { Link } from 'react-router';

import { Button } from '@/components/ui/button';
import { useLanguage } from '@/i18n/use-language';

import { formatBytes, formatDocumentDate, truncateMiddle } from '../lib/format';
import type { DocumentRecord } from '../types';
import { DocumentStatusBadge } from './document-status-badge';

interface DocumentRowProps {
  document: DocumentRecord;
  onRequestDelete: (document: DocumentRecord) => void;
}

export function DocumentRow({ document, onRequestDelete }: DocumentRowProps) {
  const { t, language } = useLanguage();
  const retryHintId = `retry-hint-${document.id}`;

  return (
    <li className="border-t first:border-t-0">
      <div className="flex flex-col gap-2 px-4 py-3 md:grid md:grid-cols-[minmax(0,1fr)_6rem_9rem_9rem_auto] md:items-center md:gap-4">
        <Link
          to={`/documents/${document.id}`}
          title={document.fileName}
          aria-label={`${t.documents.viewDetails}: ${document.fileName}`}
          className="min-w-0 rounded-sm text-sm font-medium hover:underline focus-visible:underline"
        >
          <span dir="ltr" className="block truncate text-start">
            {truncateMiddle(document.fileName, 44)}
          </span>
        </Link>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground md:contents">
          <span className="tabular-nums">{formatBytes(document.sizeBytes, language)}</span>
          <time dateTime={document.uploadedAt} className="tabular-nums">
            {formatDocumentDate(document.uploadedAt, language)}
          </time>
        </div>

        <div>
          <DocumentStatusBadge status={document.status} />
        </div>

        <div className="flex items-center gap-1 md:justify-end">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled
            aria-label={`${t.documents.retryProcessing}: ${document.fileName}`}
            aria-describedby={retryHintId}
            title={t.documents.retryUnavailable}
            className="size-11 text-muted-foreground md:size-9"
          >
            <RotateCcw aria-hidden />
          </Button>
          <span id={retryHintId} className="sr-only">
            {t.documents.retryUnavailable}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`${t.documents.deleteDocument}: ${document.fileName}`}
            onClick={() => onRequestDelete(document)}
            className="size-11 text-muted-foreground hover:text-destructive md:size-9"
          >
            <Trash2 aria-hidden />
          </Button>
        </div>
      </div>
    </li>
  );
}
