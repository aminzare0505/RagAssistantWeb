import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { en } from '@/i18n/en';
import { fa } from '@/i18n/fa';
import { renderApp } from '@/test/render-app';

import { MOCK_REPLY_DELAY_MS } from './mock/mock-data';

function stubClipboard() {
  const writeText = vi.fn<(text: string) => Promise<void>>().mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText },
  });
  return writeText;
}

async function renderChat() {
  renderApp({ initialPath: '/chat' });
  await screen.findByRole('heading', { level: 1, name: fa.nav.chat });
}

afterEach(() => {
  Reflect.deleteProperty(navigator, 'clipboard');
});

describe('chat page', () => {
  it('renders the preview notice, history, and the seeded conversation', async () => {
    await renderChat();

    expect(screen.getByText(fa.chat.previewNotice)).toBeInTheDocument();
    expect(screen.getByText(fa.chat.previewBadge)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: fa.chat.historyTitle })).toBeInTheDocument();
    expect(screen.getByRole('log', { name: fa.chat.historyTitle })).toBeInTheDocument();
    expect(screen.getAllByText(fa.chat.userRole).length).toBeGreaterThan(0);
    expect(screen.getAllByText(fa.chat.assistantRole).length).toBeGreaterThan(0);
    expect(document.querySelectorAll('time').length).toBeGreaterThan(0);
  });

  it('renders markdown and a highlighted code block', async () => {
    const user = userEvent.setup();
    await renderChat();

    await user.click(screen.getByRole('button', { name: /^فراخوانی API/ }));

    await waitFor(() => {
      expect(document.querySelector('.chat-code pre')?.textContent).toContain(
        'const response = await fetch',
      );
    });
    expect(document.querySelector('.chat-code .hljs-keyword')?.textContent).toBe('const');
    expect(screen.getByText('ts')).toBeInTheDocument();
  });

  it('copies a message through the clipboard API', async () => {
    const user = userEvent.setup();
    await renderChat();
    const writeText = stubClipboard();

    const [copyButton] = screen.getAllByRole('button', { name: fa.chat.copyMessage });
    if (!copyButton) {
      throw new Error('Expected at least one copy button');
    }
    await user.click(copyButton);

    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: fa.chat.copied }).length).toBeGreaterThan(0);
    });
    expect(writeText).toHaveBeenCalledTimes(1);
    expect(writeText.mock.calls[0]?.[0]).toContain('مهم‌ترین نکات راهنمای استقرار');
  });

  it('reports a failed copy when the clipboard is unavailable', async () => {
    const user = userEvent.setup();
    await renderChat();
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined });

    await user.click(screen.getAllByRole('button', { name: fa.chat.copyMessage })[0]!);

    expect(
      await screen.findByRole('button', { name: fa.chat.copyFailed }),
    ).toBeInTheDocument();
  });

  it('copies a code block', async () => {
    const user = userEvent.setup();
    await renderChat();
    await user.click(screen.getByRole('button', { name: /^فراخوانی API/ }));
    const writeText = stubClipboard();

    await user.click(screen.getByRole('button', { name: fa.chat.copyCode }));

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledTimes(1);
    });
    expect(writeText.mock.calls[0]?.[0]).toContain('const response = await fetch');
  });

  it('regenerates the last assistant reply with a different mock answer', async () => {
    const user = userEvent.setup();
    await renderChat();
    expect(screen.getByText(/سه نکتهٔ کلیدی/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: fa.chat.regenerate }));

    expect(screen.getByRole('button', { name: fa.chat.stop })).toBeInTheDocument();
    await waitFor(
      () => {
        expect(screen.queryByRole('button', { name: fa.chat.stop })).toBeNull();
      },
      { timeout: 3000 },
    );
    expect(document.querySelector('.chat-code')).not.toBeNull();
    expect(screen.queryByText(/سه نکتهٔ کلیدی/)).toBeNull();
  });

  it('expands sources and shows the retrieved excerpt', async () => {
    const user = userEvent.setup();
    await renderChat();

    expect(screen.queryByText('سیاست‌های امنیتی.pdf')).toBeNull();
    await user.click(screen.getByRole('button', { name: /منابع \(نمایشی\)/ }));

    const sourceButton = screen.getByRole('button', {
      name: `${fa.chat.expandSource}: سیاست‌های امنیتی.pdf`,
    });
    await user.click(sourceButton);

    expect(
      screen.getByText('پیام خطا نباید مسیر فایل یا متن استثنا را نشان دهد.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: new RegExp(fa.chat.collapseSource) })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  });

  it('sends on Enter, clears the composer, and shows the generating state', async () => {
    const user = userEvent.setup();
    await renderChat();
    const textarea = screen.getByRole('textbox', { name: fa.chat.composerLabel });

    await user.type(textarea, 'یک پرسش تازه');
    await user.keyboard('{Enter}');

    expect(screen.getByText('یک پرسش تازه')).toBeInTheDocument();
    expect(textarea).toHaveValue('');
    expect(screen.getByRole('button', { name: fa.chat.stop })).toBeInTheDocument();

    await waitFor(
      () => {
        expect(screen.queryByRole('button', { name: fa.chat.stop })).toBeNull();
      },
      { timeout: 3000 },
    );
    expect(screen.getAllByText(fa.chat.assistantRole)).toHaveLength(2);
  });

  it('inserts a new line on Shift+Enter instead of sending', async () => {
    const user = userEvent.setup();
    await renderChat();
    const textarea = screen.getByRole('textbox', { name: fa.chat.composerLabel });

    await user.type(textarea, 'خط اول{Shift>}{Enter}{/Shift}خط دوم');

    expect(textarea).toHaveValue('خط اول\nخط دوم');
    expect(screen.queryByRole('button', { name: fa.chat.stop })).toBeNull();
    expect(screen.getByRole('button', { name: fa.chat.send })).toBeEnabled();
  });

  it('stops the mock generation when requested', async () => {
    const user = userEvent.setup();
    await renderChat();
    const textarea = screen.getByRole('textbox', { name: fa.chat.composerLabel });

    await user.type(textarea, 'پرسشی که نیمه‌کاره می‌ماند');
    await user.keyboard('{Enter}');
    await user.click(await screen.findByRole('button', { name: fa.chat.stop }));

    expect(screen.queryByRole('button', { name: fa.chat.stop })).toBeNull();
    await new Promise((resolve) => setTimeout(resolve, MOCK_REPLY_DELAY_MS + 300));
    expect(screen.getAllByText(fa.chat.assistantRole)).toHaveLength(1);
  });

  it('starts an empty conversation and sends a suggestion', async () => {
    const user = userEvent.setup();
    await renderChat();

    await user.click(screen.getByRole('button', { name: fa.chat.newChat }));

    expect(screen.getByRole('heading', { name: fa.chat.emptyTitle })).toBeInTheDocument();
    const [suggestion] = fa.chat.emptySuggestions;
    if (!suggestion) {
      throw new Error('Expected an empty-state suggestion');
    }
    await user.click(screen.getByRole('button', { name: suggestion }));

    expect(screen.getAllByText(suggestion).length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: fa.chat.stop })).toBeInTheDocument();
  });

  it('filters conversations by search and reports no matches', async () => {
    const user = userEvent.setup();
    await renderChat();
    const search = screen.getByRole('searchbox', { name: fa.chat.searchLabel });

    await user.type(search, 'فراخوانی');

    expect(screen.getByRole('button', { name: /^فراخوانی API/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^پرسش دربارهٔ راهنمای استقرار/ })).toBeNull();

    await user.clear(search);
    await user.type(search, 'نتیجه‌ای ندارد');

    expect(screen.getByText(fa.chat.searchEmptyTitle)).toBeInTheDocument();
    expect(screen.getByText(fa.chat.searchEmptyDescription)).toBeInTheDocument();
  });

  it('deletes a conversation after confirmation', async () => {
    const user = userEvent.setup();
    await renderChat();

    await user.click(
      screen.getByRole('button', { name: `${fa.chat.deleteConversation}: فراخوانی API` }),
    );

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText(fa.chat.deleteDialogTitle)).toBeInTheDocument();
    await user.click(within(dialog).getByRole('button', { name: fa.chat.deleteConfirm }));

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /^فراخوانی API/ })).toBeNull();
    });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('shows the empty state after every conversation is deleted', async () => {
    const user = userEvent.setup();
    await renderChat();

    for (let index = 0; index < 3; index += 1) {
      const [deleteButton] = screen.getAllByRole('button', {
        name: new RegExp(`^${fa.chat.deleteConversation}:`),
      });
      if (!deleteButton) {
        throw new Error('Expected a delete button');
      }
      await user.click(deleteButton);
      const dialog = await screen.findByRole('dialog');
      await user.click(within(dialog).getByRole('button', { name: fa.chat.deleteConfirm }));
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).toBeNull();
      });
    }

    expect(screen.getAllByText(fa.chat.noConversationsTitle).length).toBeGreaterThan(0);
    expect(screen.getByRole('textbox', { name: fa.chat.composerLabel })).toBeInTheDocument();
  });

  it('opens the mobile history sheet and closes it after selecting', async () => {
    const user = userEvent.setup();
    await renderChat();

    await user.click(screen.getByRole('button', { name: fa.chat.openHistory }));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getAllByText(fa.chat.historyTitle).length).toBeGreaterThan(0);

    await user.click(within(dialog).getByRole('button', { name: /^فراخوانی API/ }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
    expect(screen.getByRole('heading', { level: 2, name: 'فراخوانی API' })).toBeInTheDocument();
  });

  it('renders in English, LTR, and the dark theme', async () => {
    localStorage.setItem('language', 'en');
    localStorage.setItem('theme', 'dark');

    renderApp({ initialPath: '/chat' });
    await screen.findByRole('heading', { level: 1, name: en.nav.chat });

    expect(document.documentElement).toHaveAttribute('lang', 'en');
    expect(document.documentElement).toHaveAttribute('dir', 'ltr');
    expect(document.documentElement).toHaveClass('dark');
    expect(screen.getByRole('button', { name: en.chat.newChat })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: en.chat.composerLabel })).toBeInTheDocument();
    expect(
      screen.getByText('What are the key points of the deployment guide?'),
    ).toBeInTheDocument();
  });
});
