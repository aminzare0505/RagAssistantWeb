/** Reads the optional live-region message passed through router navigation state. */
export function announcementFromLocationState(state: unknown): string {
  if (state && typeof state === 'object' && 'announcement' in state) {
    const value = (state as { announcement?: unknown }).announcement;
    return typeof value === 'string' ? value : '';
  }
  return '';
}
