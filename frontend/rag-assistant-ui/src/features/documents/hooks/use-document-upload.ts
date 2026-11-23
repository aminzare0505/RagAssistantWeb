import { useCallback, useEffect, useRef, useState } from 'react';

import { validateDocumentFile, type FileValidationError } from '../lib/validation';
import { addDocument, getDocuments, nextPreviewDocumentId } from '../mock/document-preview-store';
import { schedulePreviewUpload } from '../mock/preview-upload';

/**
 * `uploading` is a simulated, clearly-labelled preview phase. It ends at
 * `done` and never advances into processing/indexing. There is no real
 * transport: nothing leaves the browser.
 */
export type UploadPhase = 'uploading' | 'done' | 'error';

export interface UploadRow {
  id: string;
  fileName: string;
  sizeBytes: number;
  phase: UploadPhase;
  error: FileValidationError | null;
}

export function useDocumentUpload() {
  const [rows, setRows] = useState<UploadRow[]>([]);
  const sequence = useRef(0);
  const timers = useRef(new Map<string, () => void>());

  const nextRowId = useCallback(() => {
    sequence.current += 1;
    return `upload-${sequence.current}`;
  }, []);

  useEffect(() => {
    const pending = timers.current;
    return () => {
      for (const cancel of pending.values()) {
        cancel();
      }
      pending.clear();
    };
  }, []);

  const addFiles = useCallback(
    (files: Iterable<File>) => {
      const incoming = Array.from(files);
      if (incoming.length === 0) {
        return;
      }

      const existing = [
        ...rows.map((row) => ({ name: row.fileName, size: row.sizeBytes })),
        ...getDocuments().map((document) => ({
          name: document.fileName,
          size: document.sizeBytes,
        })),
      ];

      const nextRows = [...rows];
      const accepted: UploadRow[] = [];

      for (const file of incoming) {
        const result = validateDocumentFile(file, [
          ...existing,
          ...accepted.map((row) => ({ name: row.fileName, size: row.sizeBytes })),
        ]);
        const id = nextRowId();
        const row: UploadRow = result.ok
          ? { id, fileName: file.name, sizeBytes: file.size, phase: 'uploading', error: null }
          : {
              id,
              fileName: file.name,
              sizeBytes: file.size,
              phase: 'error',
              error: result.error,
            };
        nextRows.push(row);
        if (result.ok) {
          accepted.push(row);
        }
      }

      setRows(nextRows);

      for (const row of accepted) {
        const cancel = schedulePreviewUpload(() => {
          timers.current.delete(row.id);
          setRows((current) =>
            current.map((item) =>
              item.id === row.id ? { ...item, phase: 'done' } : item,
            ),
          );
        });
        timers.current.set(row.id, cancel);
      }
    },
    [nextRowId, rows],
  );

  const removeRow = useCallback((id: string) => {
    const cancel = timers.current.get(id);
    if (cancel) {
      cancel();
      timers.current.delete(id);
    }
    setRows((current) => current.filter((row) => row.id !== id));
  }, []);

  const addToPreviewList = useCallback(
    (id: string): boolean => {
      const row = rows.find((item) => item.id === id);
      if (!row || row.phase !== 'done') {
        return false;
      }

      addDocument({
        id: nextPreviewDocumentId(),
        fileName: row.fileName,
        fileType: 'pdf',
        sizeBytes: row.sizeBytes,
        uploadedAt: new Date().toISOString(),
        status: 'uploaded',
        progress: null,
      });
      removeRow(id);
      return true;
    },
    [removeRow, rows],
  );

  const clearFinished = useCallback(() => {
    setRows((current) => current.filter((row) => row.phase !== 'done'));
  }, []);

  return {
    rows,
    addFiles,
    removeRow,
    addToPreviewList,
    clearFinished,
    isBusy: rows.some((row) => row.phase === 'uploading'),
  };
}
