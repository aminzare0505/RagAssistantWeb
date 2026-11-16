export function safeReturnTo(value: string | null): string | null {
  if (!value) {
    return null;
  }
  if (!value.startsWith('/') || value.startsWith('//')) {
    return null;
  }
  if (value === '/login' || value.startsWith('/login?') || value.startsWith('/login#')) {
    return null;
  }
  if (value.includes('\\')) {
    return null;
  }

  for (const character of value) {
    const code = character.codePointAt(0) ?? 0;
    if (code < 0x20 || code === 0x7f) {
      return null;
    }
  }

  return value;
}
