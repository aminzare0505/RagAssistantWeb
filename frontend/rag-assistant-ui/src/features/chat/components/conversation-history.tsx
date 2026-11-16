import { MessageSquarePlus, Search, Trash2 } from 'lucide-react';
import { useId, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/i18n/use-language';
import { cn } from '@/lib/utils';

import { formatShortDate } from '../lib/format';
import type { ChatConversation } from '../types';

interface ConversationHistoryProps {
  conversations: ChatConversation[];
  activeId: string | null;
  search: string;
  onSearchChange: (value: string) => void;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  onDelete: (id: string) => void;
}

export function ConversationHistory({
  conversations,
  activeId,
  search,
  onSearchChange,
  onSelect,
  onNewChat,
  onDelete,
}: ConversationHistoryProps) {
  const { t, language } = useLanguage();
  const headingId = useId();
  const searchId = useId();
  const [pendingDelete, setPendingDelete] = useState<ChatConversation | null>(null);

  const isSearching = search.trim().length > 0;

  return (
    <div className="flex h-full min-h-0 flex-col p-3">
      <div className="flex items-center pe-10 lg:pe-0">
        <h2 id={headingId} className="text-sm font-semibold">
          {t.chat.historyTitle}
        </h2>
      </div>

      <Button type="button" size="sm" className="mt-3 w-full justify-start" onClick={onNewChat}>
        <MessageSquarePlus aria-hidden />
        {t.chat.newChat}
      </Button>

      <div className="relative mt-3">
        <label htmlFor={searchId} className="sr-only">
          {t.chat.searchLabel}
        </label>
        <Search
          aria-hidden
          className="pointer-events-none absolute start-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          id={searchId}
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={t.chat.searchPlaceholder}
          className="h-9 ps-8"
        />
      </div>

      {conversations.length === 0 ? (
        <div className="mt-3 rounded-lg border border-dashed p-3 text-center">
          <p className="text-sm font-medium">
            {isSearching ? t.chat.searchEmptyTitle : t.chat.noConversationsTitle}
          </p>
          <p className="mt-1 text-xs leading-6 text-muted-foreground">
            {isSearching ? t.chat.searchEmptyDescription : t.chat.noConversationsDescription}
          </p>
        </div>
      ) : (
        <ul className="mt-3 min-h-0 flex-1 space-y-1 overflow-y-auto pe-1" aria-labelledby={headingId}>
          {conversations.map((conversation) => {
            const isActive = conversation.id === activeId;
            return (
              <li key={conversation.id}>
                <div
                  className={cn(
                    'flex items-center gap-1 rounded-md border border-transparent',
                    isActive && 'border-border bg-secondary',
                  )}
                >
                  <button
                    type="button"
                    onClick={() => onSelect(conversation.id)}
                    aria-current={isActive ? 'true' : undefined}
                    className="min-w-0 flex-1 rounded-md px-2.5 py-2 text-start"
                  >
                    <span className="block truncate text-sm font-medium">
                      {conversation.title || t.chat.untitled}
                    </span>
                    <span className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                      <time dateTime={conversation.updatedAt}>
                        {formatShortDate(conversation.updatedAt, language)}
                      </time>
                    </span>
                  </button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`${t.chat.deleteConversation}: ${conversation.title || t.chat.untitled}`}
                    onClick={() => setPendingDelete(conversation)}
                    className="size-11 shrink-0 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 aria-hidden />
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Dialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPendingDelete(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.chat.deleteDialogTitle}</DialogTitle>
            <DialogDescription>{t.chat.deleteDialogDescription}</DialogDescription>
          </DialogHeader>
          {pendingDelete ? (
            <p className="mt-4 truncate rounded-md border bg-muted px-3 py-2 text-sm">
              {pendingDelete.title || t.chat.untitled}
            </p>
          ) : null}
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                {t.chat.cancel}
              </Button>
            </DialogClose>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                if (pendingDelete) {
                  onDelete(pendingDelete.id);
                }
                setPendingDelete(null);
              }}
            >
              {t.chat.deleteConfirm}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
