import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { UserEvent } from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import { fa } from '@/i18n/fa';
import { renderApp } from '@/test/render-app';

import {
  getDataSourceById,
  resetDataSourcePreviewStore,
} from '../mock/data-source-preview-store';

interface FillValues {
  name?: string;
  host?: string;
  database?: string;
  username?: string;
  password?: string;
}

async function fillCreateForm(user: UserEvent, values: FillValues = {}) {
  await user.type(
    screen.getByLabelText(fa.dataSources.fields.name),
    values.name ?? 'New sales source',
  );
  await user.type(
    screen.getByLabelText(fa.dataSources.fields.host),
    values.host ?? 'db.internal',
  );
  await user.type(
    screen.getByLabelText(fa.dataSources.fields.database),
    values.database ?? 'SalesDb',
  );
  await user.type(
    screen.getByLabelText(fa.dataSources.fields.username),
    values.username ?? 'report_reader',
  );
  await user.type(
    screen.getByLabelText(fa.dataSources.fields.password),
    values.password ?? 'preview-secret',
  );
}

async function renderCreateForm() {
  const view = renderApp({ initialPath: '/data-sources/new' });
  await screen.findByRole('heading', { level: 1, name: fa.dataSources.addTitle });
  return view;
}

beforeEach(() => {
  resetDataSourcePreviewStore();
});

describe('data source form', () => {
  it('reports every required field when the create form is submitted empty', async () => {
    const user = userEvent.setup();
    await renderCreateForm();

    await user.click(screen.getByRole('button', { name: fa.dataSources.save }));

    expect(screen.getByText(fa.dataSources.validation.nameRequired)).toBeInTheDocument();
    expect(screen.getByText(fa.dataSources.validation.hostRequired)).toBeInTheDocument();
    expect(screen.getByText(fa.dataSources.validation.databaseRequired)).toBeInTheDocument();
    expect(screen.getByText(fa.dataSources.validation.usernameRequired)).toBeInTheDocument();
    expect(screen.getByText(fa.dataSources.validation.passwordRequired)).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent(fa.dataSources.validation.fixHint);
  });

  it('rejects an out-of-range port', async () => {
    const user = userEvent.setup();
    await renderCreateForm();

    const port = screen.getByLabelText(fa.dataSources.fields.port);
    await user.clear(port);
    await user.type(port, '70000');
    await user.click(screen.getByRole('button', { name: fa.dataSources.save }));

    expect(screen.getByText(fa.dataSources.validation.portInvalid)).toBeInTheDocument();
  });

  it('rejects a duplicate display name', async () => {
    const user = userEvent.setup();
    await renderCreateForm();

    await fillCreateForm(user, { name: 'Analytics warehouse' });
    await user.click(screen.getByRole('button', { name: fa.dataSources.save }));

    expect(screen.getByText(fa.dataSources.validation.nameDuplicate)).toBeInTheDocument();
    expect(getDataSourceById('src-preview-1')).toBeNull();
  });

  it('creates a source, navigates to its details page, and announces it', async () => {
    const user = userEvent.setup();
    const { router } = await renderCreateForm();

    await fillCreateForm(user, { name: 'New sales source' });
    await user.click(screen.getByRole('button', { name: fa.dataSources.save }));

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/data-sources/src-preview-1');
    });
    expect(
      await screen.findByRole('heading', { level: 1, name: 'New sales source' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(fa.dataSources.addedAnnouncement('New sales source')),
    ).toBeInTheDocument();
  });

  it('prefills the edit form and offers only SQL Server', async () => {
    renderApp({ initialPath: '/data-sources/src-01/edit' });
    await screen.findByRole('heading', { level: 1, name: fa.dataSources.editTitle });

    expect(screen.getByLabelText(fa.dataSources.fields.name)).toHaveValue(
      'پایگاه دادهٔ فروش',
    );
    expect(screen.getByLabelText(fa.dataSources.fields.host)).toHaveValue('sales-db.internal');
    expect(screen.getByLabelText(fa.dataSources.fields.password)).toHaveValue('');

    const type = screen.getByLabelText<HTMLSelectElement>(fa.dataSources.fields.type);
    expect(type).toBeDisabled();
    expect(type).toHaveValue('sql-server');
    expect(type.querySelectorAll('option')).toHaveLength(1);
    expect(screen.getByText(fa.dataSources.fields.typeOnlyOptionNote)).toBeInTheDocument();
  });

  it('keeps the existing credential when the password is left blank', async () => {
    const user = userEvent.setup();
    const { router } = renderApp({ initialPath: '/data-sources/src-01/edit' });
    await screen.findByRole('heading', { level: 1, name: fa.dataSources.editTitle });

    const name = screen.getByLabelText(fa.dataSources.fields.name);
    await user.clear(name);
    await user.type(name, 'Renamed sales');
    await user.click(screen.getByRole('button', { name: fa.dataSources.save }));

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/data-sources/src-01');
    });
    expect(getDataSourceById('src-01')?.hasCredential).toBe(true);
    await screen.findByRole('heading', { level: 1, name: 'Renamed sales' });
    expect(screen.getByText(fa.dataSources.credentialConfigured)).toBeInTheDocument();
  });

  it('never keeps the typed password in the DOM, the store, or browser storage', async () => {
    const user = userEvent.setup();
    const password = 'TopSecret-123';
    await renderCreateForm();

    await fillCreateForm(user, { password });
    await user.click(screen.getByRole('button', { name: fa.dataSources.save }));

    await screen.findByRole('heading', { level: 1, name: 'New sales source' });

    expect(document.body.innerHTML).not.toContain(password);
    expect(JSON.stringify(getDataSourceById('src-preview-1'))).not.toContain(password);
    expect(JSON.stringify({ ...localStorage })).not.toContain(password);
    expect(JSON.stringify({ ...sessionStorage })).not.toContain(password);
    expect(document.querySelector('input[type="password"]')).toBeNull();
  });

  it('returns to the list without saving when cancelled', async () => {
    const user = userEvent.setup();
    const { router } = await renderCreateForm();

    await fillCreateForm(user, { name: 'Discarded source' });
    await user.click(screen.getByRole('link', { name: fa.dataSources.cancel }));

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/data-sources');
    });
    expect(getDataSourceById('src-preview-1')).toBeNull();
  });

  it('returns to the details page from the edit back link', async () => {
    const user = userEvent.setup();
    const { router } = renderApp({ initialPath: '/data-sources/src-01/edit' });
    await screen.findByRole('heading', { level: 1, name: fa.dataSources.editTitle });

    await user.click(screen.getByRole('link', { name: fa.dataSources.backToSources }));

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/data-sources/src-01');
    });
  });

  it('shows the in-shell not-found state for an unknown edit id', async () => {
    renderApp({ initialPath: '/data-sources/nope/edit' });

    expect(await screen.findByText(fa.dataSources.notFoundTitle)).toBeInTheDocument();
  });
});
