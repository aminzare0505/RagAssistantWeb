import { ChevronDown, Layers } from 'lucide-react';
import { useState } from 'react';

import { useLanguage } from '@/i18n/use-language';
import { cn } from '@/lib/utils';

import { formatNumber, formatScore } from '../lib/format';
import type { ChatSource } from '../types';

interface MessageSourcesProps {
  sources: ChatSource[];
}

export function MessageSources({ sources }: MessageSourcesProps) {
  const { t, language } = useLanguage();
  const [isOpen, setOpen] = useState(false);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);

  const toggleSource = (id: string) => {
    setExpandedIds((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    );
  };

  return (
    <div className="mt-3 rounded-lg border bg-muted/20">
      <button
        type="button"
        onClick={() => setOpen((open) => !open)}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-start text-xs font-medium"
      >
        <span className="inline-flex min-w-0 items-center gap-2">
          <Layers aria-hidden className="size-4 shrink-0 text-muted-foreground" />
          <span className="truncate">{t.chat.sourcesTitle}</span>
          <span className="rounded-full border bg-background px-2 py-0.5 text-[11px] font-normal text-muted-foreground">
            {formatNumber(sources.length, language)}
          </span>
        </span>
        <ChevronDown
          aria-hidden
          className={cn(
            'size-4 shrink-0 text-muted-foreground transition-transform',
            isOpen && 'rotate-180',
          )}
        />
      </button>

      {isOpen ? (
        <ul className="space-y-1.5 border-t p-2">
          {sources.map((source) => {
            const isExpanded = expandedIds.includes(source.id);
            return (
              <li key={source.id} className="rounded-md border bg-background/60">
                <button
                  type="button"
                  onClick={() => toggleSource(source.id)}
                  aria-expanded={isExpanded}
                  aria-label={`${
                    isExpanded ? t.chat.collapseSource : t.chat.expandSource
                  }: ${source.documentName}`}
                  className="flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-start text-xs"
                >
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{source.documentName}</span>
                    <span className="mt-0.5 flex flex-wrap gap-x-3 text-muted-foreground">
                      {source.page !== null ? (
                        <span>
                          {t.chat.sourcePage}: {formatNumber(source.page, language)}
                        </span>
                      ) : null}
                      {source.score !== null ? (
                        <span>
                          {t.chat.sourceScore}: {formatScore(source.score, language)}
                        </span>
                      ) : null}
                    </span>
                  </span>
                  <ChevronDown
                    aria-hidden
                    className={cn(
                      'size-4 shrink-0 text-muted-foreground transition-transform',
                      isExpanded && 'rotate-180',
                    )}
                  />
                </button>
                {isExpanded && source.snippet ? (
                  <p className="border-t px-3 py-2 text-xs leading-6 text-muted-foreground">
                    <span className="sr-only">{t.chat.sourceSnippet}: </span>
                    {source.snippet}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
