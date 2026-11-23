import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import { fa } from '@/i18n/fa';
import { formatDateTime } from '@/lib/format-date';
import { renderApp } from '@/test/render-app';

import { resetDataSourcePreviewStore } from '../mock/data-source-preview-store';

async function renderDetails(id = 'src-01') {
  const view = renderApp({ initialPath: `/data-sources/${id}` });
  await screen.findByRole('heading', { level: 1, name: 'پایگاه دادهٔ فروش' });
  return view;
}

beforeEach(() => {
  resetDataSourcePreviewStore();
});

describe('data source details', () => {
  it('shows the source metadata and formatted dates', async () => {
    await renderDetails();

    expect(screen.getByText(fa.dataSources.metadataTitle)).toBeInTheDocument();
    expect(screen.getByText(fa.dataSources.typeLabel)).toBeInTheDocument();
    expect(
      screen.getByText(formatDateTime('2026-11-16T07:40:00.000Z', 'fa')),
    ).toBeInTheDocument();
    expect(
      screen.getByText(formatDateTime('2026-10-02T09:15:00.000Z', 'fa')),
    ).toBeInTheDocument();
    expect(screen.getByText('src-01')).toHaveAttribute('dir', 'ltr');
  });

  it('shows the connection details with LTR identifiers', async () => {
    await renderDetails();

    expect(screen.getByText('sales-db.internal')).toHaveAttribute('dir', 'ltr');
    expect(screen.getByText('report_reader')).toHaveAttribute('dir', 'ltr');
    expect(screen.getByText('1433')).toBeInTheDocument();
    expect(
      screen.getAllByText('SalesDb').some((element) => element.getAttribute('dir') === 'ltr'),
    ).toBe(true);
  });

  it('shows that a credential is configured without displaying it', async () => {
    await renderDetails();

    expect(screen.getByText(fa.dataSources.credentialConfigured)).toBeInTheDocument();
    expect(screen.getByText(fa.dataSources.connectionNote)).toBeInTheDocument();
    expect(document.querySelector('input[type="password"]')).toBeNull();
    expect(document.body.innerHTML.toLowerCase()).not.toContain('password');
  });

  it('disables the connection test and explains why', async () => {
    await renderDetails();

    const testButton = screen.getByRole('button', { name: fa.dataSources.testConnection });
    expect(testButton).toBeDisabled();
    expect(testButton).toHaveAttribute('title', fa.dataSources.testUnavailable);
    expect(testButton).toHaveAttribute('aria-describedby', 'test-connection-note');
    expect(document.getElementById('test-connection-note')).toHaveTextContent(
      fa.dataSources.testUnavailable,
    );
  });

  it('renders the example schema tree', async () => {
    await renderDetails();

    const tree = screen.getByRole('tree', { name: fa.dataSources.schemaLabel });
    expect(tree).toBeInTheDocument();
    expect(within(tree).getByText('SalesDb')).toBeInTheDocument();
  });

  it('shows the schema empty state for a source without example schema', async () => {
    renderApp({ initialPath: '/data-sources/src-05' });
    await screen.findByRole('heading', { level: 1, name: 'Support mirror' });

    expect(screen.getByText(fa.dataSources.schemaEmpty)).toBeInTheDocument();
  });

  it('links to the edit form', async () => {
    const user = userEvent.setup();
    const { router } = await renderDetails();

    await user.click(screen.getByRole('link', { name: fa.dataSources.editSource }));

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/data-sources/src-01/edit');
    });
  });

  it('deletes the source after confirmation and returns to the list', async () => {
    const user = userEvent.setup();
    const { router } = await renderDetails();

    await user.click(screen.getByRole('button', { name: fa.dataSources.deleteSource }));
    await user.click(screen.getByRole('button', { name: fa.dataSources.deleteConfirm }));

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/data-sources');
    });
    expect(screen.queryByRole('heading', { level: 1, name: 'پایگاه دادهٔ فروش' })).toBeNull();
  });

  it('shows the in-shell not-found state for an unknown id', async () => {
    renderApp({ initialPath: '/data-sources/nope' });

    expect(await screen.findByText(fa.dataSources.notFoundTitle)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: fa.dataSources.backToSources })).toBeInTheDocument();
  });
});
