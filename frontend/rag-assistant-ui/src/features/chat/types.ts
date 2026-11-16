/**
 * Preview-only view models for the chat UI.
 *
 * These are NOT backend wire DTOs. The backend chat contract is blocked
 * (`ChatController` is uncommitted and unverified), so nothing here maps to an
 * endpoint. Replace this module with API-backed types when a contract exists.
 */

export type ChatRole = 'user' | 'assistant';

export interface ChatSource {
  id: string;
  documentName: string;
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
  title: string;
  updatedAt: string;
  messages: ChatMessage[];
}
