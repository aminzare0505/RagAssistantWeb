import { useSyncExternalStore } from 'react';

import { getSettingsDrafts, subscribeToSettingsDrafts } from '../mock/settings-draft-store';
import type { SettingsDrafts } from '../types';

/** Reads the in-memory settings drafts; nothing is fetched. */
export function useSettingsDrafts(): SettingsDrafts {
  return useSyncExternalStore(subscribeToSettingsDrafts, getSettingsDrafts, getSettingsDrafts);
}
