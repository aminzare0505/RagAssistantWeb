/**
 * Preview-only view models for the documents UI.
 *
 * These are NOT backend wire DTOs. No documents endpoint exists (the backend
 * has no upload, list, detail, delete, retry, or status route), so nothing here
 * maps to a contract. Replace this module with API-backed types when one is
 * verified.
 */

export type DocumentStatus =
  | 'uploaded'
  | 'processing'
  | 'chunking'
  | 'embedding'
  | 'indexed'
  | 'failed';

/** Backend ingestion supports PDF only; widen this only with a contract. */
export type DocumentFileType = 'pdf';

export interface DocumentProgress {
  phase: DocumentStatus;
  /** 0–100. Server-reported only; never synthesized in the preview. */
  percent: number;
}

export interface DocumentRecord {
  id: string;
  fileName: string;
  fileType: DocumentFileType;
  sizeBytes: number;
  /** ISO 8601 timestamp. */
  uploadedAt: string;
  status: DocumentStatus;
  /** Always `null` in preview data: no status endpoint exists. */
  progress: DocumentProgress | null;
}
