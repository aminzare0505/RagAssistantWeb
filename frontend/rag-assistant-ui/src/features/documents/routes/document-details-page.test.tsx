import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fa } from '@/i18n/fa';
import { apiEnvelope, jsonResponse, type FetchMock } from '@/test/api';
import { renderApp } from '@/test/render-app';

const DOCUMENT_1 = {
  id: 1,
  type: 1,
  status: 2,
  fileName: 'راهنمای استقرار.pdf',
  collectionName: null,
  sizeInBytes: 2_412_345,
  creationDate: '2026-10-14T08:20:00.000Z',
};

const DOCUMENT_5 = {
  id: 5,
  type: 1,
  status: 4,
  fileName: 'گزارش عملکرد سه‌ماهه.pdf',
  collectionName: null,
  sizeInBytes: 1_204_224,
  creationDate: '2026-10-28T16:30:00.000Z',
};

async function renderDetails(id: string, fetchMock?: FetchMock) {
  if (fetchMock) {
    vi.stubGlobal('fetch', fetchMock);
  }
  const view = renderApp({ initialPath: `/documents/${id}` });
  return view;
}

beforeEach(() => {
  vi.unstubAllGlobals();
});

describe('document details page', () => {
  it('renders the file name and the available metadata', async () => {
    const fetchMock = vi.fn<FetchMock>();
    fetchMock.mockResolvedValue(jsonResponse(apiEnvelope(DOCUMENT_1)));
    await renderDetails('1', fetchMock);

    await screen.findByRole('heading', { level: 1, name: 'راهنمای استقرار.pdf' });

    expect(
      screen.getByRole('heading', { level: 1, name: 'راهنمای استقرار.pdf' }),
    ).toBeInTheDocument();
    expect(screen.getByText(fa.documents.metadataTitle)).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText(fa.documents.detailsPreviewNote)).toBeInTheDocument();
    expect(screen.getAllByText('PDF').length).toBeGreaterThan(0);
  });

  it('omits processing progress and explains why it is unavailable', async () => {
    const fetchMock = vi.fn<FetchMock>();
    fetchMock.mockResolvedValue(jsonResponse(apiEnvelope(DOCUMENT_5)));
    await renderDetails('5', fetchMock);

    await screen.findByRole('heading', { level: 1, name: DOCUMENT_5.fileName });

    expect(screen.getByText(fa.documents.progressUnavailable)).toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('deletes the document after confirmation and returns to the list', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn<FetchMock>((url: string) => {
      const urlObj = new URL(url, 'http://localhost');
      if (urlObj.pathname === '/api/documents/1') {
        return Promise.resolve(jsonResponse(apiEnvelope(DOCUMENT_1)));
      }
      return Promise.resolve(jsonResponse(apiEnvelope(true)));
    });
    vi.stubGlobal('fetch', fetchMock);
    const { router } = renderApp({ initialPath: '/documents/1' });

    await screen.findByRole('heading', { level: 1, name: DOCUMENT_1.fileName });

    await user.click(screen.getByRole('button', { name: fa.documents.deleteDocument }));
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', {
        name: fa.documents.deleteConfirm,
      }),
    );

    expect(router.state.location.pathname).toBe('/documents');
  });

  it('links back to the documents list', async () => {
    const fetchMock = vi.fn<FetchMock>();
    fetchMock.mockResolvedValue(jsonResponse(apiEnvelope(DOCUMENT_1)));
    await renderDetails('2', fetchMock);

    expect(
      screen.getByRole('link', { name: fa.documents.backToDocuments }),
    ).toHaveAttribute('href', '/documents');
  });

  it('shows a not-found state for an unknown document id inside the shell', async () => {
    const fetchMock = vi.fn<FetchMock>();
    fetchMock.mockResolvedValue(
      new Response(null, { status: 404 }),
    );
    await renderDetails('999', fetchMock);

    expect(
      screen.getByRole('heading', { level: 1, name: fa.documents.notFoundTitle }),
    ).toBeInTheDocument();
    expect(screen.getByText(fa.documents.notFoundDescription)).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: fa.primaryNavigation })).toBeInTheDocument();
  });

  it('disables retry processing and explains why', async () => {
    const fetchMock = vi.fn<FetchMock>();
    fetchMock.mockResolvedValue(jsonResponse(apiEnvelope(DOCUMENT_1)));
    await renderDetails('1', fetchMock);

    await screen.findByRole('heading', { level: 1, name: DOCUMENT_1.fileName });

    const retry = screen.getByRole('button', { name: fa.documents.retryProcessing });
    expect(retry).toBeDisabled();
    expect(retry).toHaveAttribute('title', fa.documents.retryUnavailable);
  });
});
