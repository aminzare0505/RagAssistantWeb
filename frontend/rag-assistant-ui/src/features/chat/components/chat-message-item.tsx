import { Bot, RefreshCw, UserRound } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useLanguage } from '@/i18n/use-language';
import { cn } from '@/lib/utils';

import { formatMessageTime } from '../lib/format';
import type { ChatMessage } from '../types';
import { CopyButton } from './copy-button';
import { MarkdownMessage } from './markdown-message';
import { MessageSources } from './message-sources';

interface ChatMessageItemProps {
  message: ChatMessage;
  isGenerating: boolean;
  canRegenerate: boolean;
  onRegenerate: () => void;
}

export function ChatMessageItem({
  message,
  isGenerating,
  canRegenerate,
  onRegenerate,
}: ChatMessageItemProps) {
  const { t, language } = useLanguage();
  const isUser = message.role === 'user';
  const roleLabel = isUser ? t.chat.userRole : t.chat.assistantRole;
  const time = formatMessageTime(message.createdAt, language);

  return (
    <article className="flex gap-3">
      <span
        aria-hidden
        className={cn(
          'flex size-8 shrink-0 items-center justify-center rounded-full border',
          isUser ? 'bg-secondary text-secondary-foreground' : 'bg-primary/10 text-primary',
        )}
      >
        {isUser ? <UserRound className="size-4" /> : <Bot className="size-4" />}
      </span>

      <div className="min-w-0 flex-1">
        <header className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{roleLabel}</span>
          {time ? (
            <time dateTime={message.createdAt}>{time}</time>
          ) : null}
          {isUser ? null : (
            <span className="rounded-full border bg-muted/40 px-2 py-0.5 text-[10px]">
              {t.chat.previewReplyNotice}
            </span>
          )}
        </header>

        {isUser ? (
          <p className="mt-2 inline-block max-w-full whitespace-pre-wrap break-words rounded-xl bg-primary px-4 py-2.5 text-sm leading-6 text-primary-foreground">
            {message.content}
          </p>
        ) : (
          <div className="mt-2 min-w-0">
            <MarkdownMessage content={message.content} />
          </div>
        )}

        {!isUser && message.sources.length > 0 ? (
          <MessageSources sources={message.sources} />
        ) : null}

        <div
          role="group"
          aria-label={t.chat.actionsLabel}
          className="mt-1.5 flex flex-wrap items-center gap-1"
        >
          <CopyButton
            label={t.chat.copyMessage}
            getText={() => message.content}
            className="h-8 px-2"
          />
          {!isUser && canRegenerate ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onRegenerate}
              disabled={isGenerating}
              title={t.chat.regenerateUnavailable}
              className="h-8 px-2 text-xs text-muted-foreground"
            >
              <RefreshCw aria-hidden />
              {t.chat.regenerate}
            </Button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
