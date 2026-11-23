import {
  useMutation,
  useQuery,
} from '@tanstack/react-query';
import { useCallback, useRef, useState } from 'react';

import {
  getConversation,
  listConversations,
  streamChat,
  type ChatStreamEvent,
} from '../api/chat-api';
import type {
  ChatConversationDto,
  ChatDetailsDto,
  MessageEnum,
} from '@/api/types/chat';
import type { ChatConversation, ChatMessage, ChatSource } from '../types';

function roleFromEnum(value: MessageEnum): ChatRole {
  switch (value) {
    case 1:
      return 'user';
    case 3:
      return 'assistant';
    default:
      return 'user';
  }
}

type ChatRole = 'user' | 'assistant';

function mapSource(source: {
  id: number;
  documentId: number | null;
  pageNumber: number | null;
  score: number | null;
}): ChatSource {
  return {
    id: String(source.id),
    documentName: null,
    page: source.pageNumber,
    score: source.score,
    snippet: null,
  };
}

function mapMessage(dto: {
  id: number;
  role: MessageEnum;
  content: string;
  createdAt: string;
  sources: readonly {
    id: number;
    documentId: number | null;
    pageNumber: number | null;
    score: number | null;
  }[];
}): ChatMessage {
  return {
    id: String(dto.id),
    role: roleFromEnum(dto.role),
    content: dto.content,
    createdAt: dto.createdAt,
    sources: dto.sources.map(mapSource),
  };
}

export function mapConversation(dto: ChatConversationDto): ChatConversation {
  return {
    id: String(dto.id),
    title: dto.title,
    updatedAt: dto.updatedAt,
    messages: [],
  };
}

export function mapDetails(dto: ChatDetailsDto): ChatConversation {
  return {
    id: String(dto.conversation.id),
    title: dto.conversation.title,
    updatedAt: dto.conversation.updatedAt,
    messages: dto.messages.map((m) =>
      mapMessage({
        id: m.message.id,
        role: m.message.role,
        content: m.message.content,
        createdAt: m.message.createdAt,
        sources: m.sources,
      }),
    ),
  };
}

/**
 * Query hook: list the authenticated user's conversations.
 */
export function useConversations(page: number, pageSize: number) {
  return useQuery({
    queryKey: ['conversations', page, pageSize],
    queryFn: () => listConversations(page, pageSize),
    staleTime: 30_000,
  });
}

/**
 * Query hook: get a single conversation's details and messages.
 */
export function useConversation(id: number, page: number, pageSize: number) {
  return useQuery({
    queryKey: ['conversation', id, page, pageSize],
    queryFn: () => getConversation(id, page, pageSize),
    enabled: id > 0,
    staleTime: 30_000,
  });
}

/**
 * Mutation hook: stream a new turn via POST /api/Chat/stream.
 *
 * The mutation function accepts conversation history plus a chunk callback.
 * Returns `{ mutate, isPending, ... }` plus `isGenerating` and `stopGeneration`.
 */
export function useSendMessage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const streamController = useRef<AbortController | null>(null);

  const mutation = useMutation({
    mutationFn: async ({
      conversations,
      conversationId,
      title,
      onChunk,
    }: {
      conversations: readonly {
        messageType: MessageEnum;
        text: string;
        documentId: number | null;
      }[];
      conversationId: number | null;
      title: string | null;
      onChunk: (text: string) => void;
    }) => {
      setIsGenerating(true);
      const controller = new AbortController();
      streamController.current = controller;

      try {
        await streamChat(
          conversations,
          conversationId,
          title,
          (event: ChatStreamEvent) => {
            if (event.type === 'chunk') {
              onChunk(event.text);
            } else if (event.type === 'error') {
              throw new Error(event.message);
            }
          },
          controller.signal,
        );
      } finally {
        streamController.current = null;
        setIsGenerating(false);
      }
    },
  });

  const stopGeneration = useCallback(() => {
    streamController.current?.abort();
    streamController.current = null;
    setIsGenerating(false);
  }, []);

  return {
    ...mutation,
    isGenerating,
    stopGeneration,
  };
}
