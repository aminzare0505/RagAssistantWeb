import { describe, expect, it } from 'vitest';

import type { DocumentStatus } from '../types';
import {
  DEFAULT_DOCUMENT_QUERY,
  filterDocuments,
  hasActiveFilters,
  paginateDocuments,
  parseDocumentQuery,
  sortDocuments,
  toDocumentSearchParams,
  type DocumentQuery,
  type DocumentSort,
} from './query';

interface Fixture {
  id: string;
  fileName: string;
  status: DocumentStatus;
  fileType: string;
  uploadedAt: string;
  sizeBytes: number;
}

const FIXTURES: Fixture[] = [
  {
    id: 'a',
    fileName: 'Alpha.pdf',
    status: 'indexed',
    fileType: 'pdf',
    uploadedAt: '2026-11-01T10:00:00.000Z',
    sizeBytes: 300,
  },
  {
    id: 'b',
    fileName: 'beta notes.pdf',
    status: 'failed',
    fileType: 'pdf',
    uploadedAt: '2026-11-03T10:00:00.000Z',
    sizeBytes: 100,
  },
  {
    id: 'c',
    fileName: 'Gamma.pdf',
    status: 'indexed',
    fileType: 'pdf',
    uploadedAt: '2026-11-02T10:00:00.000Z',
    sizeBytes: 200,
  },
  {
    id: 'd',
    fileName: 'delta.docx',
    status: 'uploaded',
    fileType: 'docx',
    uploadedAt: '2026-11-04T10:00:00.000Z',
    sizeBytes: 400,
  },
];

function query(overrides: Partial<DocumentQuery> = {}): DocumentQuery {
  return { ...DEFAULT_DOCUMENT_QUERY, ...overrides };
}

function names(documents: Fixture[]): string[] {
  return documents.map((document) => document.fileName);
}

describe('parseDocumentQuery', () => {
  it('returns defaults for empty parameters', () => {
    expect(parseDocumentQuery(new URLSearchParams())).toEqual(DEFAULT_DOCUMENT_QUERY);
  });

  it('falls back on unknown or malformed values', () => {
    const parsed = parseDocumentQuery(
      new URLSearchParams({
        status: 'nope',
        type: 'docx',
        sort: 'random',
        page: '0',
        size: '7',
      }),
    );

    expect(parsed.status).toBe('all');
    expect(parsed.type).toBe('all');
    expect(parsed.sort).toBe('date-desc');
    expect(parsed.page).toBe(1);
    expect(parsed.size).toBe(6);
  });

  it('reads valid values', () => {
    const parsed = parseDocumentQuery(
      new URLSearchParams({
        q: ' report ',
        status: 'indexed',
        type: 'pdf',
        sort: 'name-asc',
        page: '3',
        size: '12',
      }),
    );

    expect(parsed).toEqual({
      q: ' report ',
      status: 'indexed',
      type: 'pdf',
      sort: 'name-asc',
      page: 3,
      size: 12,
    });
  });
});

describe('toDocumentSearchParams', () => {
  it('omits every default so the clean list lives at /documents', () => {
    expect(toDocumentSearchParams(DEFAULT_DOCUMENT_QUERY).toString()).toBe('');
  });

  it('serializes non-default filters and pagination', () => {
    const params = toDocumentSearchParams(
      query({ q: 'policy', status: 'failed', type: 'pdf', sort: 'size-asc', page: 2, size: 24 }),
    );

    expect(params.get('q')).toBe('policy');
    expect(params.get('status')).toBe('failed');
    expect(params.get('type')).toBe('pdf');
    expect(params.get('sort')).toBe('size-asc');
    expect(params.get('page')).toBe('2');
    expect(params.get('size')).toBe('24');
  });
});

describe('hasActiveFilters', () => {
  it('ignores whitespace-only search text', () => {
    expect(hasActiveFilters(query({ q: '   ' }))).toBe(false);
    expect(hasActiveFilters(query({ status: 'indexed' }))).toBe(true);
  });
});

describe('filterDocuments', () => {
  it('matches file names case-insensitively after trimming', () => {
    expect(names(filterDocuments(FIXTURES, query({ q: '  ALPHA ' })))).toEqual(['Alpha.pdf']);
  });

  it('filters by status', () => {
    expect(names(filterDocuments(FIXTURES, query({ status: 'indexed' })))).toEqual([
      'Alpha.pdf',
      'Gamma.pdf',
    ]);
  });

  it('filters by file type', () => {
    expect(names(filterDocuments(FIXTURES, query({ type: 'pdf' })))).toEqual([
      'Alpha.pdf',
      'beta notes.pdf',
      'Gamma.pdf',
    ]);
  });

  it('combines search, status, and type', () => {
    expect(
      names(filterDocuments(FIXTURES, query({ q: 'a', status: 'indexed', type: 'pdf' }))),
    ).toEqual(['Alpha.pdf', 'Gamma.pdf']);
  });
});

describe('sortDocuments', () => {
  const cases: Array<[DocumentSort, string[]]> = [
    ['name-asc', ['Alpha.pdf', 'beta notes.pdf', 'delta.docx', 'Gamma.pdf']],
    ['name-desc', ['Gamma.pdf', 'delta.docx', 'beta notes.pdf', 'Alpha.pdf']],
    ['date-asc', ['Alpha.pdf', 'Gamma.pdf', 'beta notes.pdf', 'delta.docx']],
    ['date-desc', ['delta.docx', 'beta notes.pdf', 'Gamma.pdf', 'Alpha.pdf']],
    ['size-asc', ['beta notes.pdf', 'Gamma.pdf', 'Alpha.pdf', 'delta.docx']],
    ['size-desc', ['delta.docx', 'Alpha.pdf', 'Gamma.pdf', 'beta notes.pdf']],
  ];

  it.each(cases)('sorts by %s', (sort, expected) => {
    expect(names(sortDocuments(FIXTURES, sort, 'en'))).toEqual(expected);
  });

  it('does not mutate the input array', () => {
    const input = [...FIXTURES];
    sortDocuments(input, 'name-desc', 'en');
    expect(input.map((document) => document.id)).toEqual(['a', 'b', 'c', 'd']);
  });

  it('breaks ties by id so the order is stable', () => {
    const tied: Fixture[] = [
      {
        id: 'z',
        fileName: 'same.pdf',
        status: 'indexed',
        fileType: 'pdf',
        uploadedAt: '2026-11-01T10:00:00.000Z',
        sizeBytes: 100,
      },
      {
        id: 'y',
        fileName: 'same.pdf',
        status: 'indexed',
        fileType: 'pdf',
        uploadedAt: '2026-11-01T10:00:00.000Z',
        sizeBytes: 100,
      },
    ];

    expect(sortDocuments(tied, 'name-asc', 'en').map((document) => document.id)).toEqual([
      'y',
      'z',
    ]);
  });
});

describe('paginateDocuments', () => {
  it('reports totals and slices the requested page', () => {
    const many: Fixture[] = Array.from({ length: 7 }, (_, index) => ({
      id: `p-${index}`,
      fileName: `page-${index}.pdf`,
      status: 'indexed' as const,
      fileType: 'pdf',
      uploadedAt: '2026-11-01T10:00:00.000Z',
      sizeBytes: 100,
    }));

    const result = paginateDocuments(many, 2, 6);

    expect(result.total).toBe(7);
    expect(result.totalPages).toBe(2);
    expect(result.page).toBe(2);
    expect(names(result.items)).toEqual(['page-6.pdf']);
  });

  it('falls back to the default page size for an unsupported size', () => {
    const result = paginateDocuments(FIXTURES, 1, 3);

    expect(result.items).toHaveLength(4);
    expect(result.totalPages).toBe(1);
  });

  it('clamps a page number past the end without rewriting it', () => {
    const result = paginateDocuments(FIXTURES, 9, 6);

    expect(result.page).toBe(1);
    expect(result.totalPages).toBe(1);
    expect(result.items).toHaveLength(4);
  });

  it('returns one empty page for an empty list', () => {
    expect(paginateDocuments([], 3, 6)).toEqual({
      items: [],
      page: 1,
      totalPages: 1,
      total: 0,
    });
  });
});
