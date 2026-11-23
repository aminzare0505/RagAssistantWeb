import { screen } from '@testing-library/react';
import { describe, it, vi } from 'vitest';

import { fa } from '@/i18n/fa';
import { renderApp } from '@/test/render-app';

describe('debug', () => {
  it('renders documents page heading', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 500 })));
    renderApp({ initialPath: '/documents' });
    try {
      const heading = await screen.findByRole('heading', { level: 1, name: fa.nav.documents }, { timeout: 5000 });
      console.log('FOUND:', heading.textContent);
    } catch (e) {
      console.log('ERROR:', (e as Error).message);
      console.log('BODY:', document.body.innerHTML.substring(0, 2000));
    }
  });
});
