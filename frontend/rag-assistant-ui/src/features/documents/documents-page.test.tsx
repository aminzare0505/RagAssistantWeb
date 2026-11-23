import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { en } from '@/i18n/en';
import { fa } from '@/i18n/fa';
import { renderApp } from '@/test/render-app';

const DOCUMENTS = [
  { id: 11, fileName: 'نصب و راه‌اندازی.pdf', status: 4, sizeInBytes: 6_291_456, creationDate: '2026-11-16T12:00:00.000Z', type: 1 },
  { id: 10, fileName: 'product-roadmap-q1.pdf', status: 1, sizeInBytes: 1_887_436, creationDate: '2026-11-14T08:05:00.000Z', type: 1 },
  { id: 9, fileName: 'incident-response-playbook.pdf', status: 1, sizeInBytes: 3_145_728, creationDate: '2026-11-12T15:25:00.000Z', type: 1 },
  { id: 8, fileName: 'صورت‌جلسه جلسه طراحی.pdf', status: 2, sizeInBytes: 184_320, creationDate: '2026-11-09T10:40:00.000Z', type: 1 },
  { id: 7, fileName: 'training-manual-v3.pdf', status: 5, sizeInBytes: 4_612_096, creationDate: '2026-11-06T13:10:00.000Z', type: 1 },
  { id: 6, fileName: 'data-retention-guidelines.pdf', status: 5, sizeInBytes: 2_973_696, creationDate: '2026-11-02T07:55:00.000Z', type: 1 },
  { id: 5, fileName: 'گزارش عملکرد سه‌ماهه.pdf', status: 4, sizeInBytes: 1_204_224, creationDate: '2026-10-28T16:30:00.000Z', type: 1 },
  { id: 4, fileName: 'rag-assistant-architecture-and-deployment-runbook-2026-final.pdf', status: 2, sizeInBytes: 9_331_456, creationDate: '2026-10-24T09:15:00.000Z', type: 1 },
  { id: 3, fileName: 'API integration notes.pdf', status: 3, sizeInBytes: 512_900, creationDate: '2026-10-21T14:42:00.000Z', type: 1 },
  { id: 2, fileName: 'security-policy.pdf', status: 2, sizeInBytes: 845_120, creationDate: '2026-10-18T11:05:00.000Z', type: 1 },
  { id: 1, fileName: 'راهنمای استقرار.pdf', status: 2, sizeInBytes: 2_412_345, creationDate: '2026-10-14T08:20:00.000Z', type: 1 },
];

function pagedResponse(
  items: typeof DOCUMENTS,
  page: number,
  pageSize: number,
  search: string | null,
) {
  let filtered = [...items];
  if (search) {
    const term = search.toLocaleLowerCase();
    filtered = filtered.filter((d) => d.fileName.toLocaleLowerCase().includes(term));
  }
  return {
    items: filtered,
    page,
    pageSize,
    totalCount: filtered.length,
    totalPages: Math.ceil(filtered.length / pageSize),
  };
}

function apiEnvelope(value: unknown) {
  return { isSuccess: true, value, message: '', errors: [], statusCode: 200 };
}

function apiFailure(options: { statusCode?: number; message?: string; errors?: string[] } = {}) {
  return {
    isSuccess: false,
    value: null,
    message: options.message ?? 'Request failed',
    errors: options.errors ?? [],
    statusCode: options.statusCode ?? 400,
  };
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function documentList(): HTMLElement {
  return screen.getByRole('list', { name: fa.documents.listTitle });
}

function makeFetchMock() {
  return vi.fn((url: string) => {
    const urlObj = new URL(url, 'http://localhost');
    const page = Number.parseInt(urlObj.searchParams.get('page') ?? '1', 10);
    const pageSize = Number.parseInt(urlObj.searchParams.get('pageSize') ?? '6', 10);
    const body = apiEnvelope(
      pagedResponse(DOCUMENTS, page, pageSize, urlObj.searchParams.get('search') || null),
    );
    return Promise.resolve(jsonResponse(body));
  }) as (url: string, init?: RequestInit) => Promise<Response>;
}

async function renderDocuments(
  initialPath = '/documents',
  fetchMock?: (url: string, init?: RequestInit) => Promise<Response>,
) {
  if (fetchMock) {
    vi.stubGlobal('fetch', fetchMock);
  }
  const view = renderApp({ initialPath });
  await screen.findByRole('heading', { level: 1, name: fa.nav.documents });
  await waitFor(() => {
    expect(
      screen.queryByRole('status', { name: fa.documents.loadingLabel }),
    ).not.toBeInTheDocument();
  });
  return view;
}

beforeEach(() => {
  vi.unstubAllGlobals();
});

describe('documents page', () => {
  it('shows the first page of documents from the API', async () => {
    const fetchMock = makeFetchMock();
    await renderDocuments('/documents', fetchMock);

    expect(within(documentList()).getAllByRole('listitem')).toHaveLength(6);
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/documents?search=&page=1&pageSize=6',
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('renders LTR file names and status text next to an icon', async () => {
    const fetchMock = makeFetchMock();
    await renderDocuments('/documents', fetchMock);

    const link = screen.getByRole('link', {
      name: `${fa.documents.viewDetails}: نصب و راه‌اندازی.pdf`,
    });
    expect(link.querySelector('span')).toHaveAttribute('dir', 'ltr');

    const statusBadge = screen.getAllByText(fa.documents.status.processing)[0]!;
    expect(statusBadge.closest('span')?.querySelector('svg')).not.toBeNull();
  });

  it('searches file names and records the term in the URL', async () => {
    const user = userEvent.setup();
    const fetchMock = makeFetchMock();
    const { router } = await renderDocuments('/documents', fetchMock);

    await user.type(screen.getByLabelText(fa.documents.searchLabel), 'security');

    await waitFor(() => {
      expect(within(documentList()).getAllByRole('listitem')).toHaveLength(1);
    });
    expect(router.state.location.search).toContain('q=security');
  });

  it('filters by status and keeps the filter in the URL', async () => {
    const user = userEvent.setup();
    const fetchMock = makeFetchMock();
    const { router } = await renderDocuments('/documents', fetchMock);

    await user.selectOptions(screen.getByLabelText(fa.documents.statusFilterLabel), 'indexed');

    await waitFor(() => {
      expect(within(documentList()).getAllByRole('listitem')).toHaveLength(4);
    });
    expect(router.state.location.search).toContain('status=indexed');
  });

  it('sorts by size and shows the matching first row', async () => {
    const user = userEvent.setup();
    const fetchMock = makeFetchMock();
    await renderDocuments('/documents', fetchMock);

    await user.selectOptions(screen.getByLabelText(fa.documents.sortLabel), 'size-desc');

    const [first] = within(documentList()).getAllByRole('listitem');
    expect(first).toHaveTextContent(/rag-assistant-arch/);
  });

  it('pages forward and back through the URL', async () => {
    const user = userEvent.setup();
    const fetchMock = makeFetchMock();
    const { router } = await renderDocuments('/documents', fetchMock);

    await user.click(screen.getByRole('button', { name: fa.documents.nextPage }));

    expect(router.state.location.search).toContain('page=2');
    expect(within(documentList()).getAllByRole('listitem')).toHaveLength(5);
    expect(
      screen.getByText(fa.documents.pageIndicator('۲', '۲')),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: fa.documents.previousPage }));
    expect(within(documentList()).getAllByRole('listitem')).toHaveLength(6);
  });

  it('restores filters from the initial URL', async () => {
    const fetchMock = makeFetchMock();
    await renderDocuments('/documents?status=indexed', fetchMock);

    expect(within(documentList()).getAllByRole('listitem')).toHaveLength(4);
    expect(screen.getByLabelText(fa.documents.statusFilterLabel)).toHaveValue('indexed');
  });

  it('shows a filtered-empty state and clears the filters', async () => {
    const user = userEvent.setup();
    const fetchMock = makeFetchMock();
    await renderDocuments('/documents', fetchMock);

    await user.type(screen.getByLabelText(fa.documents.searchLabel), 'zzzz');

    expect(screen.getByText(fa.documents.filteredEmptyTitle)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: fa.documents.clearFilters }));

    expect(within(documentList()).getAllByRole('listitem')).toHaveLength(6);
  });

  it('shows the empty state when the API returns no documents', async () => {
    const fetchMock = vi.fn((url: string) => {
      const urlObj = new URL(url, 'http://localhost');
      const page = Number.parseInt(urlObj.searchParams.get('page') ?? '1', 10);
      const pageSize = Number.parseInt(urlObj.searchParams.get('pageSize') ?? '6', 10);
      const body = apiEnvelope(pagedResponse([], page, pageSize, null));
      return Promise.resolve(jsonResponse(body));
    });
    await renderDocuments('/documents', fetchMock);

    expect(screen.getByText(fa.documents.emptyTitle)).toBeInTheDocument();
    expect(screen.getByText(fa.documents.emptyDescription)).toBeInTheDocument();
  });

  it('shows the error state and returns to the list', async () => {
    const user = userEvent.setup();
    let callCount = 0;
    const fetchMock = vi.fn((url: string) => {
      callCount++;
      if (callCount === 1) {
        return Promise.resolve(
          new Response(JSON.stringify(apiFailure({ statusCode: 500 })), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          }),
        );
      }
      const urlObj = new URL(url, 'http://localhost');
      const page = Number.parseInt(urlObj.searchParams.get('page') ?? '1', 10);
      const pageSize = Number.parseInt(urlObj.searchParams.get('pageSize') ?? '6', 10);
      const body = apiEnvelope(
        pagedResponse(DOCUMENTS, page, pageSize, urlObj.searchParams.get('search') || null),
      );
      return Promise.resolve(jsonResponse(body));
    });
    await renderDocuments('/documents', fetchMock);

    expect(screen.getByText(fa.documents.errorTitle)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: fa.documents.errorRetry }));
    expect(within(documentList()).getAllByRole('listitem')).toHaveLength(6);
  });

  it('asks for confirmation before deleting a document', async () => {
    const user = userEvent.setup();
    const deletedIds = new Set<number>();
    const fetchMock = vi.fn((url: string, init?: RequestInit) => {
      if (init?.method === 'DELETE') {
        const urlObj = new URL(url, 'http://localhost');
        const id = Number.parseInt(urlObj.pathname.split('/').pop() ?? '0', 10);
        deletedIds.add(id);
        return Promise.resolve(jsonResponse(apiEnvelope(true)));
      }
      const urlObj = new URL(url, 'http://localhost');
      const page = Number.parseInt(urlObj.searchParams.get('page') ?? '1', 10);
      const pageSize = Number.parseInt(urlObj.searchParams.get('pageSize') ?? '6', 10);
      const available = DOCUMENTS.filter((d) => !deletedIds.has(d.id));
      const body = apiEnvelope(
        pagedResponse(available, page, pageSize, urlObj.searchParams.get('search') || null),
      );
      return Promise.resolve(jsonResponse(body));
    });
    await renderDocuments('/documents', fetchMock);

    const deleteButton = `${fa.documents.deleteDocument}: نصب و راه‌اندازی.pdf`;

    await user.click(screen.getByRole('button', { name: deleteButton }));
    const dialog = screen.getByRole('dialog');
    await user.click(within(dialog).getByRole('button', {
      name: fa.documents.deleteConfirm,
    }));

    expect(
      screen.queryByRole('link', {
        name: `${fa.documents.viewDetails}: نصب و راه‌اندازی.pdf`,
      }),
    ).not.toBeInTheDocument();
  });

  it('disables retry processing and explains why', async () => {
    const fetchMock = makeFetchMock();
    await renderDocuments('/documents', fetchMock);

    const retry = screen.getByRole('button', {
      name: `${fa.documents.retryProcessing}: نصب و راه‌اندازی.pdf`,
    });

    expect(retry).toBeDisabled();
    expect(retry).toHaveAttribute('title', fa.documents.retryUnavailable);
    expect(retry).toHaveAttribute('aria-describedby');
  });

  it('shows the PDF-only type filter hint', async () => {
    const fetchMock = makeFetchMock();
    await renderDocuments('/documents', fetchMock);

    expect(screen.getByLabelText(fa.documents.typeFilterLabel)).toHaveValue('all');
    expect(screen.getByText(fa.documents.typeFilterHint)).toBeInTheDocument();
  });

  it('renders English copy in English mode', async () => {
    localStorage.setItem('language', 'en');
    const fetchMock = makeFetchMock();
    vi.stubGlobal('fetch', fetchMock);
    renderApp({ initialPath: '/documents' });
    await screen.findByRole('heading', { level: 1, name: en.nav.documents });
    expect(screen.getByLabelText(en.documents.searchLabel)).toBeInTheDocument();
  });
});
