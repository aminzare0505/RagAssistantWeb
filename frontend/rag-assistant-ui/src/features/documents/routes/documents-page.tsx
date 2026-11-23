import { FileText, SearchX } from 'lucide-react';
import { useCallback, useState } from 'react';

import { EmptyState } from '@/components/shared/empty-state';
import { ErrorState } from '@/components/shared/error-state';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/i18n/use-language';

import { DocumentDeleteDialog } from '../components/document-delete-dialog';
import { DocumentList } from '../components/document-list';
import { DocumentPagination } from '../components/document-pagination';
import { DocumentToolbar } from '../components/document-toolbar';
import { DocumentUpload } from '../components/document-upload';
import { DocumentsLoading } from '../components/documents-loading';
import { useDocumentsQuery } from '../hooks/use-documents-query';
import { useDocuments, useCreateDocument, useDeleteDocument } from '../hooks/use-documents';
import type { DocumentRecord } from '../types';

export function DocumentsPage() {
  const { t } = useLanguage();
  const documentsQuery = useDocumentsQuery();
  const query = documentsQuery.query;

  const listQuery = useDocuments(query);
  const createDocument = useCreateDocument();
  const deleteDocument = useDeleteDocument();

  const [pendingDelete, setPendingDelete] = useState<DocumentRecord | null>(null);
  const [announcement, setAnnouncement] = useState('');

  const { data: pagedResult, isLoading, error, refetch } = listQuery;
  const items: DocumentRecord[] = [...(pagedResult?.items ?? [])];
  const total = pagedResult?.totalCount ?? 0;
  const totalPages = pagedResult?.totalPages ?? 0;

  const handleUpload = useCallback(
    async (files: File[]) => {
      for (const file of files) {
        try {
          await createDocument.mutateAsync({
            type: 1,
            fileName: file.name,
            collectionName: null,
            sizeInBytes: file.size,
            file,
          });
        } catch {
          // Upload errors are surfaced by the error state and refetch.
        }
      }
      void refetch();
    },
    [createDocument, refetch],
  );

  const handleDelete = useCallback(
    (document: DocumentRecord) => {
      deleteDocument.mutate(document.id, {
        onSettled: () => {
          void refetch();
          setAnnouncement(t.documents.deletedFromPreviewList(document.fileName));
        },
      });
    },
    [deleteDocument, refetch, t],
  );

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-semibold tracking-tight">{t.nav.documents}</h1>
        <ErrorState
          title={t.documents.errorTitle}
          description={t.documents.errorDescription}
          action={
            <Button type="button" variant="outline" size="sm" onClick={() => void refetch()}>
              {t.documents.errorRetry}
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold tracking-tight">{t.nav.documents}</h1>

      <DocumentUpload
        onUpload={(files) => {
          void handleUpload(files);
        }}
        isUploading={createDocument.isPending}
      />

      <Card>
        <DocumentToolbar
          query={query}
          total={total}
          onSearchChange={documentsQuery.setSearch}
          onStatusChange={documentsQuery.setStatus}
          onTypeChange={documentsQuery.setType}
          onSortChange={documentsQuery.setSort}
          onPageSizeChange={documentsQuery.setPageSize}
        />

        <div className="border-t">
          {isLoading ? (
            <DocumentsLoading />
          ) : items.length === 0 ? (
            <div className="p-4">
              {query.q.trim() !== '' || query.status !== 'all' || query.type !== 'all' ? (
                <EmptyState
                  icon={SearchX}
                  title={t.documents.filteredEmptyTitle}
                  description={t.documents.filteredEmptyDescription}
                  action={
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={documentsQuery.clearFilters}
                    >
                      {t.documents.clearFilters}
                    </Button>
                  }
                />
              ) : (
                <EmptyState
                  icon={FileText}
                  title={t.documents.emptyTitle}
                  description={t.documents.emptyDescription}
                />
              )}
            </div>
          ) : (
            <DocumentList documents={items} onRequestDelete={setPendingDelete} />
          )}
        </div>

        {totalPages > 0 ? (
          <DocumentPagination
            page={query.page}
            totalPages={totalPages}
            onPageChange={documentsQuery.setPage}
          />
        ) : null}
      </Card>

      <p role="status" aria-live="polite" className="sr-only">
        {announcement}
      </p>

      <DocumentDeleteDialog
        document={pendingDelete}
        onOpenChange={(open) => {
          if (!open) {
            setPendingDelete(null);
          }
        }}
        onConfirm={(document) => {
          handleDelete(document);
          setPendingDelete(null);
        }}
      />
    </div>
  );
}
