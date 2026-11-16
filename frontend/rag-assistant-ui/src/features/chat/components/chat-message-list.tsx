import { useEffect, useRef } from 'react';

import { Spinner } from '@/components/ui/spinner';
import { useLanguage } from '@/i18n/use-language';

import type { ChatMessage } from '../types';
import { ChatMessageItem } from './chat-message-item';

interface ChatMessageListProps {
  messages: ChatMessage[];
  isGenerating: boolean;
  onRegenerate: () => void;
}

export function ChatMessageList({ messages, isGenerating, onRegenerate }: ChatMessageListProps) {
  const { t } = useLanguage();
  const listRef = useRef<HTMLDivElement>(null);
  const lastMessage = messages.at(-1);
  const lastAssistantId = [...messages]
    .reverse()
    .find((message) => message.role === 'assistant')?.id;
  const canRegenerate = lastMessage?.role === 'assistant' && lastMessage.id === lastAssistantId;

  useEffect(() => {
    const node = listRef.current;
    if (!node) {
      return;
    }

    const scrollToEnd = () => {
      node.scrollTop = node.scrollHeight;
    };

    scrollToEnd();

    // The list height depends on flex layout and font metrics, which may settle
    // after the first paint; keep the newest message visible when they do.
    const content = node.firstElementChild;
    const observer = new ResizeObserver(scrollToEnd);
    if (content) {
      observer.observe(content);
    }

    return () => observer.disconnect();
  }, [messages.length, isGenerating]);

  return (
    <div
      ref={listRef}
      role="log"
      aria-live="polite"
      aria-label={t.chat.historyTitle}
      className="min-h-0 flex-1 overflow-y-auto"
    >
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6 sm:px-6">
        {messages.map((message) => (
          <ChatMessageItem
            key={message.id}
            message={message}
            isGenerating={isGenerating}
            canRegenerate={canRegenerate && message.id === lastAssistantId}
            onRegenerate={onRegenerate}
          />
        ))}

        {isGenerating ? (
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <Spinner size="sm" label={t.chat.previewReplyNotice} />
            <span aria-hidden>{t.chat.previewReplyNotice}…</span>
          </p>
        ) : null}
      </div>
    </div>
  );
}
