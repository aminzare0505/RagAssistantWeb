import { describe, expect, it } from 'vitest';

import {
  formatBytes,
  formatDocumentDate,
  formatDocumentDateTime,
  formatNumber,
  truncateMiddle,
} from './format';

describe('formatBytes', () => {
  it('formats plain bytes without decimals', () => {
    expect(formatBytes(0, 'en')).toBe('0 B');
    expect(formatBytes(512, 'en')).toBe('512 B');
  });

  it('uses binary units with one decimal', () => {
    expect(formatBytes(1536, 'en')).toBe('1.5 KB');
    expect(formatBytes(5 * 1024 * 1024, 'en')).toBe('5 MB');
  });

  it('localizes digits for Persian', () => {
    expect(formatBytes(1024, 'fa')).toContain('۱');
    expect(formatBytes(1024, 'fa')).toContain('KB');
  });

  it('returns an empty string for invalid values', () => {
    expect(formatBytes(-1, 'en')).toBe('');
    expect(formatBytes(Number.NaN, 'en')).toBe('');
  });
});

describe('date formatting', () => {
  it('formats a valid timestamp', () => {
    expect(formatDocumentDate('2026-11-16T12:00:00.000Z', 'en')).toContain('2026');
    expect(formatDocumentDateTime('2026-11-16T12:00:00.000Z', 'en')).toContain('2026');
  });

  it('returns an empty string for an unparseable timestamp', () => {
    expect(formatDocumentDate('not-a-date', 'en')).toBe('');
    expect(formatDocumentDateTime('not-a-date', 'en')).toBe('');
  });
});

describe('formatNumber', () => {
  it('uses Persian digits for the Persian locale', () => {
    expect(formatNumber(12, 'fa')).toBe('۱۲');
    expect(formatNumber(12, 'en')).toBe('12');
  });
});

describe('truncateMiddle', () => {
  it('leaves short names untouched', () => {
    expect(truncateMiddle('short.pdf', 44)).toBe('short.pdf');
  });

  it('keeps the extension and stays within the limit', () => {
    const name = 'rag-assistant-architecture-and-deployment-runbook-2026-final.pdf';
    const truncated = truncateMiddle(name, 44);

    expect(truncated.endsWith('.pdf')).toBe(true);
    expect(truncated).toContain('…');
    expect(truncated.length).toBeLessThanOrEqual(44);
  });

  it('handles tiny budgets without throwing', () => {
    expect(truncateMiddle('report.pdf', 4)).toBe('repo');
    expect(truncateMiddle('report.pdf', 0)).toBe('');
  });
});
