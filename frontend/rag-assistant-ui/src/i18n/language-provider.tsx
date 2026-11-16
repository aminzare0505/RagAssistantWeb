import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';

import { directionFor, messages, type Language } from './messages';
import { LanguageContext } from './use-language';

const LANGUAGE_STORAGE_KEY = 'language';

function readStoredLanguage(): Language {
  try {
    return localStorage.getItem(LANGUAGE_STORAGE_KEY) === 'en' ? 'en' : 'fa';
  } catch {
    return 'fa';
  }
}

function applyDocumentLanguage(language: Language): void {
  const root = document.documentElement;
  root.lang = language;
  root.dir = directionFor(language);
}

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>(readStoredLanguage);

  useEffect(() => {
    applyDocumentLanguage(language);
  }, [language]);

  const setLanguage = useCallback((nextLanguage: Language) => {
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
    } catch {
      // Storage can be blocked; the language still applies for this session.
    }
    applyDocumentLanguage(nextLanguage);
    setLanguageState(nextLanguage);
  }, []);

  const value = useMemo(
    () => ({
      language,
      dir: directionFor(language),
      t: messages[language],
      setLanguage,
    }),
    [language, setLanguage],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
