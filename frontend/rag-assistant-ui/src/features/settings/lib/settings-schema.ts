import { z } from 'zod';

import type { AiDraft, RetrievalDraft } from '../types';

/**
 * Preview-only validation for settings drafts. Bounds are UX guidance because
 * the backend documents none; nothing here is sent anywhere.
 */
export interface AiValidationMessages {
  modelRequired: string;
  modelLength: string;
  timeoutInvalid: string;
}

export interface RetrievalValidationMessages {
  chunkSizeInvalid: string;
  overlapInvalid: string;
  topKInvalid: string;
}

function isWholeNumberInRange(value: string, min: number, max: number): boolean {
  if (!/^\d+$/.test(value)) {
    return false;
  }
  const parsed = Number(value);
  return parsed >= min && parsed <= max;
}

export function createAiSchema(messages: AiValidationMessages) {
  return z.object({
    model: z.string().trim().min(1, messages.modelRequired).max(120, messages.modelLength),
    timeoutSeconds: z
      .string()
      .trim()
      .refine((value) => isWholeNumberInRange(value, 1, 600), messages.timeoutInvalid),
  });
}

export type AiFormValues = z.infer<ReturnType<typeof createAiSchema>>;

export function createRetrievalSchema(messages: RetrievalValidationMessages) {
  return z
    .object({
      chunkSize: z
        .string()
        .trim()
        .refine((value) => isWholeNumberInRange(value, 50, 4000), messages.chunkSizeInvalid),
      overlapTokens: z.string().trim().refine((value) => /^\d+$/.test(value), messages.overlapInvalid),
      topK: z
        .string()
        .trim()
        .refine((value) => isWholeNumberInRange(value, 1, 50), messages.topKInvalid),
    })
    .refine(
      (values) => {
        if (!isWholeNumberInRange(values.chunkSize, 50, 4000)) {
          return true;
        }
        const overlap = Number(values.overlapTokens);
        return (
          /^\d+$/.test(values.overlapTokens) &&
          overlap >= 0 &&
          overlap < Number(values.chunkSize)
        );
      },
      { message: messages.overlapInvalid, path: ['overlapTokens'] },
    );
}

export type RetrievalFormValues = z.infer<ReturnType<typeof createRetrievalSchema>>;

export function toAiFormValues(draft: AiDraft): AiFormValues {
  return { model: draft.model, timeoutSeconds: String(draft.timeoutSeconds) };
}

export function toRetrievalFormValues(draft: RetrievalDraft): RetrievalFormValues {
  return {
    chunkSize: String(draft.chunkSize),
    overlapTokens: String(draft.overlapTokens),
    topK: String(draft.topK),
  };
}
