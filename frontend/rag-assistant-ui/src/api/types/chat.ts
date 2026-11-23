/**
 * Backend-verified wire DTOs for the chat feature.
 *
 * Source: RagAssistantApi controllers (ChatController.cs) and
 * RagAssistant.Application.Models.Chat. Shown as source-verified only;
 * the API cannot start (JWT secret < 32 chars), so these are not
 * runtime-verified.
 */

export type MessageEnum = 0 | 1 | 2 | 3 | 4;

export const MESSAGE_TYPE: Record<string, MessageEnum> = {
  unknown: 0,
  user: 1,
  system: 2,
  assistant: 3,
  manager: 4,
} as const;

export interface ChatConversationDto {
  id: number;
  userId: number;
  title: string | null;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

export interface PagedResult<T> {
  items: readonly T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface ChatConversationDtoPagedResult {
  items: readonly ChatConversationDto[] | null;
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface ChatConversationDtoPagedResultApiResponse {
  isSuccess: boolean;
  value: ChatConversationDtoPagedResult | null;
  message: string | null;
  errors: readonly string[] | null;
  statusCode: number;
}

export interface ChatMessageDto {
  id: number;
  conversationId: number;
  role: MessageEnum;
  content: string;
  sequence: number;
  model: string | null;
  promptTokens: number | null;
  completionTokens: number | null;
  totalTokens: number | null;
  createdAt: string;
}

export interface ChatMessageSourceDto {
  id: number;
  messageId: number;
  documentId: number | null;
  chunkId: number | null;
  pageNumber: number | null;
  score: number | null;
}

export interface ChatMessageDetailsDto {
  message: ChatMessageDto;
  sources: readonly ChatMessageSourceDto[];
}

export interface ChatDetailsDto {
  conversation: ChatConversationDto;
  messages: readonly ChatMessageDetailsDto[];
  page: number;
  pageSize: number;
  totalMessages: number;
}

export interface ChatDetailsDtoApiResponse {
  isSuccess: boolean;
  value: ChatDetailsDto | null;
  message: string | null;
  errors: readonly string[] | null;
  statusCode: number;
}

export interface Conversation {
  messageType: MessageEnum;
  text: string;
  documentId: number | null;
}

export interface ConversationListApiResponse {
  isSuccess: boolean;
  value: readonly Conversation[] | null;
  message: string | null;
  errors: readonly string[] | null;
  statusCode: number;
}
