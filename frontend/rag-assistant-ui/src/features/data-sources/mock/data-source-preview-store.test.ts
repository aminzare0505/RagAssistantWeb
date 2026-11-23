import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  addDataSource,
  clearDataSourcePreviewStore,
  getDataSourceById,
  getDataSources,
  removeDataSource,
  resetDataSourcePreviewStore,
  subscribeToDataSources,
  updateDataSource,
  type NewDataSourceInput,
} from './data-source-preview-store';

const newSource: NewDataSourceInput = {
  name: 'Preview source',
  type: 'sql-server',
  connection: {
    host: 'preview.internal',
    port: 1433,
    database: 'PreviewDb',
    username: 'preview_reader',
  },
  hasCredential: true,
};

beforeEach(() => {
  resetDataSourcePreviewStore();
});

describe('data source preview store', () => {
  it('seeds five records with mixed statuses and one missing sync date', () => {
    const sources = getDataSources();

    expect(sources).toHaveLength(5);
    expect(sources.map((source) => source.status)).toEqual(
      expect.arrayContaining(['connected', 'disconnected', 'error']),
    );
    expect(sources.filter((source) => source.lastSyncAt === null)).toHaveLength(1);
  });

  it('exposes no credential field on any record', () => {
    for (const source of getDataSources()) {
      expect(Object.keys(source)).not.toContain('password');
      expect(JSON.stringify(source).toLowerCase()).not.toContain('password');
    }
  });

  it('adds a disconnected record at the top and notifies subscribers', () => {
    const listener = vi.fn();
    const unsubscribe = subscribeToDataSources(listener);

    const created = addDataSource(newSource);

    expect(created.id).toBe('src-preview-1');
    expect(created.status).toBe('disconnected');
    expect(created.lastSyncAt).toBeNull();
    expect(getDataSources()[0]).toEqual(created);
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
    removeDataSource(created.id);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('updates a record in place and returns it', () => {
    const updated = updateDataSource('src-03', {
      name: 'CRM mirror',
      connection: { ...newSource.connection, database: 'CrmMirror' },
      hasCredential: true,
    });

    expect(updated?.name).toBe('CRM mirror');
    expect(getDataSourceById('src-03')?.connection.database).toBe('CrmMirror');
    expect(updateDataSource('missing', { ...newSource, hasCredential: false })).toBeNull();
  });

  it('removes a record and ignores unknown ids', () => {
    removeDataSource('src-02');
    removeDataSource('missing');

    expect(getDataSourceById('src-02')).toBeNull();
    expect(getDataSources()).toHaveLength(4);
  });

  it('restores the seed and id sequence on reset, and empties on clear', () => {
    const created = addDataSource(newSource);
    expect(created.id).toBe('src-preview-1');

    resetDataSourcePreviewStore();
    expect(getDataSources()).toHaveLength(5);
    expect(addDataSource(newSource).id).toBe('src-preview-1');

    clearDataSourcePreviewStore();
    expect(getDataSources()).toHaveLength(0);
  });
});
