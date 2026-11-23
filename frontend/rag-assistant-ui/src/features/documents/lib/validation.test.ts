import { describe, expect, it } from 'vitest';

import { PREVIEW_MAX_FILE_BYTES, validateDocumentFile } from './validation';

function pdfFile(name: string, size = 1024, type = 'application/pdf'): File {
  return new File([new Uint8Array(size)], name, { type });
}

function withSize(file: File, size: number): File {
  Object.defineProperty(file, 'size', { value: size });
  return file;
}

describe('validateDocumentFile', () => {
  it('accepts a PDF with the expected MIME type', () => {
    expect(validateDocumentFile(pdfFile('report.pdf'), [])).toEqual({ ok: true });
  });

  it('accepts an uppercase .PDF extension', () => {
    expect(validateDocumentFile(pdfFile('REPORT.PDF'), [])).toEqual({ ok: true });
  });

  it('rejects a non-PDF extension', () => {
    expect(validateDocumentFile(pdfFile('notes.txt', 1024, 'text/plain'), [])).toEqual({
      ok: false,
      error: 'unsupported-type',
    });
  });

  it('rejects a .pdf name reported with a foreign MIME type', () => {
    expect(validateDocumentFile(pdfFile('payload.pdf', 1024, 'text/html'), [])).toEqual({
      ok: false,
      error: 'unsupported-type',
    });
  });

  it('accepts an empty MIME type when the extension is .pdf', () => {
    expect(validateDocumentFile(pdfFile('scan.pdf', 1024, ''), [])).toEqual({ ok: true });
  });

  it('rejects an empty file before checking its type', () => {
    expect(validateDocumentFile(pdfFile('empty.pdf', 0), [])).toEqual({
      ok: false,
      error: 'empty-file',
    });
  });

  it('rejects a file above the preview limit', () => {
    const file = withSize(pdfFile('big.pdf'), PREVIEW_MAX_FILE_BYTES + 1);
    expect(validateDocumentFile(file, [])).toEqual({ ok: false, error: 'too-large' });
  });

  it('rejects a duplicate inside the current queue', () => {
    const file = pdfFile('manual.pdf', 4096);
    expect(validateDocumentFile(file, [{ name: 'manual.pdf', size: 4096 }])).toEqual({
      ok: false,
      error: 'duplicate',
    });
  });

  it('rejects a duplicate of an existing preview document case-insensitively', () => {
    const file = pdfFile('Security-Policy.PDF', 845_120);
    expect(
      validateDocumentFile(file, [{ name: 'security-policy.pdf', size: 845_120 }]),
    ).toEqual({ ok: false, error: 'duplicate' });
  });
});
