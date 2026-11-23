import type { DocumentRecord } from '../types';

import { createMockDocuments } from './mock-documents';

/**
 * Module-scoped preview store. The list and the details route are separate
 * component trees, so a per-component hook would lose additions and deletions
 * on navigation. Lives entirely in memory; never persisted or sent anywhere.
 * Delete with the mock folder once the contract exists.
 */

let documents: DocumentRecord[] = createMockDocuments();
let previewSequence = 0;
const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) {
    listener();
  }
}

export function subscribeToDocuments(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Stable reference between changes, as `useSyncExternalStore` requires. */
export function getDocuments(): DocumentRecord[] {
  return documents;
}

export function getDocumentById(id: string): DocumentRecord | null {
  return documents.find((document) => document.id === id) ?? null;
}

export function nextPreviewDocumentId(): string {
  previewSequence += 1;
  return `preview-${previewSequence}`;
}

export function addDocument(document: DocumentRecord): void {
  documents = [document, ...documents];
  emit();
}

export function removeDocument(id: string): void {
  const next = documents.filter((document) => document.id !== id);
  if (next.length === documents.length) {
    return;
  }
  documents = next;
  emit();
}

/** Restores the seeded mock list and resets id generation. */
export function resetDocumentPreviewStore(): void {
  documents = createMockDocuments();
  previewSequence = 0;
  emit();
}

export function clearPreviewDocuments(): void {
  if (documents.length === 0) {
    return;
  }
  documents = [];
  emit();
}
