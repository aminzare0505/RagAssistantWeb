import type { DocumentRecord } from '../types';

/**
 * Mock documents for UI development only. Imported exclusively by the
 * documents preview store and never sent to or received from the backend.
 * Delete this folder when a verified documents contract exists.
 */

export function createMockDocuments(): DocumentRecord[] {
  return [
    {
      id: 'doc-01',
      fileName: 'راهنمای استقرار.pdf',
      fileType: 'pdf',
      sizeBytes: 2_412_345,
      uploadedAt: '2026-10-14T08:20:00.000Z',
      status: 'indexed',
      progress: null,
    },
    {
      id: 'doc-02',
      fileName: 'security-policy.pdf',
      fileType: 'pdf',
      sizeBytes: 845_120,
      uploadedAt: '2026-10-18T11:05:00.000Z',
      status: 'indexed',
      progress: null,
    },
    {
      id: 'doc-03',
      fileName: 'API integration notes.pdf',
      fileType: 'pdf',
      sizeBytes: 512_900,
      uploadedAt: '2026-10-21T14:42:00.000Z',
      status: 'failed',
      progress: null,
    },
    {
      id: 'doc-04',
      fileName: 'rag-assistant-architecture-and-deployment-runbook-2026-final.pdf',
      fileType: 'pdf',
      sizeBytes: 9_331_456,
      uploadedAt: '2026-10-24T09:15:00.000Z',
      status: 'indexed',
      progress: null,
    },
    {
      id: 'doc-05',
      fileName: 'گزارش عملکرد سه‌ماهه.pdf',
      fileType: 'pdf',
      sizeBytes: 1_204_224,
      uploadedAt: '2026-10-28T16:30:00.000Z',
      status: 'processing',
      progress: null,
    },
    {
      id: 'doc-06',
      fileName: 'data-retention-guidelines.pdf',
      fileType: 'pdf',
      sizeBytes: 2_973_696,
      uploadedAt: '2026-11-02T07:55:00.000Z',
      status: 'chunking',
      progress: null,
    },
    {
      id: 'doc-07',
      fileName: 'training-manual-v3.pdf',
      fileType: 'pdf',
      sizeBytes: 4_612_096,
      uploadedAt: '2026-11-06T13:10:00.000Z',
      status: 'embedding',
      progress: null,
    },
    {
      id: 'doc-08',
      fileName: 'صورت‌جلسه جلسه طراحی.pdf',
      fileType: 'pdf',
      sizeBytes: 184_320,
      uploadedAt: '2026-11-09T10:40:00.000Z',
      status: 'indexed',
      progress: null,
    },
    {
      id: 'doc-09',
      fileName: 'incident-response-playbook.pdf',
      fileType: 'pdf',
      sizeBytes: 3_145_728,
      uploadedAt: '2026-11-12T15:25:00.000Z',
      status: 'uploaded',
      progress: null,
    },
    {
      id: 'doc-10',
      fileName: 'product-roadmap-q1.pdf',
      fileType: 'pdf',
      sizeBytes: 1_887_436,
      uploadedAt: '2026-11-14T08:05:00.000Z',
      status: 'uploaded',
      progress: null,
    },
    {
      id: 'doc-11',
      fileName: 'نصب و راه‌اندازی.pdf',
      fileType: 'pdf',
      sizeBytes: 6_291_456,
      uploadedAt: '2026-11-16T12:00:00.000Z',
      status: 'processing',
      progress: null,
    },
  ];
}
