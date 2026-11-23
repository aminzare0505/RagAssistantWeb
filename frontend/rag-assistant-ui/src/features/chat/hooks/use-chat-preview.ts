import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { Language } from '@/i18n/messages';
import { useLanguage } from '@/i18n/use-language';

import {
  MOCK_REPLY_DELAY_MS,
  createAssistantMessage,
  createEmptyConversation,
  createMockConversations,
  createUserMessage,
} from '../mock/mock-data';
import type { ChatConversation } from '../types';

interface ChatPreviewStore {
  conversations: ChatConversation[];
  activeId: string | null;
}

const TITLE_MAX_LENGTH = 48;

function titleFromContent(content: string): string {
  const [firstLine = ''] = content.split('\n');
  const trimmed = firstLine.trim();
  return trimmed.length > TITLE_MAX_LENGTH
    ? `${trimmed.slice(0, TITLE_MAX_LENGTH - 1)}…`
    : trimmed;
}

function updateConversation(
  conversations: ChatConversation[],
  updated: ChatConversation,
): ChatConversation[] {
  return conversations.map((conversation) =>
    conversation.id === updated.id ? updated : conversation,
  );
}

/**
 * Preview-only chat state. Everything lives in memory and is seeded from
 * `mock-data.ts`; no request is made. Replace this hook with API-backed state
 * once the chat contract exists.
 */
export function useChatPreview() {
  const { language } = useLanguage();
  const [store, setStore] = useState<ChatPreviewStore>(() => {
    const conversations = createMockConversations(language);
    return { conversations, activeId: conversations[0]?.id ?? null };
  });
  const [search, setSearch] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const replyTimer = useRef<number | null>(null);

  const clearReplyTimer = useCallback(() => {
    if (replyTimer.current !== null) {
      window.clearTimeout(replyTimer.current);
      replyTimer.current = null;
    }
  }, []);

  useEffect(() => clearReplyTimer, [clearReplyTimer]);

  const appendAssistantReply = useCallback(
    (conversationId: string, replyLanguage: Language, turnOverride?: number) => {
      setStore((current) => {
        const target = current.conversations.find(
          (conversation) => conversation.id === conversationId,
        );
        if (!target) {
          return current;
        }

        const turn =
          turnOverride ??
          target.messages.filter((message) => message.role === 'assistant').length;
        const reply = createAssistantMessage(replyLanguage, turn);
        const updated: ChatConversation = {
          ...target,
          updatedAt: reply.createdAt,
          messages: [...target.messages, reply],
        };

        return {
          ...current,
          conversations: updateConversation(current.conversations, updated),
        };
      });
    },
    [],
  );

  const scheduleReply = useCallback(
    (conversationId: string, replyLanguage: Language, turnOverride?: number) => {
      clearReplyTimer();
      setIsGenerating(true);
      replyTimer.current = window.setTimeout(() => {
        replyTimer.current = null;
        appendAssistantReply(conversationId, replyLanguage, turnOverride);
        setIsGenerating(false);
      }, MOCK_REPLY_DELAY_MS);
    },
    [appendAssistantReply, clearReplyTimer],
  );

  const sendMessage = useCallback(
    (rawContent: string) => {
      const content = rawContent.trim();
      if (!content || isGenerating) {
        return;
      }

      const userMessage = createUserMessage(content);
      const existing = store.activeId
        ? store.conversations.find((conversation) => conversation.id === store.activeId)
        : undefined;
      const base = existing ?? createEmptyConversation(language);
      const nextConversation: ChatConversation = {
        ...base,
        title: base.messages.length === 0 ? titleFromContent(content) : base.title,
        updatedAt: userMessage.createdAt,
        messages: [...base.messages, userMessage],
      };
      const conversations = existing
        ? updateConversation(store.conversations, nextConversation)
        : [nextConversation, ...store.conversations];

      setStore({ conversations, activeId: nextConversation.id });
      scheduleReply(nextConversation.id, language);
    },
    [isGenerating, language, scheduleReply, store],
  );

  const regenerate = useCallback(() => {
    if (isGenerating || !store.activeId) {
      return;
    }

    const target = store.conversations.find(
      (conversation) => conversation.id === store.activeId,
    );
    const lastMessage = target?.messages.at(-1);
    if (!target || !lastMessage || lastMessage.role !== 'assistant') {
      return;
    }

    const withoutLastReply: ChatConversation = {
      ...target,
      messages: target.messages.slice(0, -1),
    };
    const nextTurn = target.messages.filter((message) => message.role === 'assistant').length;
    setStore((current) => ({
      ...current,
      conversations: updateConversation(current.conversations, withoutLastReply),
    }));
    scheduleReply(target.id, language, nextTurn);
  }, [isGenerating, language, scheduleReply, store]);

  const stopGeneration = useCallback(() => {
    clearReplyTimer();
    setIsGenerating(false);
  }, [clearReplyTimer]);

  const startNewChat = useCallback(() => {
    if (isGenerating) {
      stopGeneration();
    }

    const emptyConversation = store.conversations.find(
      (conversation) => conversation.messages.length === 0,
    );
    setSearch('');

    if (emptyConversation) {
      setStore((current) => ({ ...current, activeId: emptyConversation.id }));
      return;
    }

    const conversation = createEmptyConversation(language);
    setStore((current) => ({
      conversations: [conversation, ...current.conversations],
      activeId: conversation.id,
    }));
  }, [isGenerating, language, stopGeneration, store.conversations]);

  const selectConversation = useCallback(
    (id: string) => {
      if (isGenerating) {
        return;
      }
      setStore((current) => ({ ...current, activeId: id }));
    },
    [isGenerating],
  );

  const deleteConversation = useCallback(
    (id: string) => {
      if (isGenerating && store.activeId === id) {
        stopGeneration();
      }

      setStore((current) => {
        const conversations = current.conversations.filter(
          (conversation) => conversation.id !== id,
        );
        return {
          conversations,
          activeId:
            current.activeId === id ? (conversations[0]?.id ?? null) : current.activeId,
        };
      });
    },
    [isGenerating, stopGeneration, store.activeId],
  );

  const filteredConversations = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    if (!query) {
      return store.conversations;
    }
    return store.conversations.filter(
      (conversation) =>
        conversation.title?.toLocaleLowerCase().includes(query) ||
        conversation.messages.some((message) =>
          message.content.toLocaleLowerCase().includes(query),
        ),
    );
  }, [search, store.conversations]);

  const activeConversation =
    store.conversations.find((conversation) => conversation.id === store.activeId) ?? null;

  return {
    conversations: store.conversations,
    filteredConversations,
    activeConversation,
    search,
    setSearch,
    isGenerating,
    sendMessage,
    stopGeneration,
    regenerate,
    startNewChat,
    selectConversation,
    deleteConversation,
  };
}
