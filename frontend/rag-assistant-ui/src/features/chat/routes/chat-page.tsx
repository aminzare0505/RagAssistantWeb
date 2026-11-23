import { History, MessageSquare } from 'lucide-react';
import { useCallback, useState } from 'react';

import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useLanguage } from '@/i18n/use-language';

import { ChatComposer } from '../components/chat-composer';
import { ChatEmptyState } from '../components/chat-empty-state';
import { ChatMessageList } from '../components/chat-message-list';
import { ConversationHistory } from '../components/conversation-history';
import {
  useConversation,
  useConversations,
  mapDetails,
  mapConversation,
  useSendMessage,
} from '../hooks/use-chat';
import type { ChatConversation } from '../types';
import type { MessageEnum } from '@/api/types/chat';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

export function ChatPage() {
  const { t } = useLanguage();
  const [isHistoryOpen, setHistoryOpen] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
  const [streamingMessage, setStreamingMessage] = useState<{
    id: string;
    role: 'assistant';
    content: string;
    createdAt: string;
    sources: {
      id: string;
      documentName: string | null;
      page: number | null;
      score: number | null;
      snippet: string | null;
    }[];
  } | null>(null);

  const conversationsQuery = useConversations(DEFAULT_PAGE, DEFAULT_PAGE_SIZE);
  const conversationId = activeConversationId;
  const detailsQuery = useConversation(conversationId ?? 0, DEFAULT_PAGE, 50);
  const sendMessage = useSendMessage();

  const isLoading = conversationsQuery.isLoading || detailsQuery.isLoading;
  const conversations = conversationsQuery.data ?? null;
  const activeConversation =
    conversationId !== null && detailsQuery.data
      ? mapDetails(detailsQuery.data)
      : null;

  const allConversations: ChatConversation[] = conversations?.items
    ? conversations.items.map((item) => mapConversation(item))
    : [];

  const activeId = activeConversation?.id ?? null;

  const selectConversation = useCallback((id: string) => {
    const numericId = Number.parseInt(id, 10);
    if (Number.isNaN(numericId)) {
      return;
    }
    setActiveConversationId(numericId);
    setStreamingMessage(null);
    setHistoryOpen(false);
  }, []);

  const startNewChat = useCallback(() => {
    setActiveConversationId(null);
    setStreamingMessage(null);
    setHistoryOpen(false);
  }, []);

  const deleteConversation = useCallback(() => {
    // Backend has no conversation delete endpoint in the current contract.
  }, []);

  const onSend = useCallback(
    (content: string) => {
      const numericConversationId =
        conversationId !== null ? conversationId : null;

      const userMessageType: MessageEnum = 1;
      const assistantMessageType: MessageEnum = 3;

      if (!activeConversation) {
        const history = [
          { messageType: userMessageType, text: content, documentId: null },
        ];

        sendMessage.mutate(
          {
            conversations: history,
            conversationId: null,
            title: content.slice(0, 48),
            onChunk: (text: string) => {
              setStreamingMessage((prev) => {
                if (prev) {
                  return { ...prev, content: prev.content + text };
                }
                return {
                  id: 'streaming',
                  role: 'assistant',
                  content: text,
                  createdAt: new Date().toISOString(),
                  sources: [],
                };
              });
            },
          },
          {
            onSettled: () => {
              setStreamingMessage(null);
              void conversationsQuery.refetch();
            },
          },
        );
        return;
      }

      const existingMessages = activeConversation.messages.map((m) => ({
        messageType: m.role === 'user' ? userMessageType : assistantMessageType,
        text: m.content,
        documentId: null,
      }));
      const history = [
        ...existingMessages,
        { messageType: userMessageType, text: content, documentId: null },
      ];

      sendMessage.mutate(
        {
          conversations: history,
          conversationId: numericConversationId,
          title: null,
          onChunk: (text: string) => {
            setStreamingMessage((prev) => {
              if (prev) {
                return { ...prev, content: prev.content + text };
              }
              return {
                id: 'streaming',
                role: 'assistant',
                content: text,
                createdAt: new Date().toISOString(),
                sources: [],
              };
            });
          },
        },
        {
          onSettled: () => {
            setStreamingMessage(null);
            void detailsQuery.refetch();
          },
        },
      );
    },
    [
      activeConversation,
      conversationId,
      detailsQuery,
      conversationsQuery,
      sendMessage,
    ],
  );

  const stopGeneration = useCallback(() => {
    sendMessage.stopGeneration();
    setStreamingMessage(null);
  }, [sendMessage]);

  const messages = activeConversation
    ? [...activeConversation.messages, streamingMessage].filter(
        Boolean,
      ) as {
      id: string;
      role: 'user' | 'assistant';
      content: string;
      createdAt: string;
      sources: {
        id: string;
        documentName: string | null;
        page: number | null;
        score: number | null;
        snippet: string | null;
      }[];
    }[]
    : [];

  return (
    <div className="flex h-[calc(100dvh-12rem)] min-h-[26rem] flex-col gap-3 lg:h-[calc(100dvh-11.5rem)] lg:gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight">{t.nav.chat}</h1>
          <p className="mt-1 max-w-3xl text-xs leading-6 text-muted-foreground">
            {t.chat.previewNotice}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="lg:hidden"
          onClick={() => setHistoryOpen(true)}
        >
          <History aria-hidden />
          {t.chat.openHistory}
        </Button>
      </div>

      <Card className="min-h-0 flex-1 flex-row overflow-hidden">
        <aside className="hidden w-72 shrink-0 border-e bg-sidebar/40 lg:block">
          <ConversationHistory
            conversations={allConversations}
            activeId={activeId}
            search=""
            onSearchChange={() => {}}
            onSelect={selectConversation}
            onNewChat={startNewChat}
            onDelete={deleteConversation}
          />
        </aside>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="flex items-center justify-between gap-3 border-b px-4 py-2.5">
            <h2 className="truncate text-sm font-medium">
              {activeConversation?.title || t.chat.untitled}
            </h2>
          </div>

          {isLoading ? (
            <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
              <EmptyState
                icon={MessageSquare}
                title={t.loading.generic}
                description={t.chat.previewNotice}
              />
            </div>
          ) : !activeConversation ? (
            <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
              <EmptyState
                icon={MessageSquare}
                title={t.chat.noConversationsTitle}
                description={t.chat.noConversationsDescription}
                action={
                  <Button type="button" size="sm" onClick={startNewChat}>
                    {t.chat.newChat}
                  </Button>
                }
              />
            </div>
          ) : messages.length === 0 ? (
            <div className="min-h-0 flex-1 overflow-y-auto">
              <ChatEmptyState onSuggestion={onSend} />
            </div>
          ) : (
            <ChatMessageList
              messages={messages}
              isGenerating={sendMessage.isPending || sendMessage.isGenerating}
              onRegenerate={() => {}}
            />
          )}

          <ChatComposer
            isGenerating={sendMessage.isPending || sendMessage.isGenerating}
            onSend={onSend}
            onStop={stopGeneration}
          />
        </div>
      </Card>

      <Dialog open={isHistoryOpen} onOpenChange={setHistoryOpen}>
        <DialogContent side="start" className="flex flex-col" aria-describedby={undefined}>
          <DialogTitle className="sr-only">{t.chat.historyTitle}</DialogTitle>
          <ConversationHistory
            conversations={allConversations}
            activeId={activeId}
            search=""
            onSearchChange={() => {}}
            onSelect={(id) => {
              selectConversation(id);
              setHistoryOpen(false);
            }}
            onNewChat={() => {
              startNewChat();
              setHistoryOpen(false);
            }}
            onDelete={deleteConversation}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
