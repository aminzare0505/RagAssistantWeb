/**
 * Preview view models for the data-source UI.
 *
 * These are NOT wire DTOs. No data-source endpoint exists in the backend, so
 * this file (and the `mock/` directory beside it) must be deleted and replaced
 * with generated/verified API types the moment a real contract is available.
 *
 * The record deliberately has no credential field: only `hasCredential` may
 * ever leave the form, so a password cannot be stored, logged, or re-rendered.
 */
export type DataSourceStatus = 'connected' | 'disconnected' | 'error';

/** The backend exposes no source-type registry; SQL Server is the only preview type. */
export type DataSourceType = 'sql-server';

export interface DataSourceConnection {
  host: string;
  port: number;
  database: string;
  username: string;
}

export interface DataSourceRecord {
  id: string;
  name: string;
  type: DataSourceType;
  connection: DataSourceConnection;
  status: DataSourceStatus;
  lastSyncAt: string | null;
  hasCredential: boolean;
  createdAt: string;
}

export interface SchemaColumn {
  name: string;
  dataType: string;
  nullable: boolean;
}

export interface SchemaTable {
  name: string;
  columns: SchemaColumn[];
}

export interface SchemaDatabase {
  name: string;
  tables: SchemaTable[];
}
