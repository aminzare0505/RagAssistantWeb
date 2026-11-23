/**
 * Backend-verified wire DTOs for the documents feature.
 *
 * Source: RagAssistantApi controllers (DocumentsController.cs) and
 * RagAssistant.Application.Models.Documents. Shown as source-verified only;
 * the API cannot start (JWT secret < 32 chars), so these are not
 * runtime-verified.
 */

export type FileType = 0 | 1 | 2 | 3 | 4 | 5;

export const FILE_TYPE: Record<string, FileType> = {
  unknown: 0,
  pdf: 1,
  doc: 2,
  xls: 3,
  txt: 4,
  csv: 5,
} as const;

export type FileStatus = 0 | 1 | 2 | 3 | 4 | 5;

export const FILE_STATUS: Record<string, FileStatus> = {
  unknown: 0,
  uploaded: 1,
  indexed: 2,
  failed: 3,
  processing: 4,
  chunked: 5,
} as const;

export interface DocumentDto {
  id: number;
  type: FileType;
  status: FileStatus;
  fileName: string;
  collectionName: string | null;
  sizeInBytes: number | null;
  creationDate: string | null;
}

export interface CreateDocumentRequest {
  type: FileType;
  fileName: string | null;
  collectionName: string | null;
  sizeInBytes: number | null;
  file: File | null;
}

export interface UpdateDocumentRequest {
  type: FileType;
  fileName: string | null;
  collectionName: string | null;
  sizeInBytes: number | null;
}

export interface DocumentDtoApiResponse {
  isSuccess: boolean;
  value: DocumentDto | null;
  message: string | null;
  errors: readonly string[] | null;
  statusCode: number;
}

export interface DocumentDtoPagedResult {
  items: readonly DocumentDto[] | null;
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface DocumentDtoPagedResultApiResponse {
  isSuccess: boolean;
  value: DocumentDtoPagedResult | null;
  message: string | null;
  errors: readonly string[] | null;
  statusCode: number;
}

export interface BooleanApiResponse {
  isSuccess: boolean;
  value: boolean | null;
  message: string | null;
  errors: readonly string[] | null;
  statusCode: number;
}
