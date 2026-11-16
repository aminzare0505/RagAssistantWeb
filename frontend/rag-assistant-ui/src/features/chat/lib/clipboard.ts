/**
 * Copies text through the async Clipboard API.
 *
 * Returns `false` instead of throwing when the API is unavailable (insecure
 * context, older browser, denied permission) so callers can show honest
 * feedback rather than a silent failure.
 */
export async function copyText(value: string): Promise<boolean> {
  const clipboard: Clipboard | undefined = navigator.clipboard;
  if (!clipboard || typeof clipboard.writeText !== 'function') {
    return false;
  }

  try {
    await clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
}
