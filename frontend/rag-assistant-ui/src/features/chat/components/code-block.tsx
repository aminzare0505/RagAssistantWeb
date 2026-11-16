import { isValidElement, useRef, type ComponentProps, type ReactNode } from 'react';

import { useLanguage } from '@/i18n/use-language';

import { CopyButton } from './copy-button';

function detectLanguage(children: ReactNode): string | null {
  if (!isValidElement<{ className?: string }>(children)) {
    return null;
  }
  const match = children.props.className?.match(/language-([\w+#-]+)/);
  return match?.[1] ?? null;
}

/** Fenced code block with a language label and copy control. */
export function CodeBlock({ children }: ComponentProps<'pre'>) {
  const { t } = useLanguage();
  const preRef = useRef<HTMLPreElement>(null);
  const language = detectLanguage(children);

  return (
    <div className="chat-code mt-3 overflow-hidden rounded-lg border bg-muted/30" dir="ltr">
      <div className="flex items-center justify-between gap-2 border-b bg-muted/40 px-2 py-0.5">
        <span className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
          {language ?? 'code'}
        </span>
        <CopyButton
          label={t.chat.copyCode}
          getText={() => preRef.current?.textContent ?? ''}
          className="h-8 px-2"
        />
      </div>
      <pre
        ref={preRef}
        dir="ltr"
        className="max-h-80 overflow-auto p-3 text-start font-mono text-xs leading-6"
      >
        {children}
      </pre>
    </div>
  );
}
