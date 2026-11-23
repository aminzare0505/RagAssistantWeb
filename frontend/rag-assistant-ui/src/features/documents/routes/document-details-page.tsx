import { FileQuestion } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';

import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/i18n/use-language';

import { DocumentDeleteDialog } from '../components/document-delete-dialog';
import { DocumentDetails } from '../components/document-details';
import { useDocument, useDeleteDocument } from '../hooks/use-documents';

export function DocumentDetailsPage() {
  const { documentId } = useParams();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const documentQuery = useDocument(documentId ?? '');
  const deleteDocument = useDeleteDocument();

  const [pendingDelete, setPendingDelete] = useState(false);

  const document = documentQuery.data;
  const isLoading = documentQuery.isLoading;
  const error = documentQuery.error;

  if (error || (isLoading && !document)) {
    return (
      <div className="mx-auto w-full max-w-3xl">
        <h1 className="sr-only">{t.documents.notFoundTitle}</h1>
        <EmptyState
          icon={FileQuestion}
          title={t.documents.notFoundTitle}
          description={t.documents.notFoundDescription}
          action={
            <Button asChild variant="outline" size="sm">
              <Link to="/documents">{t.documents.backToDocuments}</Link>
            </Button>
          }
        />
      </div>
    );
  }

  if (!document) {
    return (
      <div className="mx-auto w-full max-w-3xl">
        <h1 className="sr-only">{t.documents.notFoundTitle}</h1>
        <EmptyState
          icon={FileQuestion}
          title={t.documents.notFoundTitle}
          description={t.documents.notFoundDescription}
          action={
            <Button asChild variant="outline" size="sm">
              <Link to="/documents">{t.documents.backToDocuments}</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const handleDelete = () => {
    if (!document) {
      return;
    }
    deleteDocument.mutate(document.id, {
      onSettled: () => {
        void navigate('/documents', { replace: true });
      },
    });
  };

  return (
    <>
      <DocumentDetails
        document={document}
        onRequestDelete={() => setPendingDelete(true)}
      />
      <DocumentDeleteDialog
        document={pendingDelete ? document : null}
        onOpenChange={setPendingDelete}
        onConfirm={() => {
          handleDelete();
          setPendingDelete(false);
        }}
      />
    </>
  );
}
