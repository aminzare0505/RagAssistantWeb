import type { AiDraft, RetrievalDraft } from '../types';

/**
 * Defaults copied from verified backend sources, not read over the wire:
 *
 * - Ollama model and timeout: `RagAssistant.Api/appsettings.json` (`Ollama`).
 * - Chunk defaults: `RagAssistant.Infrastructure/Chunking/SemanticKernelTextChunker.cs`
 *   constructor (`maxTokens = 300`, `overlapTokens = 50`).
 * - Top-K: hardcoded `5` in `RagAssistant.Application/Services/RagService.cs` and
 *   `QdrantDataSource.cs`.
 *
 * The RAG services are commented out in `DependencyInjection.cs`, so these are
 * not live runtime configuration. Replace this module when a settings contract exists.
 */
export const SETTINGS_PROVIDER = 'Ollama';

export const DEFAULT_AI_DRAFT: AiDraft = {
  model: 'qwen2.5-coder:7b',
  timeoutSeconds: 10,
};

export const DEFAULT_RETRIEVAL_DRAFT: RetrievalDraft = {
  chunkSize: 300,
  overlapTokens: 50,
  topK: 5,
};
