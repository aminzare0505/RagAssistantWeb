import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { LanguageProvider } from '@/i18n/language-provider';

import { MarkdownMessage } from './markdown-message';

function renderMarkdown(content: string) {
  return render(
    <LanguageProvider>
      <MarkdownMessage content={content} />
    </LanguageProvider>,
  );
}

describe('markdown rendering', () => {
  it('renders formatted text and lists', () => {
    renderMarkdown('**bold**\n\n- first\n- second');

    expect(screen.getByText('bold').tagName).toBe('STRONG');
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });

  it('turns only absolute http(s) links into anchors', () => {
    const { container } = renderMarkdown(
      '[external](https://example.com/docs) [relative](/settings) [unsafe](javascript:alert(1))',
    );

    const links = container.querySelectorAll('a');
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAttribute('href', 'https://example.com/docs');
    expect(links[0]).toHaveAttribute('target', '_blank');
    expect(links[0]).toHaveAttribute('rel', 'noopener noreferrer');
    expect(screen.getByText('relative')).not.toHaveAttribute('href');
    expect(screen.getByText('unsafe')).not.toHaveAttribute('href');
  });

  it('never renders images or raw HTML', () => {
    const { container } = renderMarkdown(
      '![remote](https://example.com/tracker.png)\n\n<img src=x onerror=alert(1)>',
    );

    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('[onerror]')).toBeNull();
    expect(screen.getByText('remote')).toBeInTheDocument();
  });

  it('renders fenced code with a language label and copy control', () => {
    const { container } = renderMarkdown('```ts\nconst answer = 42;\n```');

    expect(container.querySelector('.chat-code pre')?.textContent).toContain(
      'const answer = 42;',
    );
    expect(container.querySelector('.hljs-keyword')?.textContent).toBe('const');
    expect(screen.getByText('ts')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'کپی کد' })).toBeInTheDocument();
  });
});
