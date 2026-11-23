import type { Language } from '@/i18n/messages';

const localeFor: Record<Language, string> = { fa: 'fa-IR', en: 'en-US' };

const dateFormatters = new Map<string, Intl.DateTimeFormat>();
const dateTimeFormatters = new Map<string, Intl.DateTimeFormat>();

function formatterFor(
  cache: Map<string, Intl.DateTimeFormat>,
  locale: string,
  options: Intl.DateTimeFormatOptions,
): Intl.DateTimeFormat {
  const key = `${locale}:${JSON.stringify(options)}`;
  let formatter = cache.get(key);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, options);
    cache.set(key, formatter);
  }
  return formatter;
}

function parseDate(iso: string): Date | null {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Date only; empty string when the timestamp is unparseable. */
export function formatDate(iso: string, language: Language): string {
  const date = parseDate(iso);
  if (!date) {
    return '';
  }
  return formatterFor(dateFormatters, localeFor[language], {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

/** Date and time; empty string when the timestamp is unparseable. */
export function formatDateTime(iso: string, language: Language): string {
  const date = parseDate(iso);
  if (!date) {
    return '';
  }
  return formatterFor(dateTimeFormatters, localeFor[language], {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}
