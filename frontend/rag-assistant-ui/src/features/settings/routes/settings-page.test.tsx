import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import { en } from '@/i18n/en';
import { fa } from '@/i18n/fa';
import { env } from '@/lib/env';
import { renderApp } from '@/test/render-app';
import { TEST_USER } from '@/test/auth';

import { getSettingsDrafts, resetSettingsDraftStore } from '../mock/settings-draft-store';

async function renderSettings(initialPath = '/settings', heading = fa.nav.settings) {
  const view = renderApp({ initialPath });
  await screen.findByRole('heading', { level: 1, name: heading });
  return view;
}

beforeEach(() => {
  resetSettingsDraftStore();
});

describe('settings page', () => {
  it('shows the read-only general values from the session and build', async () => {
    await renderSettings();

    expect(screen.getByText(fa.settings.general.title)).toBeInTheDocument();
    expect(screen.getAllByText(TEST_USER.username).length).toBeGreaterThan(0);
    expect(screen.getAllByText(TEST_USER.email).length).toBeGreaterThan(0);
    expect(screen.getAllByText(fa.appName).length).toBeGreaterThan(0);
    expect(screen.getAllByText(env.appEnv).length).toBeGreaterThan(0);
    expect(screen.getByText(fa.settings.general.readOnlyNote)).toBeInTheDocument();
  });

  it('marks the active section and navigates between sections', async () => {
    const user = userEvent.setup();
    const { router } = await renderSettings();
    const nav = screen.getByRole('navigation', { name: fa.settings.sectionsLabel });

    expect(screen.getByRole('link', { name: fa.settings.sections.general })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(
      screen.getByRole('link', { name: fa.settings.sections.appearance }),
    ).not.toHaveAttribute('aria-current');

    await user.click(
      within(nav).getByRole('link', { name: fa.settings.sections.retrieval }),
    );

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/settings/retrieval');
    });
    expect(
      await screen.findByLabelText(fa.settings.retrieval.chunkSizeLabel),
    ).toBeInTheDocument();
  });

  it('applies and persists the dark theme from the appearance section', async () => {
    const user = userEvent.setup();
    await renderSettings('/settings/appearance');

    await user.selectOptions(screen.getByLabelText(fa.settings.appearance.themeLabel), 'dark');

    expect(document.documentElement).toHaveClass('dark');
    expect(localStorage.getItem('theme')).toBe('dark');
  });

  it('switches to English and LTR from the appearance section', async () => {
    const user = userEvent.setup();
    await renderSettings('/settings/appearance');

    await user.selectOptions(
      screen.getByLabelText(fa.settings.appearance.languageLabel),
      'en',
    );

    expect(document.documentElement).toHaveAttribute('lang', 'en');
    expect(document.documentElement).toHaveAttribute('dir', 'ltr');
    expect(
      screen.getByRole('heading', { level: 1, name: en.nav.settings }),
    ).toBeInTheDocument();
    expect(localStorage.getItem('language')).toBe('en');
  });

  it('validates the AI draft and saves it for the session only', async () => {
    const user = userEvent.setup();
    await renderSettings('/settings/ai');

    const model = screen.getByLabelText(fa.settings.ai.modelLabel);
    await user.clear(model);
    await user.click(screen.getByRole('button', { name: fa.settings.ai.save }));
    expect(screen.getByText(fa.settings.ai.validation.modelRequired)).toBeInTheDocument();

    await user.type(screen.getByLabelText(fa.settings.ai.modelLabel), 'llama3');
    const timeout = screen.getByLabelText(fa.settings.ai.timeoutLabel);
    await user.clear(timeout);
    await user.type(timeout, '30');
    await user.click(screen.getByRole('button', { name: fa.settings.ai.save }));

    expect(screen.getByText(fa.settings.ai.savedAnnouncement)).toBeInTheDocument();
    expect(getSettingsDrafts().ai).toEqual({ model: 'llama3', timeoutSeconds: 30 });
  });

  it('restores the AI defaults on reset', async () => {
    const user = userEvent.setup();
    await renderSettings('/settings/ai');

    const model = screen.getByLabelText(fa.settings.ai.modelLabel);
    await user.clear(model);
    await user.type(model, 'mistral');
    await user.click(screen.getByRole('button', { name: fa.settings.ai.save }));

    await user.click(screen.getByRole('button', { name: fa.settings.ai.reset }));

    expect(model).toHaveValue('qwen2.5-coder:7b');
    expect(screen.getByText(fa.settings.ai.resetAnnouncement)).toBeInTheDocument();
    expect(getSettingsDrafts().ai.model).toBe('qwen2.5-coder:7b');
  });

  it('shows the AI preview notice and the single fixed provider', async () => {
    await renderSettings('/settings/ai');

    expect(screen.getByText(fa.settings.ai.previewNotice)).toBeInTheDocument();
    const provider = screen.getByLabelText<HTMLSelectElement>(fa.settings.ai.providerLabel);
    expect(provider).toBeDisabled();
    expect(provider.querySelectorAll('option')).toHaveLength(1);
    expect(provider).toHaveValue('Ollama');
  });

  it('describes the embedding model as server-managed without exposing paths', async () => {
    await renderSettings('/settings/embedding');

    expect(screen.getAllByText(fa.settings.embedding.serverManaged)).toHaveLength(2);
    expect(screen.getByText(fa.settings.embedding.noEndpointNote)).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).toBeNull();
    expect(screen.queryByText(/gguf|onnx|\.bin/i)).toBeNull();
  });

  it('shows the source-verified retrieval defaults and the unsupported threshold', async () => {
    await renderSettings('/settings/retrieval');

    expect(screen.getByLabelText(fa.settings.retrieval.chunkSizeLabel)).toHaveValue('300');
    expect(screen.getByLabelText(fa.settings.retrieval.overlapLabel)).toHaveValue('50');
    expect(screen.getByLabelText(fa.settings.retrieval.topKLabel)).toHaveValue('5');

    const similarity = screen.getByLabelText(fa.settings.retrieval.similarityLabel);
    expect(similarity).toBeDisabled();
    expect(similarity).toHaveAttribute(
      'placeholder',
      fa.settings.retrieval.similarityUnsupported,
    );
    expect(screen.getAllByText(fa.settings.retrieval.unsupportedNote).length).toBeGreaterThan(0);
  });

  it('rejects an overlap that is not smaller than the chunk size', async () => {
    const user = userEvent.setup();
    await renderSettings('/settings/retrieval');

    const overlap = screen.getByLabelText(fa.settings.retrieval.overlapLabel);
    await user.clear(overlap);
    await user.type(overlap, '300');
    await user.click(screen.getByRole('button', { name: fa.settings.retrieval.save }));

    expect(screen.getByText(fa.settings.retrieval.validation.overlapInvalid)).toBeInTheDocument();
    expect(getSettingsDrafts().retrieval.overlapTokens).toBe(50);
  });

  it('shows an in-shell not-found state for an unknown section', async () => {
    const user = userEvent.setup();
    const { router } = renderApp({ initialPath: '/settings/nope' });

    expect(await screen.findByText(fa.settings.sectionNotFoundTitle)).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: fa.settings.backToSettings }));

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/settings');
    });
    expect(await screen.findByText(fa.settings.general.title)).toBeInTheDocument();
  });

  it('renders English copy in English mode', async () => {
    localStorage.setItem('language', 'en');

    const view = renderApp({ initialPath: '/settings' });
    await screen.findByRole('heading', { level: 1, name: en.nav.settings });

    expect(screen.getByText(en.settings.general.title)).toBeInTheDocument();
    expect(screen.getByText(en.settings.general.readOnlyNote)).toBeInTheDocument();
    expect(
      screen.getByRole('navigation', { name: en.settings.sectionsLabel }),
    ).toBeInTheDocument();
    expect(screen.queryByText(fa.settings.general.title)).not.toBeInTheDocument();

    view.unmount();
  });
});
