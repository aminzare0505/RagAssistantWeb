import { useMemo, useState, useSyncExternalStore } from 'react';

import {
  getDataSourceById,
  getDataSources,
  subscribeToDataSources,
} from '../mock/data-source-preview-store';
import type { DataSourceRecord } from '../types';

/** Reachable only through the dev-only preview control; no request is made. */
export type DataSourcesPreviewState = 'ready' | 'loading' | 'error';

/**
 * Preview-only data-source state. Reads the in-memory mock store; nothing is
 * fetched. Replace with API-backed queries once a verified contract exists.
 */
export function useDataSources() {
  const dataSources = useSyncExternalStore(
    subscribeToDataSources,
    getDataSources,
    getDataSources,
  );
  const [previewState, setPreviewState] = useState<DataSourcesPreviewState>('ready');

  return { dataSources, previewState, setPreviewState };
}

export function useDataSource(id: string | undefined): DataSourceRecord | null {
  useSyncExternalStore(subscribeToDataSources, getDataSources, getDataSources);
  return useMemo(() => (id ? getDataSourceById(id) : null), [id]);
}
