type SessionExpiredListener = () => void;

const listeners = new Set<SessionExpiredListener>();

export function subscribeToSessionExpired(listener: SessionExpiredListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function emitSessionExpired(): void {
  for (const listener of [...listeners]) {
    listener();
  }
}
