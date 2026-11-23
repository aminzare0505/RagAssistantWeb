import { ArrowLeft, RotateCcw, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/i18n/use-language';

import { formatBytes, formatDocumentDateTime, formatNumber } from '../lib/format';
import type { DocumentRecord, DocumentStatus } from '../types';
import { DocumentStatusBadge } from './document-status-badge';

const PROGRESS_RELEVANT_STATUSES: readonly DocumentStatus[] = [
  'processing',
  'chunking',
  'embedding',
];

interface DetailFieldProps {
  label: string;
  children: ReactNode;
}

function DetailField({ label, children }: DetailFieldProps) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm">{children}</dd>
    </div>
  );
}

interface DocumentDetailsProps {
  document: DocumentRecord;
  onRequestDelete: (document: DocumentRecord) => void;
}

export function DocumentDetails({ document, onRequestDelete }: DocumentDetailsProps) {
  const { t, language } = useLanguage();
  const retryHintId = 'document-detail-retry-hint';
  const showProgressUnavailable = PROGRESS_RELEVANT_STATUSES.includes(document.status);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ms-2">
          <Link to="/documents">
            <ArrowLeft aria-hidden className="rtl:rotate-180" />
            {t.documents.backToDocuments}
          </Link>
        </Button>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1
            dir="ltr"
            title={document.fileName}
            className="break-words text-start text-xl font-semibold tracking-tight"
          >
            {document.fileName}
          </h1>
          <p className="mt-1 text-xs leading-6 text-muted-foreground">
            {t.documents.detailsPreviewNote}
          </p>
        </div>
        <DocumentStatusBadge status={document.status} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t.documents.metadataTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2">
            <DetailField label={t.documents.fileNameLabel}>
              <span dir="ltr" className="block break-all text-start">
                {document.fileName}
              </span>
            </DetailField>
            <DetailField label={t.documents.fileTypeLabel}>
              {t.documents.typeFilterPdf}
            </DetailField>
            <DetailField label={t.documents.fileSizeLabel}>
              <span className="tabular-nums">
                {formatBytes(document.sizeBytes, language)}
              </span>
            </DetailField>
            <DetailField label={t.documents.uploadedAtLabel}>
              <time dateTime={document.uploadedAt} className="tabular-nums">
                {formatDocumentDateTime(document.uploadedAt, language)}
              </time>
            </DetailField>
            <DetailField label={t.documents.documentIdLabel}>
              <span dir="ltr" className="block font-mono text-xs">
                {document.id}
              </span>
            </DetailField>
            <DetailField label={t.documents.processingStatusLabel}>
              <DocumentStatusBadge status={document.status} />
            </DetailField>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t.documents.processingTitle}</CardTitle>
          <CardDescription>{t.documents.statusSourceNote}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {document.progress ? (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="text-muted-foreground">{t.documents.progressLabel}</span>
                <span className="tabular-nums">
                  {t.documents.progressValue(
                    formatNumber(document.progress.percent, language),
                  )}
                </span>
              </div>
              <Progress value={document.progress.percent} label={t.documents.progressLabel} />
            </div>
          ) : showProgressUnavailable ? (
            <p className="text-xs leading-6 text-muted-foreground">
              {t.documents.progressUnavailable}
            </p>
          ) : null}
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={() => onRequestDelete(document)}
        >
          <Trash2 aria-hidden />
          {t.documents.deleteDocument}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled
          aria-describedby={retryHintId}
          title={t.documents.retryUnavailable}
        >
          <RotateCcw aria-hidden />
          {t.documents.retryProcessing}
        </Button>
        <span id={retryHintId} className="sr-only">
          {t.documents.retryUnavailable}
        </span>
      </div>
    </div>
  );
}
