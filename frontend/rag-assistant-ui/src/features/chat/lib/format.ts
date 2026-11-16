import type { Language } from '@/i18n/messages';

const localeFor: Record<Language, string> = { fa: 'fa-IR', en: 'en-US' };

const timeFormatters = new Map<string, Intl.DateTimeFormat>();
const dateFormatters = new Map<string, Intl.DateTimeFormat>();
const scoreFormatters = new Map<string, Intl.NumberFormat>();
const numberFormatters = new Map<string, Intl.NumberFormat>();

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

function numberFormatterFor(
  cache: Map<string, Intl.NumberFormat>,
  locale: string,
  options: Intl.NumberFormatOptions,
): Intl.NumberFormat {
  const key = `${locale}:${JSON.stringify(options)}`;
  let formatter = cache.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, options);
    cache.set(key, formatter);
  }
  return formatter;
}

function parse(iso: string): Date | null {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Clock time for a message; empty string when the timestamp is unparseable. */
export function formatMessageTime(iso: string, language: Language): string {
  const date = parse(iso);
  if (!date) {
    return '';
  }
  return formatterFor(timeFormatters, localeFor[language], {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/** Short date for the history list. */
export function formatShortDate(iso: string, language: Language): string {
  const date = parse(iso);
  if (!date) {
    return '';
  }
  return formatterFor(dateFormatters, localeFor[language], {
    month: 'short',
    day: 'numeric',
  }).format(date);
}

/** Page numbers and source counts, localized with Persian digits in `fa`. */
export function formatNumber(value: number, language: Language): string {
  return numberFormatterFor(numberFormatters, localeFor[language], {}).format(value);
}

/**
 * A retrieval score is a 0–1 similarity. Anything outside that range is shown
 * as a plain number rather than a misleading percentage.
 */
export function formatScore(score: number, language: Language): string {
  if (score < 0 || score > 1) {
    return numberFormatterFor(numberFormatters, localeFor[language], {
      maximumFractionDigits: 2,
    }).format(score);
  }
  return numberFormatterFor(scoreFormatters, localeFor[language], {
    style: 'percent',
    maximumFractionDigits: 0,
  }).format(score);
}
