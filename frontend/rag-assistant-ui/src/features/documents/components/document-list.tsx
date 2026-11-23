import { useLanguage } from '@/i18n/use-language';

import type { DocumentRecord } from '../types';
import { DocumentRow } from './document-row';

interface DocumentListProps {
  documents: DocumentRecord[];
  onRequestDelete: (document: DocumentRecord) => void;
}

export function DocumentList({ documents, onRequestDelete }: DocumentListProps) {
  const { t } = useLanguage();

  return (
    <div>
      <div className="hidden grid-cols-[minmax(0,1fr)_6rem_9rem_9rem_auto] gap-4 border-b px-4 py-2 text-xs font-medium text-muted-foreground md:grid">
        <span>{t.documents.fileNameLabel}</span>
        <span>{t.documents.fileSizeLabel}</span>
        <span>{t.documents.uploadedAtLabel}</span>
        <span>{t.documents.status.label}</span>
        <span className="text-end">{t.documents.actionsLabel}</span>
      </div>
      <ul aria-label={t.documents.listTitle}>
        {documents.map((document) => (
          <DocumentRow
            key={document.id}
            document={document}
            onRequestDelete={onRequestDelete}
          />
        ))}
      </ul>
    </div>
  );
}
