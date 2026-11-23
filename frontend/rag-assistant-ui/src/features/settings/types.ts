/**
 * Preview settings drafts. These are NOT wire DTOs: no settings endpoint
 * exists, and nothing here is read from or written to the server.
 */
export type SettingsSection = 'general' | 'appearance' | 'ai' | 'embedding' | 'retrieval';

export const SETTINGS_SECTIONS: readonly SettingsSection[] = [
  'general',
  'appearance',
  'ai',
  'embedding',
  'retrieval',
];

export interface AiDraft {
  model: string;
  timeoutSeconds: number;
}

export interface RetrievalDraft {
  chunkSize: number;
  overlapTokens: number;
  topK: number;
}

export interface SettingsDrafts {
  ai: AiDraft;
  retrieval: RetrievalDraft;
}

export function isSettingsSection(value: string): value is SettingsSection {
  return (SETTINGS_SECTIONS as readonly string[]).includes(value);
}
