import { buildUrl } from '@/api/http-client';
import { request } from '@/api/http-client';
import { getAccessToken } from '@/auth/token-store';
import {
  type ChatConversationDtoPagedResultApiResponse,
  type ChatDetailsDtoApiResponse,
  type Conversation,
} from '@/api/types/chat';

const CHAT_BASE = '/api/Chat';

/**
 * List the authenticated user's conversations, newest activity first.
 */
export async function listConversations(
  page: number,
  pageSize: number,
): Promise<ChatConversationDtoPagedResultApiResponse['value']> {
  return request<ChatConversationDtoPagedResultApiResponse['value']>(
    `${CHAT_BASE}?page=${page}&pageSize=${pageSize}`,
    { method: 'GET' },
  );
}

/**
 * Get a conversation's header, a page of messages, and their sources.
 */
export async function getConversation(
  id: number,
  page: number,
  pageSize: number,
): Promise<ChatDetailsDtoApiResponse['value']> {
  return request<ChatDetailsDtoApiResponse['value']>(
    `${CHAT_BASE}/${id}?page=${page}&pageSize=${pageSize}`,
    { method: 'GET' },
  );
}

/**
 * SSE chat stream event types returned by POST /api/Chat/stream.
 */
export type ChatStreamEvent =
  | { type: 'chunk'; text: string }
  | { type: 'done' }
  | { type: 'error'; message: string };

/**
 * Stream a chat conversation via Server-Sent Events.
 *
 * Calls POST /api/Chat/stream with the conversation history. The backend
 * responds with text/event-stream; each `data:` frame is a JSON-encoded
 * text chunk, terminated by `[DONE]` or an `error` event.
 *
 * @param conversations - Full conversation history (must end with a user message)
 * @param conversationId - Existing conversation id, or null to create a new one
 * @param title - Optional title for a new conversation
 * @param onEvent - Callback for each parsed stream event
 * @param signal - AbortSignal to cancel the stream
 */
export async function streamChat(
  conversations: readonly Conversation[],
  conversationId: number | null,
  title: string | null,
  onEvent: (event: ChatStreamEvent) => void,
  signal?: AbortSignal,
): Promise<void> {
  const url = new URL(buildUrl(CHAT_BASE + '/stream'));
  if (conversationId !== null) {
    url.searchParams.set('conversationId', String(conversationId));
  }
  if (title !== null && title !== '') {
    url.searchParams.set('title', title);
  }

  const token = getAccessToken();
  const headers: Record<string, string> = {
    Accept: 'text/event-stream',
    'Content-Type': 'application/json',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const combinedSignal = signal
    ? AbortSignal.any([signal, controller.signal])
    : controller.signal;

  try {
    const response = await fetch(url.toString(), {
      method: 'POST',
      headers,
      body: JSON.stringify(conversations),
      signal: combinedSignal,
    });

    if (!response.ok || !response.body) {
      throw new Error(`Stream failed with HTTP ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf('\n\n')) >= 0) {
          const frame = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 2);

          const lines = frame.split('\n');
          let eventType = 'data';
          let data = '';

          for (const line of lines) {
            if (line.startsWith('event: ')) {
              eventType = line.slice(7);
            } else if (line.startsWith('data: ')) {
              data += line.slice(6);
            }
          }

          if (eventType === 'error') {
            onEvent({ type: 'error', message: data });
            return;
          }

          if (data === '[DONE]') {
            onEvent({ type: 'done' });
            return;
          }

          if (data) {
            try {
              const chunk: unknown = JSON.parse(data);
              if (typeof chunk === 'string') {
                onEvent({ type: 'chunk', text: chunk });
              }
            } catch {
              // Ignore unparseable frames.
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  } catch (error) {
    if ((error as DOMException).name === 'AbortError') {
      return;
    }
    throw error;
  }
}
