import { createContext, useContext } from 'react';

import type { Direction, Language, Messages } from './messages';

export interface LanguageContextValue {
  language: Language;
  dir: Direction;
  t: Messages;
  setLanguage: (language: Language) => void;
}

export const LanguageContext = createContext<LanguageContextValue | null>(null);

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
