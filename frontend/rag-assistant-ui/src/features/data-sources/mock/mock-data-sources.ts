import type { DataSourceRecord } from '../types';

/**
 * Mock data sources for UI development only. Imported exclusively by the
 * data-source preview store and never sent to or received from the backend.
 * There are no credentials here: only `hasCredential` is modelled.
 * Delete this folder when a verified data-source contract exists.
 */
export function createMockDataSources(): DataSourceRecord[] {
  return [
    {
      id: 'src-01',
      name: 'پایگاه دادهٔ فروش',
      type: 'sql-server',
      connection: {
        host: 'sales-db.internal',
        port: 1433,
        database: 'SalesDb',
        username: 'report_reader',
      },
      status: 'connected',
      lastSyncAt: '2026-11-16T07:40:00.000Z',
      hasCredential: true,
      createdAt: '2026-10-02T09:15:00.000Z',
    },
    {
      id: 'src-02',
      name: 'Analytics warehouse',
      type: 'sql-server',
      connection: {
        host: 'warehouse.internal',
        port: 1433,
        database: 'Analytics',
        username: 'etl_service',
      },
      status: 'connected',
      lastSyncAt: '2026-11-17T05:10:00.000Z',
      hasCredential: true,
      createdAt: '2026-10-08T12:00:00.000Z',
    },
    {
      id: 'src-03',
      name: 'CRM (preview)',
      type: 'sql-server',
      connection: {
        host: 'crm-db.internal',
        port: 1433,
        database: 'Crm',
        username: 'crm_reader',
      },
      status: 'disconnected',
      lastSyncAt: null,
      hasCredential: true,
      createdAt: '2026-10-21T14:30:00.000Z',
    },
    {
      id: 'src-04',
      name: 'بایگانی قدیمی',
      type: 'sql-server',
      connection: {
        host: 'legacy-db.internal',
        port: 1433,
        database: 'LegacyArchive',
        username: 'archive_reader',
      },
      status: 'error',
      lastSyncAt: '2026-11-10T18:25:00.000Z',
      hasCredential: true,
      createdAt: '2026-10-29T10:05:00.000Z',
    },
    {
      id: 'src-05',
      name: 'Support mirror',
      type: 'sql-server',
      connection: {
        host: 'localhost',
        port: 1433,
        database: 'SupportMirror',
        username: 'support_app',
      },
      status: 'disconnected',
      lastSyncAt: '2026-11-02T08:00:00.000Z',
      hasCredential: true,
      createdAt: '2026-11-01T16:45:00.000Z',
    },
  ];
}
