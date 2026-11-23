import type { Language } from '@/i18n/messages';

import type { DocumentFileType, DocumentStatus } from '../types';

export type DocumentSort =
  | 'name-asc'
  | 'name-desc'
  | 'date-asc'
  | 'date-desc'
  | 'size-asc'
  | 'size-desc';

export const DOCUMENT_SORTS: readonly DocumentSort[] = [
  'date-desc',
  'date-asc',
  'name-asc',
  'name-desc',
  'size-desc',
  'size-asc',
];

export const DOCUMENT_STATUSES: readonly DocumentStatus[] = [
  'uploaded',
  'processing',
  'chunking',
  'embedding',
  'indexed',
  'failed',
];

export const DOCUMENT_FILE_TYPES: readonly DocumentFileType[] = ['pdf'];

export const DOCUMENT_PAGE_SIZES = [6, 12, 24] as const;

export const DEFAULT_PAGE_SIZE = 6;

export interface DocumentQuery {
  q: string;
  status: DocumentStatus | 'all';
  type: DocumentFileType | 'all';
  sort: DocumentSort;
  page: number;
  size: number;
}

export const DEFAULT_DOCUMENT_QUERY: DocumentQuery = {
  q: '',
  status: 'all',
  type: 'all',
  sort: 'date-desc',
  page: 1,
  size: DEFAULT_PAGE_SIZE,
};

const localeFor: Record<Language, string> = { fa: 'fa-IR', en: 'en-US' };
const collators = new Map<Language, Intl.Collator>();

function collatorFor(language: Language): Intl.Collator {
  let collator = collators.get(language);
  if (!collator) {
    collator = new Intl.Collator(localeFor[language], { numeric: true, sensitivity: 'base' });
    collators.set(language, collator);
  }
  return collator;
}

export function isDocumentStatus(value: string): value is DocumentStatus {
  return (DOCUMENT_STATUSES as readonly string[]).includes(value);
}

export function isDocumentFileType(value: string): value is DocumentFileType {
  return (DOCUMENT_FILE_TYPES as readonly string[]).includes(value);
}

export function isDocumentSort(value: string): value is DocumentSort {
  return (DOCUMENT_SORTS as readonly string[]).includes(value);
}

function isStatus(value: string | null): value is DocumentStatus {
  return value !== null && isDocumentStatus(value);
}

function isFileType(value: string | null): value is DocumentFileType {
  return value !== null && isDocumentFileType(value);
}

function isSort(value: string | null): value is DocumentSort {
  return value !== null && isDocumentSort(value);
}

function parsePositiveInt(value: string | null, fallback: number): number {
  if (value === null || !/^\d+$/.test(value)) {
    return fallback;
  }
  const parsed = Number.parseInt(value, 10);
  return parsed >= 1 ? parsed : fallback;
}

function parsePageSize(value: string | null): number {
  const parsed = parsePositiveInt(value, DEFAULT_PAGE_SIZE);
  return (DOCUMENT_PAGE_SIZES as readonly number[]).includes(parsed)
    ? parsed
    : DEFAULT_PAGE_SIZE;
}

export function parseDocumentQuery(params: URLSearchParams): DocumentQuery {
  const status = params.get('status');
  const type = params.get('type');
  const sort = params.get('sort');
  return {
    q: params.get('q') ?? '',
    status: isStatus(status) ? status : 'all',
    type: isFileType(type) ? type : 'all',
    sort: isSort(sort) ? sort : DEFAULT_DOCUMENT_QUERY.sort,
    page: parsePositiveInt(params.get('page'), 1),
    size: parsePageSize(params.get('size')),
  };
}

/** Defaults are omitted so a clean list lives at `/documents`. */
export function toDocumentSearchParams(query: DocumentQuery): URLSearchParams {
  const params = new URLSearchParams();
  const search = query.q.trim();
  if (search) {
    params.set('q', search);
  }
  if (query.status !== 'all') {
    params.set('status', query.status);
  }
  if (query.type !== 'all') {
    params.set('type', query.type);
  }
  if (query.sort !== DEFAULT_DOCUMENT_QUERY.sort) {
    params.set('sort', query.sort);
  }
  if (query.page > 1) {
    params.set('page', String(query.page));
  }
  if (query.size !== DEFAULT_PAGE_SIZE) {
    params.set('size', String(query.size));
  }
  return params;
}

export function hasActiveFilters(query: DocumentQuery): boolean {
  return query.q.trim() !== '' || query.status !== 'all' || query.type !== 'all';
}

export function filterDocuments<
  T extends { fileName: string; status: DocumentStatus; fileType: string },
>(documents: readonly T[], query: DocumentQuery): T[] {
  const search = query.q.trim().toLocaleLowerCase();
  return documents.filter((document) => {
    if (search && !document.fileName.toLocaleLowerCase().includes(search)) {
      return false;
    }
    if (query.status !== 'all' && document.status !== query.status) {
      return false;
    }
    if (query.type !== 'all' && document.fileType !== query.type) {
      return false;
    }
    return true;
  });
}

export function sortDocuments<
  T extends { id: string; fileName: string; uploadedAt: string; sizeBytes: number },
>(documents: readonly T[], sort: DocumentSort, language: Language): T[] {
  const collator = collatorFor(language);
  const direction = sort.endsWith('-desc') ? -1 : 1;

  const compare = (left: T, right: T): number => {
    if (sort.startsWith('name')) {
      const byName = collator.compare(left.fileName, right.fileName);
      return byName !== 0 ? byName * direction : collator.compare(left.id, right.id);
    }
    if (sort.startsWith('size')) {
      return left.sizeBytes !== right.sizeBytes
        ? (left.sizeBytes - right.sizeBytes) * direction
        : collator.compare(left.id, right.id);
    }
    const leftTime = Date.parse(left.uploadedAt);
    const rightTime = Date.parse(right.uploadedAt);
    const leftValue = Number.isNaN(leftTime) ? 0 : leftTime;
    const rightValue = Number.isNaN(rightTime) ? 0 : rightTime;
    return leftValue !== rightValue
      ? (leftValue - rightValue) * direction
      : collator.compare(left.id, right.id);
  };

  return [...documents].sort(compare);
}

export interface PaginatedDocuments<T> {
  items: T[];
  page: number;
  totalPages: number;
  total: number;
}

export function paginateDocuments<T>(
  documents: readonly T[],
  page: number,
  size: number,
): PaginatedDocuments<T> {
  const safeSize =
    (DOCUMENT_PAGE_SIZES as readonly number[]).includes(size) && size > 0
      ? size
      : DEFAULT_PAGE_SIZE;
  const total = documents.length;
  const totalPages = Math.max(1, Math.ceil(total / safeSize));
  const requested = Number.isFinite(page) ? Math.trunc(page) : 1;
  const safePage = Math.min(Math.max(1, requested), totalPages);
  const start = (safePage - 1) * safeSize;

  return {
    items: documents.slice(start, start + safeSize),
    page: safePage,
    totalPages,
    total,
  };
}
