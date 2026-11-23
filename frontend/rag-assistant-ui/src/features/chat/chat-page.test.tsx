import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { en } from '@/i18n/en';
import { fa } from '@/i18n/fa';
import { apiEnvelope, jsonResponse, type FetchMock } from '@/test/api';
import { renderApp } from '@/test/render-app';

function stubClipboard() {
  const writeText = vi.fn<(text: string) => Promise<void>>().mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText },
  });
  return writeText;
}

const CONVERSATIONS = [
  { id: 1, userId: 1, title: 'فراخوانی API', createdAt: '2026-11-16T12:00:00.000Z', updatedAt: '2026-11-16T12:00:00.000Z', isDeleted: false },
  { id: 2, userId: 1, title: 'پرسش دربارهٔ راهنمای استقرار', createdAt: '2026-11-15T10:00:00.000Z', updatedAt: '2026-11-15T10:00:00.000Z', isDeleted: false },
];

const CONVERSATION_1_DETAILS = {
  conversation: { id: 1, userId: 1, title: 'فراخوانی API', createdAt: '2026-11-16T12:00:00.000Z', updatedAt: '2026-11-16T12:00:00.000Z', isDeleted: false },
  messages: [
    {
      message: { id: 1, conversationId: 1, role: 1, content: 'سوالی درباره استقرار', sequence: 1, model: null, promptTokens: null, completionTokens: null, totalTokens: null, createdAt: '2026-11-16T12:00:00.000Z' },
      sources: [],
    },
    {
      message: { id: 2, conversationId: 1, role: 3, content: 'سه نکتهٔ کلیدی درباره استقرار:', sequence: 2, model: null, promptTokens: null, completionTokens: null, totalTokens: null, createdAt: '2026-11-16T12:00:01.000Z' },
      sources: [
        { id: 1, messageId: 2, documentId: 4, chunkId: null, pageNumber: null, score: 0.95 },
      ],
    },
  ],
  page: 1,
  pageSize: 50,
  totalMessages: 2,
};

async function renderChat(fetchMock?: FetchMock) {
  if (fetchMock) {
    vi.stubGlobal('fetch', fetchMock);
  }
  renderApp({ initialPath: '/chat' });
  await screen.findByRole('heading', { level: 1, name: fa.nav.chat });
}

afterEach(() => {
  Reflect.deleteProperty(navigator, 'clipboard');
  vi.unstubAllGlobals();
});

function createSseResponse(chunks: string[]): Response {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
      }
      controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      controller.close();
    },
  });
  return new Response(stream, {
    status: 200,
    headers: { 'Content-Type': 'text/event-stream; charset=utf-8' },
  });
}

describe('chat page', () => {
  it('renders the notice, history, and seeded conversation from the API', async () => {
    const fetchMock = vi.fn<FetchMock>();
    fetchMock
      .mockResolvedValueOnce(jsonResponse(apiEnvelope({ items: CONVERSATIONS, page: 1, pageSize: 20, totalCount: 2, totalPages: 1 })))
      .mockResolvedValueOnce(jsonResponse(apiEnvelope(CONVERSATION_1_DETAILS)));
    await renderChat(fetchMock);

    expect(screen.getByText(fa.chat.previewNotice)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: fa.chat.historyTitle })).toBeInTheDocument();
    expect(screen.getByRole('log', { name: fa.chat.historyTitle })).toBeInTheDocument();
    expect(screen.getAllByText(fa.chat.userRole).length).toBeGreaterThan(0);
    expect(screen.getAllByText(fa.chat.assistantRole).length).toBeGreaterThan(0);
  });

  it('renders markdown and a highlighted code block', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn<FetchMock>();
    fetchMock
      .mockResolvedValueOnce(jsonResponse(apiEnvelope({ items: [], page: 1, pageSize: 20, totalCount: 0, totalPages: 0 })));
    await renderChat(fetchMock);

    await user.click(screen.getByRole('button', { name: fa.chat.newChat }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: fa.chat.emptyTitle })).toBeInTheDocument();
    });
    const [suggestion] = fa.chat.emptySuggestions;
    if (!suggestion) {
      throw new Error('Expected an empty-state suggestion');
    }
    await user.click(screen.getByRole('button', { name: suggestion }));

    expect(screen.getAllByText(suggestion).length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: fa.chat.stop })).toBeInTheDocument();
  });

  it('copies a message through the clipboard API', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn<FetchMock>();
    fetchMock
      .mockResolvedValueOnce(jsonResponse(apiEnvelope({ items: CONVERSATIONS, page: 1, pageSize: 20, totalCount: 2, totalPages: 1 })))
      .mockResolvedValueOnce(jsonResponse(apiEnvelope(CONVERSATION_1_DETAILS)));
    await renderChat(fetchMock);
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
  });

  it('sends on Enter, calls the stream endpoint, and shows the generating state', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn<FetchMock>();
    fetchMock
      .mockResolvedValueOnce(jsonResponse(apiEnvelope({ items: [], page: 1, pageSize: 20, totalCount: 0, totalPages: 0 })))
      .mockResolvedValueOnce(createSseResponse(['پیام پاسخ از سرور']));
    await renderChat(fetchMock);

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
      { timeout: 5000 },
    );
    expect(screen.getAllByText(fa.chat.assistantRole)).toHaveLength(2);
  });

  it('inserts a new line on Shift+Enter instead of sending', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn<FetchMock>();
    fetchMock.mockResolvedValueOnce(jsonResponse(apiEnvelope({ items: [], page: 1, pageSize: 20, totalCount: 0, totalPages: 0 })));
    await renderChat(fetchMock);

    const textarea = screen.getByRole('textbox', { name: fa.chat.composerLabel });
    await user.type(textarea, 'خط اول{Shift>}{Enter}{/Shift}خط دوم');

    expect(textarea).toHaveValue('خط اول\nخط دوم');
    expect(screen.queryByRole('button', { name: fa.chat.stop })).toBeNull();
    expect(screen.getByRole('button', { name: fa.chat.send })).toBeEnabled();
  });

  it('stops the generation when requested', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn<FetchMock>();
    fetchMock.mockResolvedValueOnce(jsonResponse(apiEnvelope({ items: [], page: 1, pageSize: 20, totalCount: 0, totalPages: 0 })));
    await renderChat(fetchMock);

    const textarea = screen.getByRole('textbox', { name: fa.chat.composerLabel });
    await user.type(textarea, 'پرسشی که نیمه‌کاره می‌ماند');
    await user.keyboard('{Enter}');
    await user.click(await screen.findByRole('button', { name: fa.chat.stop }));

    expect(screen.queryByRole('button', { name: fa.chat.stop })).toBeNull();
    expect(screen.getAllByText(fa.chat.assistantRole)).toHaveLength(1);
  });

  it('filters conversations by search and reports no matches', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn<FetchMock>();
    fetchMock.mockResolvedValueOnce(jsonResponse(apiEnvelope({ items: [], page: 1, pageSize: 20, totalCount: 0, totalPages: 0 })));
    await renderChat(fetchMock);
    const search = screen.getByRole('searchbox', { name: fa.chat.searchLabel });

    await user.type(search, 'نتیجه‌ای ندارد');

    expect(screen.getByText(fa.chat.searchEmptyTitle)).toBeInTheDocument();
    expect(screen.getByText(fa.chat.searchEmptyDescription)).toBeInTheDocument();
  });

  it('opens the mobile history sheet and closes it after selecting', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn<FetchMock>();
    fetchMock
      .mockResolvedValueOnce(jsonResponse(apiEnvelope({ items: CONVERSATIONS, page: 1, pageSize: 20, totalCount: 2, totalPages: 1 })))
      .mockResolvedValueOnce(jsonResponse(apiEnvelope(CONVERSATION_1_DETAILS)));
    await renderChat(fetchMock);

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

    const fetchMock = vi.fn<FetchMock>();
    fetchMock.mockResolvedValueOnce(jsonResponse(apiEnvelope({ items: [], page: 1, pageSize: 20, totalCount: 0, totalPages: 0 })));
    renderApp({ initialPath: '/chat' });
    await screen.findByRole('heading', { level: 1, name: en.nav.chat });

    expect(document.documentElement).toHaveAttribute('lang', 'en');
    expect(document.documentElement).toHaveAttribute('dir', 'ltr');
    expect(document.documentElement).toHaveClass('dark');
    expect(screen.getByRole('button', { name: en.chat.newChat })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: en.chat.composerLabel })).toBeInTheDocument();
  });
});
