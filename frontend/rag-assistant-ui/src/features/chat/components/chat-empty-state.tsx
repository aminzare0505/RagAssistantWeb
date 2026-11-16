import { Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useLanguage } from '@/i18n/use-language';

interface ChatEmptyStateProps {
  onSuggestion: (text: string) => void;
}

export function ChatEmptyState({ onSuggestion }: ChatEmptyStateProps) {
  const { t } = useLanguage();

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center px-6 py-10 text-center sm:py-14">
      <span className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Sparkles aria-hidden className="size-6" />
      </span>
      <h2 className="mt-4 text-lg font-semibold">{t.chat.emptyTitle}</h2>
      <p className="mt-2 max-w-md text-sm leading-7 text-muted-foreground">
        {t.chat.emptyDescription}
      </p>
      <ul className="mt-6 flex flex-wrap justify-center gap-2">
        {t.chat.emptySuggestions.map((suggestion) => (
          <li key={suggestion}>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onSuggestion(suggestion)}
            >
              {suggestion}
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
