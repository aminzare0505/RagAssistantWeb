import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DEFAULT_AI_DRAFT, DEFAULT_RETRIEVAL_DRAFT } from '../lib/settings-defaults';
import {
  getSettingsDrafts,
  resetSettingsDraftStore,
  resetSettingsSection,
  saveAiDraft,
  saveRetrievalDraft,
  subscribeToSettingsDrafts,
} from './settings-draft-store';

beforeEach(() => {
  resetSettingsDraftStore();
});

describe('settings draft store', () => {
  it('starts from the source-verified defaults', () => {
    expect(getSettingsDrafts()).toEqual({
      ai: { ...DEFAULT_AI_DRAFT },
      retrieval: { ...DEFAULT_RETRIEVAL_DRAFT },
    });
  });

  it('saves an AI draft without touching retrieval', () => {
    const listener = vi.fn();
    const unsubscribe = subscribeToSettingsDrafts(listener);

    saveAiDraft({ model: 'llama3', timeoutSeconds: 30 });

    expect(getSettingsDrafts().ai).toEqual({ model: 'llama3', timeoutSeconds: 30 });
    expect(getSettingsDrafts().retrieval).toEqual(DEFAULT_RETRIEVAL_DRAFT);
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
    saveAiDraft({ model: 'mistral', timeoutSeconds: 15 });
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('saves a retrieval draft without touching AI', () => {
    saveRetrievalDraft({ chunkSize: 600, overlapTokens: 120, topK: 8 });

    expect(getSettingsDrafts().retrieval).toEqual({
      chunkSize: 600,
      overlapTokens: 120,
      topK: 8,
    });
    expect(getSettingsDrafts().ai).toEqual(DEFAULT_AI_DRAFT);
  });

  it('resets a single section back to its defaults', () => {
    saveAiDraft({ model: 'llama3', timeoutSeconds: 30 });
    saveRetrievalDraft({ chunkSize: 600, overlapTokens: 120, topK: 8 });

    resetSettingsSection('ai');

    expect(getSettingsDrafts().ai).toEqual(DEFAULT_AI_DRAFT);
    expect(getSettingsDrafts().retrieval).toEqual({
      chunkSize: 600,
      overlapTokens: 120,
      topK: 8,
    });
  });

  it('restores every default when the whole store resets', () => {
    saveAiDraft({ model: 'llama3', timeoutSeconds: 30 });
    saveRetrievalDraft({ chunkSize: 600, overlapTokens: 120, topK: 8 });

    resetSettingsDraftStore();

    expect(getSettingsDrafts()).toEqual({
      ai: { ...DEFAULT_AI_DRAFT },
      retrieval: { ...DEFAULT_RETRIEVAL_DRAFT },
    });
  });
});
