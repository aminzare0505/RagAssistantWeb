import '@testing-library/jest-dom/vitest';
import { configure, cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

import { clearTokens } from '@/auth/token-store';

// Lazy routes and the growing suite make the 1000 ms default flaky under load.
configure({ asyncUtilTimeout: 3000 });

// jsdom lacks these browser APIs that Radix primitives query.
class ResizeObserverStub {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  value: ResizeObserverStub,
});

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string): MediaQueryList => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }),
});

Object.defineProperty(Element.prototype, 'hasPointerCapture', {
  writable: true,
  value: () => false,
});
Object.defineProperty(Element.prototype, 'releasePointerCapture', {
  writable: true,
  value: () => {},
});
Object.defineProperty(Element.prototype, 'setPointerCapture', {
  writable: true,
  value: () => {},
});
Object.defineProperty(Element.prototype, 'scrollIntoView', {
  writable: true,
  value: () => {},
});

afterEach(() => {
  cleanup();
  clearTokens();
  sessionStorage.clear();
  localStorage.clear();
  vi.unstubAllGlobals();
  document.documentElement.classList.remove('dark');
  document.documentElement.lang = 'fa';
  document.documentElement.dir = 'rtl';
});
