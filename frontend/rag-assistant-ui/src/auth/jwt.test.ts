import { describe, expect, it } from 'vitest';

import { createAccessToken, TEST_USER } from '@/test/auth';

import { decodeAccessToken } from './jwt';

const EMPTY_USER = { id: null, username: null, email: null };

describe('access token decoding', () => {
  it('reads the display claims from the payload', () => {
    expect(decodeAccessToken(createAccessToken())).toEqual(TEST_USER);
  });

  it('returns null claims for values that are missing or not strings', () => {
    expect(
      decodeAccessToken(
        createAccessToken({ UserId: 42, preferred_username: ['admin', 'other'], useremail: null }),
      ),
    ).toEqual({ id: null, username: 'admin', email: null });
  });

  it('returns an empty identity for an unreadable token', () => {
    for (const token of ['', 'not-a-token', 'header.payload', 'a.b.c', 'a.e30=.c']) {
      expect(decodeAccessToken(token)).toEqual(EMPTY_USER);
    }
  });
});
