import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {
  createDocument,
  deleteDocument,
  getDocument,
  listDocuments,
  updateDocument,
} from '../api/documents-api';
import {
  filterDocuments,
  sortDocuments,
  type DocumentQuery,
} from '../lib/query';
import type { CreateDocumentRequest, UpdateDocumentRequest } from '@/api/types/documents';
import type { DocumentRecord } from '../types';
import { useLanguage } from '@/i18n/use-language';

function mapDocument(dto: {
  id: number;
  fileName: string;
  type: number;
  status: number;
  collectionName: string | null;
  sizeInBytes: number | null;
  creationDate: string | null;
}): DocumentRecord {
  return {
    id: String(dto.id),
    fileName: dto.fileName,
    fileType: 'pdf',
    sizeBytes: dto.sizeInBytes ?? 0,
    uploadedAt: dto.creationDate ?? new Date().toISOString(),
    status: mapFileStatus(dto.status),
    progress: null,
  };
}

function mapFileStatus(status: number): DocumentRecord['status'] {
  switch (status) {
    case 1:
      return 'uploaded';
    case 2:
      return 'indexed';
    case 3:
      return 'failed';
    case 4:
      return 'processing';
    case 5:
      return 'chunking';
    default:
      return 'uploaded';
  }
}

export type DocumentStatus = DocumentRecord['status'];

/**
 * Query hook: list documents with search, status/type filtering, sorting, and paging.
 * Calls GET /api/documents via the authenticated HTTP client, then applies
 * client-side filtering and sorting since the backend only supports search/page/pageSize.
 */
export function useDocuments(query: DocumentQuery) {
  const { language } = useLanguage();

  return useQuery({
    queryKey: ['documents', query],
    queryFn: () => listDocuments(query.q || null, query.page, query.size),
    select: (data) => {
      if (!data || !data.items) {
        return { items: [], page: query.page, pageSize: query.size, totalCount: 0, totalPages: 0 };
      }
      const mapped = data.items.map(mapDocument);
      const filtered = filterDocuments(mapped, query);
      const sorted = sortDocuments(filtered, query.sort, language);
      const totalCount = sorted.length;
      const totalPages = Math.ceil(totalCount / query.size) || 1;
      const start = (query.page - 1) * query.size;
      const pageItems = sorted.slice(start, start + query.size);

      return {
        items: pageItems,
        page: query.page,
        pageSize: query.size,
        totalCount,
        totalPages,
      };
    },
    staleTime: 30_000,
  });
}

/**
 * Query hook: get a single document by id.
 */
export function useDocument(id: string) {
  return useQuery({
    queryKey: ['document', id],
    queryFn: () => getDocument(Number(id)),
    enabled: id.length > 0,
    staleTime: 30_000,
    select: (data) => (data ? mapDocument(data) : null),
  });
}

/**
 * Mutation hook: upload a new document.
 */
export function useCreateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateDocumentRequest & { file: File }) =>
      createDocument(request),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
}

/**
 * Mutation hook: update a document's metadata.
 */
export function useUpdateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: UpdateDocumentRequest }) =>
      updateDocument(Number(id), request),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
}

/**
 * Mutation hook: delete a document by id.
 */
export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteDocument(Number(id)),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
}
