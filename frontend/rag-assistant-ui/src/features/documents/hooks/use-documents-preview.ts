import { useMemo, useState, useSyncExternalStore } from 'react';

import { useLanguage } from '@/i18n/use-language';

import {
  filterDocuments,
  hasActiveFilters,
  paginateDocuments,
  sortDocuments,
  type DocumentQuery,
} from '../lib/query';
import { getDocuments, subscribeToDocuments } from '../mock/document-preview-store';
import type { DocumentRecord } from '../types';

/** Reachable only through the dev-only preview control; no request is made. */
export type DocumentsPreviewState = 'ready' | 'loading' | 'error';

/**
 * Preview-only documents state. Reads the in-memory mock store and derives the
 * visible page; nothing is fetched. Replace with API-backed queries once a
 * verified documents contract exists.
 */
export function useDocumentsPreview(query: DocumentQuery) {
  const { language } = useLanguage();
  const documents = useSyncExternalStore(subscribeToDocuments, getDocuments, getDocuments);
  const [previewState, setPreviewState] = useState<DocumentsPreviewState>('ready');

  const filtered = useMemo(() => filterDocuments(documents, query), [documents, query]);
  const sorted = useMemo(
    () => sortDocuments(filtered, query.sort, language),
    [filtered, query.sort, language],
  );
  const paginated = useMemo(
    () => paginateDocuments(sorted, query.page, query.size),
    [sorted, query.page, query.size],
  );

  return {
    items: paginated.items,
    page: paginated.page,
    totalPages: paginated.totalPages,
    total: paginated.total,
    hasFilters: hasActiveFilters(query),
    previewState,
    setPreviewState,
  };
}

export function usePreviewDocument(id: string | undefined): DocumentRecord | null {
  const documents = useSyncExternalStore(subscribeToDocuments, getDocuments, getDocuments);
  return useMemo(
    () => (id ? (documents.find((document) => document.id === id) ?? null) : null),
    [documents, id],
  );
}
