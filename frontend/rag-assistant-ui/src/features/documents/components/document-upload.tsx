import { UploadCloud } from 'lucide-react';
import { useId, useRef, useState, type DragEvent } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/i18n/use-language';
import { cn } from '@/lib/utils';

import { formatBytes } from '../lib/format';
import { PREVIEW_MAX_FILE_BYTES } from '../lib/validation';

interface DocumentUploadProps {
  onUpload: (files: File[]) => void;
  isUploading: boolean;
}

export function DocumentUpload({ onUpload, isUploading }: DocumentUploadProps) {
  const { t, language } = useLanguage();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setDragging] = useState(false);
  const hintId = useId();

  const addFiles = (files: Iterable<File>) => {
    const incoming = Array.from(files);
    if (incoming.length === 0) {
      return;
    }
    onUpload(incoming);
  };

  const handleDrop = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setDragging(false);
    addFiles(event.dataTransfer.files);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.documents.uploadTitle}</CardTitle>
        <CardDescription>{t.documents.uploadDescription}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="rounded-md border border-warning/50 bg-warning/10 px-3 py-2 text-xs leading-6">
          {t.documents.uploadPreviewNote}
        </p>

        <button
          type="button"
          aria-describedby={hintId}
          aria-busy={isUploading}
          disabled={isUploading}
          onClick={() => inputRef.current?.click()}
          onDragEnter={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={cn(
            'flex w-full flex-col items-center gap-1 rounded-xl border border-dashed px-4 py-8 text-center transition-colors',
            isDragging ? 'border-primary bg-primary/5' : 'hover:bg-accent/50',
            isUploading ? 'opacity-60 pointer-events-none' : '',
          )}
        >
          <UploadCloud aria-hidden className="size-6 text-muted-foreground" />
          <span className="text-sm font-medium">
            {isDragging ? t.documents.dropActive : t.documents.dropPrompt}
          </span>
          <span className="text-xs text-muted-foreground">{t.documents.chooseFiles}</span>
        </button>

        <input
          ref={inputRef}
          type="file"
          multiple
          accept="application/pdf,.pdf"
          aria-label={t.documents.chooseFiles}
          tabIndex={-1}
          className="sr-only"
          onChange={(event) => {
            const files = event.currentTarget.files;
            if (files) {
              addFiles(files);
            }
            event.currentTarget.value = '';
          }}
        />

        <div id={hintId} className="space-y-1 text-xs leading-6 text-muted-foreground">
          <p>
            {t.documents.uploadHintTypes}{' '}
            {t.documents.uploadHintSize(formatBytes(PREVIEW_MAX_FILE_BYTES, language))}
          </p>
          <p>{t.documents.serverValidatesNote}</p>
        </div>
      </CardContent>
    </Card>
  );
}
