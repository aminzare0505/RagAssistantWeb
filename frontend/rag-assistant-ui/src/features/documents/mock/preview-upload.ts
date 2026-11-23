/**
 * This is not an upload. Nothing leaves the browser and no processing is
 * simulated; the timer only makes the "uploading (preview)" phase observable
 * so the progress UI can be exercised. Delete with the mock folder.
 */

export const MOCK_UPLOAD_DELAY_MS = 300;

export function schedulePreviewUpload(onComplete: () => void): () => void {
  const timer = window.setTimeout(onComplete, MOCK_UPLOAD_DELAY_MS);
  return () => {
    window.clearTimeout(timer);
  };
}
