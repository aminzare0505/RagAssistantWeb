/**
 * Client-side upload checks are a UX convenience only. The server is
 * authoritative for type and size; no documented server limit exists yet, so
 * the size cap below is a preview-only limit.
 */

export const PREVIEW_MAX_FILE_BYTES = 10 * 1024 * 1024;

export const ACCEPTED_MIME_TYPE = 'application/pdf';
export const ACCEPTED_EXTENSION = '.pdf';

export type FileValidationError =
  | 'unsupported-type'
  | 'empty-file'
  | 'too-large'
  | 'duplicate';

export type FileValidationResult =
  | { ok: true }
  | { ok: false; error: FileValidationError };

export interface ExistingFile {
  name: string;
  size: number;
}

function fileKey(name: string, size: number): string {
  return `${name.trim().toLocaleLowerCase()}:${size}`;
}

/** First failing rule wins: empty → type → size → duplicate. */
export function validateDocumentFile(
  file: File,
  existing: readonly ExistingFile[],
): FileValidationResult {
  if (file.size === 0) {
    return { ok: false, error: 'empty-file' };
  }

  const hasPdfExtension = file.name.toLocaleLowerCase().endsWith(ACCEPTED_EXTENSION);
  const reportedType = file.type.toLocaleLowerCase();
  const hasForeignType = reportedType.length > 0 && reportedType !== ACCEPTED_MIME_TYPE;

  if (!hasPdfExtension || hasForeignType) {
    return { ok: false, error: 'unsupported-type' };
  }

  if (file.size > PREVIEW_MAX_FILE_BYTES) {
    return { ok: false, error: 'too-large' };
  }

  const key = fileKey(file.name, file.size);
  if (existing.some((item) => fileKey(item.name, item.size) === key)) {
    return { ok: false, error: 'duplicate' };
  }

  return { ok: true };
}
