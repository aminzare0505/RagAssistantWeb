import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import { en } from '@/i18n/en';
import { fa } from '@/i18n/fa';
import { renderApp } from '@/test/render-app';

import {
  clearDataSourcePreviewStore,
  resetDataSourcePreviewStore,
} from '../mock/data-source-preview-store';

function sourceList(): HTMLElement {
  return screen.getByRole('list', { name: fa.dataSources.listTitle });
}

async function renderDataSources(initialPath = '/data-sources') {
  const view = renderApp({ initialPath });
  await screen.findByRole('heading', { level: 1, name: fa.nav.dataSources });
  return view;
}

beforeEach(() => {
  resetDataSourcePreviewStore();
});

describe('data sources page', () => {
  it('shows the preview banner and the seeded data sources', async () => {
    await renderDataSources();

    expect(screen.getByText(fa.dataSources.previewBadge)).toBeInTheDocument();
    expect(screen.getByText(fa.dataSources.previewNotice)).toBeInTheDocument();
    expect(screen.getByText(fa.dataSources.typePreviewNote)).toBeInTheDocument();
    expect(within(sourceList()).getAllByRole('listitem')).toHaveLength(5);
  });

  it('renders name, type, status, last sync, and an LTR host in each row', async () => {
    await renderDataSources();
    const [first, , third] = within(sourceList()).getAllByRole('listitem');

    expect(within(first!).getByText('پایگاه دادهٔ فروش')).toBeInTheDocument();
    expect(within(first!).getByText(fa.dataSources.fields.typeSqlServer)).toBeInTheDocument();
    expect(within(first!).getByText(fa.dataSources.status.connected)).toBeInTheDocument();
    expect(
      within(first!).getByText('sales-db.internal:1433/SalesDb'),
    ).toHaveAttribute('dir', 'ltr');
    expect(within(third!).getByText(fa.dataSources.neverSynced)).toBeInTheDocument();
  });

  it('shows an icon next to every status label', async () => {
    await renderDataSources();
    const [first] = within(sourceList()).getAllByRole('listitem');

    const badge = within(first!).getByText(fa.dataSources.status.connected);
    expect(badge.closest('span')?.querySelector('svg')).not.toBeNull();
  });

  it('opens the create form from the add button', async () => {
    const user = userEvent.setup();
    const { router } = await renderDataSources();

    await user.click(screen.getByRole('link', { name: fa.dataSources.addSource }));

    await screen.findByRole('heading', { level: 1, name: fa.dataSources.addTitle });
    expect(router.state.location.pathname).toBe('/data-sources/new');
  });

  it('asks for confirmation before deleting and removes the row on confirm', async () => {
    const user = userEvent.setup();
    await renderDataSources();
    const deleteButton = `${fa.dataSources.deleteSource} — CRM (preview)`;

    await user.click(screen.getByRole('button', { name: deleteButton }));
    const dialog = screen.getByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: fa.dataSources.cancel }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: deleteButton })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: deleteButton }));
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', {
        name: fa.dataSources.deleteConfirm,
      }),
    );

    expect(
      screen.queryByRole('link', {
        name: `${fa.dataSources.viewDetails} — CRM (preview)`,
      }),
    ).not.toBeInTheDocument();
    expect(within(sourceList()).getAllByRole('listitem')).toHaveLength(4);
  });

  it('shows the loading state from the dev preview control', async () => {
    const user = userEvent.setup();
    await renderDataSources();

    await user.click(screen.getByRole('button', { name: fa.dataSources.previewState.loading }));

    expect(screen.getByRole('status', { name: fa.dataSources.loadingLabel })).toBeInTheDocument();
    expect(screen.queryByRole('list', { name: fa.dataSources.listTitle })).not.toBeInTheDocument();
  });

  it('shows the error state and returns to the list', async () => {
    const user = userEvent.setup();
    await renderDataSources();

    await user.click(screen.getByRole('button', { name: fa.dataSources.previewState.error }));
    expect(screen.getByText(fa.dataSources.errorTitle)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: fa.dataSources.errorRetry }));
    expect(within(sourceList()).getAllByRole('listitem')).toHaveLength(5);
  });

  it('shows the empty state when the preview store has no sources', async () => {
    clearDataSourcePreviewStore();
    await renderDataSources();

    expect(screen.getByText(fa.dataSources.emptyTitle)).toBeInTheDocument();
    expect(screen.getByText(fa.dataSources.emptyDescription)).toBeInTheDocument();
  });

  it('renders English copy in English mode', async () => {
    localStorage.setItem('language', 'en');

    const view = renderApp({ initialPath: '/data-sources' });
    await screen.findByRole('heading', { level: 1, name: en.nav.dataSources });

    expect(screen.getByText(en.dataSources.previewNotice)).toBeInTheDocument();
    expect(screen.getByRole('list', { name: en.dataSources.listTitle })).toBeInTheDocument();
    expect(screen.queryByText(fa.dataSources.previewNotice)).not.toBeInTheDocument();

    view.unmount();
  });

  it('shows an in-shell not-found state for an unknown source id', async () => {
    renderApp({ initialPath: '/data-sources/nope' });

    expect(await screen.findByText(fa.dataSources.notFoundTitle)).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.getByRole('link', { name: fa.dataSources.backToSources }),
      ).toBeInTheDocument();
    });
  });
});
