import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { fa } from '@/i18n/fa';
import { renderApp } from '@/test/render-app';

describe('application shell', () => {
  it('renders the home page inside the primary navigation shell', () => {
    renderApp();

    expect(screen.getByRole('heading', { level: 1, name: fa.home.title })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: fa.primaryNavigation })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: fa.skipToContent })).toHaveAttribute(
      'href',
      '#main-content',
    );
    expect(screen.getByRole('main')).toHaveAttribute('id', 'main-content');
    expect(document.title).toBe(`${fa.nav.home} — ${fa.appName}`);
  });

  it('navigates to the documents module with search and upload controls', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole('link', { name: fa.nav.documents }));

    expect(
      await screen.findByRole('heading', { level: 1, name: fa.nav.documents }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(fa.documents.searchLabel)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: new RegExp(fa.documents.dropPrompt) }),
    ).toBeInTheDocument();
    expect(document.title).toBe(`${fa.nav.documents} — ${fa.appName}`);
  });

  it('navigates to the data sources preview', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole('link', { name: fa.nav.dataSources }));

    expect(
      await screen.findByRole('heading', { level: 1, name: fa.nav.dataSources }),
    ).toBeInTheDocument();
    expect(screen.getByText(fa.dataSources.previewNotice)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: fa.dataSources.addSource })).toBeInTheDocument();
  });

  it('renders the not-found page for an unknown route', () => {
    renderApp({ initialPath: '/unknown-route' });

    expect(screen.getByRole('heading', { level: 1, name: fa.notFound.title })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: fa.primaryNavigation })).toBeInTheDocument();
  });

  it('renders the design system reference page', async () => {
    renderApp({ initialPath: '/design-system' });

    expect(
      await screen.findByRole('heading', { level: 1, name: fa.designSystem.title }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: fa.designSystem.openDialog })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: fa.designSystem.buttonIcon })).toBeInTheDocument();
  });

  it('opens the navigation sheet and navigates from it', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole('button', { name: fa.header.openMenu }));

    const dialog = await screen.findByRole('dialog', { name: fa.primaryNavigation });
    await user.click(within(dialog).getByRole('link', { name: fa.nav.settings }));

    expect(
      await screen.findByRole('heading', { level: 1, name: fa.nav.settings }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes the navigation sheet with Escape', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole('button', { name: fa.header.openMenu }));
    expect(await screen.findByRole('dialog', { name: fa.primaryNavigation })).toBeInTheDocument();

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
