import { Paperclip, SendHorizontal, Square } from 'lucide-react';
import { useId, useRef, useState, type KeyboardEvent } from 'react';

import { Button } from '@/components/ui/button';
import { useLanguage } from '@/i18n/use-language';

interface ChatComposerProps {
  isGenerating: boolean;
  onSend: (content: string) => void;
  onStop: () => void;
}

export function ChatComposer({ isGenerating, onSend, onStop }: ChatComposerProps) {
  const { t } = useLanguage();
  const [value, setValue] = useState('');
  const inputId = useId();
  const attachHintId = useId();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const canSend = value.trim().length > 0 && !isGenerating;

  const submit = () => {
    const content = value.trim();
    if (!content || isGenerating) {
      return;
    }
    onSend(content);
    setValue('');
    textareaRef.current?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      submit();
    }
  };

  return (
    <form
      className="border-t p-3 sm:p-4"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <label htmlFor={inputId} className="sr-only">
        {t.chat.composerLabel}
      </label>
      <div className="rounded-xl border bg-background focus-within:ring-2 focus-within:ring-ring/40">
        <textarea
          ref={textareaRef}
          id={inputId}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder={t.chat.composerPlaceholder}
          className="max-h-40 min-h-11 w-full resize-none bg-transparent px-3 py-2.5 text-sm leading-6 outline-none placeholder:text-muted-foreground"
        />
        <div className="flex items-center justify-between gap-2 px-2 pb-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled
            aria-label={t.chat.attach}
            aria-describedby={attachHintId}
            title={t.chat.attachUnavailable}
            className="size-9 text-muted-foreground"
          >
            <Paperclip aria-hidden />
          </Button>
          <span id={attachHintId} className="sr-only">
            {t.chat.attachUnavailable}
          </span>

          <div className="flex items-center gap-2">
            <span className="hidden text-[11px] text-muted-foreground md:inline">
              {t.chat.enterHint}
            </span>
            {isGenerating ? (
              <Button type="button" variant="outline" size="sm" onClick={onStop}>
                <Square aria-hidden />
                {t.chat.stop}
              </Button>
            ) : (
              <Button type="submit" size="sm" disabled={!canSend}>
                <SendHorizontal aria-hidden />
                {t.chat.send}
              </Button>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
