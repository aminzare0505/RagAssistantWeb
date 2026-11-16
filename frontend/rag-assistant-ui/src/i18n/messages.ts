import { en } from './en';
import { fa, type Messages } from './fa';

export type { Messages };

export type Language = 'fa' | 'en';
export type Direction = 'rtl' | 'ltr';

export const messages: Record<Language, Messages> = { fa, en };

export function directionFor(language: Language): Direction {
  return language === 'fa' ? 'rtl' : 'ltr';
}

export function isLanguage(value: string): value is Language {
  return value === 'fa' || value === 'en';
}
