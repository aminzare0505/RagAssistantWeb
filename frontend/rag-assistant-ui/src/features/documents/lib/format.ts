import type { Language } from '@/i18n/messages';
import { formatDate, formatDateTime } from '@/lib/format-date';

const localeFor: Record<Language, string> = { fa: 'fa-IR', en: 'en-US' };

const BYTE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB'] as const;

const numberFormatters = new Map<string, Intl.NumberFormat>();

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

/** Binary-prefix size label with Persian digits in `fa`; empty for invalid input. */
export function formatBytes(bytes: number, language: Language): string {
  if (!Number.isFinite(bytes) || bytes < 0) {
    return '';
  }

  let value = bytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < BYTE_UNITS.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  const number = numberFormatterFor(numberFormatters, localeFor[language], {
    maximumFractionDigits: unitIndex === 0 ? 0 : 1,
  }).format(value);

  return `${number} ${BYTE_UNITS[unitIndex]}`;
}

/** Counts and page numbers, localized with Persian digits in `fa`. */
export function formatNumber(value: number, language: Language): string {
  return numberFormatterFor(numberFormatters, localeFor[language], {}).format(value);
}

/** Date only; empty string when the timestamp is unparseable. */
export function formatDocumentDate(iso: string, language: Language): string {
  return formatDate(iso, language);
}

/** Date and time; empty string when the timestamp is unparseable. */
export function formatDocumentDateTime(iso: string, language: Language): string {
  return formatDateTime(iso, language);
}

/**
 * Middle truncation that keeps the extension readable and the result within
 * `maxLength` characters.
 */
export function truncateMiddle(fileName: string, maxLength: number): string {
  if (!Number.isFinite(maxLength) || maxLength <= 0) {
    return '';
  }
  if (fileName.length <= maxLength) {
    return fileName;
  }
  if (maxLength <= 4) {
    return fileName.slice(0, maxLength);
  }

  const dotIndex = fileName.lastIndexOf('.');
  const extension =
    dotIndex > 0 && fileName.length - dotIndex <= 10 ? fileName.slice(dotIndex) : '';
  const base = extension ? fileName.slice(0, dotIndex) : fileName;
  const available = maxLength - extension.length - 1;

  if (available <= 2) {
    return `${fileName.slice(0, maxLength - 1)}…`;
  }

  const headLength = Math.ceil(available * 0.6);
  const tailLength = available - headLength;

  return `${base.slice(0, headLength)}…${base.slice(base.length - tailLength)}${extension}`;
}
