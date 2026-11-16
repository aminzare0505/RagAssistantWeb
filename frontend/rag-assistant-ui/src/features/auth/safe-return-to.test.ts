import { describe, expect, it } from 'vitest';

import { safeReturnTo } from './safe-return-to';

describe('safeReturnTo', () => {
  it('accepts an in-app path', () => {
    expect(safeReturnTo('/settings?tab=profile')).toBe('/settings?tab=profile');
  });

  it('rejects missing, relative, and external targets', () => {
    for (const value of [null, '', 'settings', '//evil.example', 'https://evil.example']) {
      expect(safeReturnTo(value)).toBeNull();
    }
  });

  it('rejects backslashes and control characters', () => {
    expect(safeReturnTo('/\\evil.example')).toBeNull();
    expect(safeReturnTo('/path\nnext')).toBeNull();
    expect(safeReturnTo('/path\u0000next')).toBeNull();
  });

  it('rejects the login route to avoid a redirect loop', () => {
    expect(safeReturnTo('/login')).toBeNull();
    expect(safeReturnTo('/login?returnTo=%2Fsettings')).toBeNull();
  });
});
