import { describe, expect, it } from 'vitest';

import { fa } from '@/i18n/fa';

import { DEFAULT_AI_DRAFT, DEFAULT_RETRIEVAL_DRAFT } from './settings-defaults';
import {
  createAiSchema,
  createRetrievalSchema,
  toAiFormValues,
  toRetrievalFormValues,
} from './settings-schema';

const aiMessages = fa.settings.ai.validation;
const retrievalMessages = fa.settings.retrieval.validation;

const aiSchema = createAiSchema(aiMessages);
const retrievalSchema = createRetrievalSchema(retrievalMessages);

function issueFor(
  result:
    | { success: true; data: unknown }
    | { success: false; error: { issues: Array<{ path: PropertyKey[]; message: string }> } },
  field: string,
): string | undefined {
  if (result.success) {
    return undefined;
  }
  return result.error.issues.find((issue) => issue.path[0] === field)?.message;
}

describe('settings draft schemas', () => {
  it('accepts the source-verified defaults', () => {
    expect(aiSchema.safeParse(toAiFormValues(DEFAULT_AI_DRAFT)).success).toBe(true);
    expect(
      retrievalSchema.safeParse(toRetrievalFormValues(DEFAULT_RETRIEVAL_DRAFT)).success,
    ).toBe(true);
  });

  it('requires a model name and trims it', () => {
    expect(issueFor(aiSchema.safeParse({ model: '  ', timeoutSeconds: '10' }), 'model')).toBe(
      aiMessages.modelRequired,
    );

    const parsed = aiSchema.parse({ model: ' llama3 ', timeoutSeconds: '10' });
    expect(parsed.model).toBe('llama3');
  });

  it('limits the model name to 120 characters', () => {
    expect(
      issueFor(
        aiSchema.safeParse({ model: 'x'.repeat(121), timeoutSeconds: '10' }),
        'model',
      ),
    ).toBe(aiMessages.modelLength);
  });

  it('keeps the timeout between 1 and 600 whole seconds', () => {
    for (const timeoutSeconds of ['0', '601', '10.5', 'soon']) {
      expect(
        issueFor(aiSchema.safeParse({ model: 'llama3', timeoutSeconds }), 'timeoutSeconds'),
      ).toBe(aiMessages.timeoutInvalid);
    }

    expect(aiSchema.safeParse({ model: 'llama3', timeoutSeconds: '600' }).success).toBe(true);
  });

  it('keeps the chunk size between 50 and 4000 tokens', () => {
    for (const chunkSize of ['49', '4001', 'big']) {
      expect(
        issueFor(
          retrievalSchema.safeParse({ chunkSize, overlapTokens: '10', topK: '5' }),
          'chunkSize',
        ),
      ).toBe(retrievalMessages.chunkSizeInvalid);
    }

    expect(
      retrievalSchema.safeParse({ chunkSize: '50', overlapTokens: '49', topK: '5' }).success,
    ).toBe(true);
  });

  it('requires the overlap to be smaller than the chunk size', () => {
    expect(
      issueFor(
        retrievalSchema.safeParse({ chunkSize: '300', overlapTokens: '300', topK: '5' }),
        'overlapTokens',
      ),
    ).toBe(retrievalMessages.overlapInvalid);

    expect(
      retrievalSchema.safeParse({ chunkSize: '300', overlapTokens: '299', topK: '5' }).success,
    ).toBe(true);
  });

  it('rejects a fractional overlap', () => {
    expect(
      issueFor(
        retrievalSchema.safeParse({ chunkSize: '300', overlapTokens: '5.5', topK: '5' }),
        'overlapTokens',
      ),
    ).toBe(retrievalMessages.overlapInvalid);
  });

  it('keeps Top-K between 1 and 50', () => {
    for (const topK of ['0', '51', 'five']) {
      expect(
        issueFor(
          retrievalSchema.safeParse({ chunkSize: '300', overlapTokens: '50', topK }),
          'topK',
        ),
      ).toBe(retrievalMessages.topKInvalid);
    }

    expect(
      retrievalSchema.safeParse({ chunkSize: '300', overlapTokens: '50', topK: '50' }).success,
    ).toBe(true);
  });
});
