import { History, Info, MessageSquare } from 'lucide-react';
import { useState } from 'react';

import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useLanguage } from '@/i18n/use-language';

import { ChatComposer } from '../components/chat-composer';
import { ChatEmptyState } from '../components/chat-empty-state';
import { ChatMessageList } from '../components/chat-message-list';
import { ConversationHistory } from '../components/conversation-history';
import { useChatPreview } from '../hooks/use-chat-preview';

export function ChatPage() {
  const { t } = useLanguage();
  const chat = useChatPreview();
  const [isHistoryOpen, setHistoryOpen] = useState(false);
  const activeConversation = chat.activeConversation;

  return (
    <div className="flex h-[calc(100dvh-12rem)] min-h-[26rem] flex-col gap-3 lg:h-[calc(100dvh-11.5rem)] lg:gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight">{t.nav.chat}</h1>
            <span className="inline-flex items-center gap-1 rounded-full border border-warning/50 bg-warning/10 px-2.5 py-0.5 text-[11px] font-medium">
              <Info aria-hidden className="size-3" />
              {t.chat.previewBadge}
            </span>
          </div>
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
            conversations={chat.filteredConversations}
            activeId={activeConversation?.id ?? null}
            search={chat.search}
            onSearchChange={chat.setSearch}
            onSelect={chat.selectConversation}
            onNewChat={chat.startNewChat}
            onDelete={chat.deleteConversation}
          />
        </aside>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="flex items-center justify-between gap-3 border-b px-4 py-2.5">
            <h2 className="truncate text-sm font-medium">
              {activeConversation?.title || t.chat.untitled}
            </h2>
            <span className="hidden shrink-0 text-[11px] text-muted-foreground sm:inline">
              {t.chat.previewReplyNotice}
            </span>
          </div>

          {!activeConversation ? (
            <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
              <EmptyState
                icon={MessageSquare}
                title={t.chat.noConversationsTitle}
                description={t.chat.noConversationsDescription}
                action={
                  <Button type="button" size="sm" onClick={chat.startNewChat}>
                    {t.chat.newChat}
                  </Button>
                }
              />
            </div>
          ) : activeConversation.messages.length === 0 ? (
            <div className="min-h-0 flex-1 overflow-y-auto">
              <ChatEmptyState onSuggestion={chat.sendMessage} />
            </div>
          ) : (
            <ChatMessageList
              messages={activeConversation.messages}
              isGenerating={chat.isGenerating}
              onRegenerate={chat.regenerate}
            />
          )}

          <ChatComposer
            isGenerating={chat.isGenerating}
            onSend={chat.sendMessage}
            onStop={chat.stopGeneration}
          />
        </div>
      </Card>

      <Dialog open={isHistoryOpen} onOpenChange={setHistoryOpen}>
        <DialogContent side="start" className="flex flex-col" aria-describedby={undefined}>
          <DialogTitle className="sr-only">{t.chat.historyTitle}</DialogTitle>
          <ConversationHistory
            conversations={chat.filteredConversations}
            activeId={activeConversation?.id ?? null}
            search={chat.search}
            onSearchChange={chat.setSearch}
            onSelect={(id) => {
              chat.selectConversation(id);
              setHistoryOpen(false);
            }}
            onNewChat={() => {
              chat.startNewChat();
              setHistoryOpen(false);
            }}
            onDelete={chat.deleteConversation}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
