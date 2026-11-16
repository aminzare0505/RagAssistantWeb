import { ImageOff } from 'lucide-react';
import ReactMarkdown, { type Components } from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';

import { CodeBlock } from './code-block';

/**
 * Markdown is rendered without raw HTML (`rehype-raw` is not installed) and
 * without remote images, so untrusted model output cannot inject markup or
 * leak requests. Only absolute http(s) links become anchors.
 */
const components: Components = {
  a({ href, children, title }) {
    if (typeof href !== 'string' || !/^https?:\/\//i.test(href)) {
      return <span>{children}</span>;
    }
    return (
      <a href={href} title={title} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  },
  img({ alt }) {
    return (
      <span className="inline-flex items-center gap-1 rounded-md border bg-muted px-2 py-0.5 align-middle text-xs text-muted-foreground">
        <ImageOff aria-hidden className="size-3.5" />
        {alt ?? ''}
      </span>
    );
  },
  pre({ children }) {
    return <CodeBlock>{children}</CodeBlock>;
  },
  h1({ children }) {
    return <h3>{children}</h3>;
  },
};

interface MarkdownMessageProps {
  content: string;
}

export function MarkdownMessage({ content }: MarkdownMessageProps) {
  return (
    <div className="chat-markdown text-sm leading-7">
      <ReactMarkdown rehypePlugins={[rehypeHighlight]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
