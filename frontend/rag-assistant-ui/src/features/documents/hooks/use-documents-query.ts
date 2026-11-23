import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router';

import {
  parseDocumentQuery,
  toDocumentSearchParams,
  type DocumentQuery,
} from '../lib/query';

interface UpdateOptions {
  /** Query changes reset pagination unless the caller is paging itself. */
  resetPage?: boolean;
}

/**
 * Filters, sorting, and pagination live in the URL (architecture rule), so a
 * list view is shareable and survives reload. Writes replace the current entry
 * to avoid filling history on every keystroke.
 */
export function useDocumentsQuery() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = useMemo(() => parseDocumentQuery(searchParams), [searchParams]);

  const update = useCallback(
    (patch: Partial<DocumentQuery>, { resetPage = true }: UpdateOptions = {}) => {
      setSearchParams(
        (current) => {
          const next: DocumentQuery = { ...parseDocumentQuery(current), ...patch };
          if (resetPage) {
            next.page = 1;
          }
          return toDocumentSearchParams(next);
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const setSearch = useCallback((q: string) => update({ q }), [update]);
  const setStatus = useCallback(
    (status: DocumentQuery['status']) => update({ status }),
    [update],
  );
  const setType = useCallback((type: DocumentQuery['type']) => update({ type }), [update]);
  const setSort = useCallback((sort: DocumentQuery['sort']) => update({ sort }), [update]);
  const setPage = useCallback(
    (page: number) => update({ page }, { resetPage: false }),
    [update],
  );
  const setPageSize = useCallback((size: number) => update({ size }), [update]);
  const clearFilters = useCallback(
    () => update({ q: '', status: 'all', type: 'all' }),
    [update],
  );

  return {
    query,
    setSearch,
    setStatus,
    setType,
    setSort,
    setPage,
    setPageSize,
    clearFilters,
  };
}
