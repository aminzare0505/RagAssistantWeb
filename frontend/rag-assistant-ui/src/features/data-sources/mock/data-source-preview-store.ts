import type { DataSourceConnection, DataSourceRecord, DataSourceType } from '../types';

import { createMockDataSources } from './mock-data-sources';

/**
 * Module-scoped preview store. The list, details, and form routes are separate
 * component trees, so a per-component hook would lose additions and deletions
 * on navigation. Lives entirely in memory; never persisted or sent anywhere.
 * Delete with the mock folder once the contract exists.
 */

let dataSources: DataSourceRecord[] = createMockDataSources();
let previewSequence = 0;
const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) {
    listener();
  }
}

export function subscribeToDataSources(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Stable reference between changes, as `useSyncExternalStore` requires. */
export function getDataSources(): DataSourceRecord[] {
  return dataSources;
}

export function getDataSourceById(id: string): DataSourceRecord | null {
  return dataSources.find((source) => source.id === id) ?? null;
}

export function nextPreviewDataSourceId(): string {
  previewSequence += 1;
  return `src-preview-${previewSequence}`;
}

export interface NewDataSourceInput {
  name: string;
  type: DataSourceType;
  connection: DataSourceConnection;
  hasCredential: boolean;
}

export function addDataSource(input: NewDataSourceInput): DataSourceRecord {
  const record: DataSourceRecord = {
    id: nextPreviewDataSourceId(),
    ...input,
    status: 'disconnected',
    lastSyncAt: null,
    createdAt: new Date().toISOString(),
  };
  dataSources = [record, ...dataSources];
  emit();
  return record;
}

export interface DataSourceUpdateInput {
  name: string;
  connection: DataSourceConnection;
  hasCredential: boolean;
}

export function updateDataSource(id: string, input: DataSourceUpdateInput): DataSourceRecord | null {
  const current = getDataSourceById(id);
  if (!current) {
    return null;
  }
  const updated: DataSourceRecord = { ...current, ...input };
  dataSources = dataSources.map((source) => (source.id === id ? updated : source));
  emit();
  return updated;
}

export function removeDataSource(id: string): void {
  const next = dataSources.filter((source) => source.id !== id);
  if (next.length === dataSources.length) {
    return;
  }
  dataSources = next;
  emit();
}

/** Restores the seeded mock list and resets id generation. */
export function resetDataSourcePreviewStore(): void {
  dataSources = createMockDataSources();
  previewSequence = 0;
  emit();
}

export function clearDataSourcePreviewStore(): void {
  if (dataSources.length === 0) {
    return;
  }
  dataSources = [];
  emit();
}
