/**
 * View models for the chat UI.
 *
 * These mirror the backend wire DTOs (see src/api/types/chat.ts). Numeric
 * backend IDs are converted to strings for UI use. Nullable fields stay
 * nullable; the UI renders fallback text where needed.
 */

export type ChatRole = 'user' | 'assistant';

export interface ChatSource {
  id: string;
  documentName: string | null;
  page: number | null;
  score: number | null;
  snippet: string | null;
}

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
  sources: ChatSource[];
}

export interface ChatConversation {
  id: string;
  title: string | null;
  updatedAt: string;
  messages: ChatMessage[];
}
