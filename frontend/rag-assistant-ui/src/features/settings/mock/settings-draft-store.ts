import { DEFAULT_AI_DRAFT, DEFAULT_RETRIEVAL_DRAFT } from '../lib/settings-defaults';
import type { AiDraft, RetrievalDraft, SettingsDrafts } from '../types';

/**
 * Module-scoped settings draft store. Lives entirely in memory: reloading the
 * page restores the source-verified defaults and the server configuration is
 * never touched. Delete with the mock folder when a settings contract exists.
 */

function createInitialDrafts(): SettingsDrafts {
  return {
    ai: { ...DEFAULT_AI_DRAFT },
    retrieval: { ...DEFAULT_RETRIEVAL_DRAFT },
  };
}

let drafts: SettingsDrafts = createInitialDrafts();
const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) {
    listener();
  }
}

export function subscribeToSettingsDrafts(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Stable reference between changes, as `useSyncExternalStore` requires. */
export function getSettingsDrafts(): SettingsDrafts {
  return drafts;
}

export function saveAiDraft(draft: AiDraft): void {
  drafts = { ...drafts, ai: { ...draft } };
  emit();
}

export function saveRetrievalDraft(draft: RetrievalDraft): void {
  drafts = { ...drafts, retrieval: { ...draft } };
  emit();
}

export function resetSettingsSection(section: 'ai' | 'retrieval'): void {
  drafts =
    section === 'ai'
      ? { ...drafts, ai: { ...DEFAULT_AI_DRAFT } }
      : { ...drafts, retrieval: { ...DEFAULT_RETRIEVAL_DRAFT } };
  emit();
}

export function resetSettingsDraftStore(): void {
  drafts = createInitialDrafts();
  emit();
}
