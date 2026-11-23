import { ApiError } from '@/api/api-error';
import { request } from '@/api/http-client';
import {
  type BooleanApiResponse,
  type CreateDocumentRequest,
  type DocumentDto,
  type DocumentDtoApiResponse,
  type DocumentDtoPagedResultApiResponse,
  type UpdateDocumentRequest,
} from '@/api/types/documents';

export async function listDocuments(
  search: string | null,
  page: number,
  pageSize: number,
): Promise<DocumentDtoPagedResultApiResponse['value']> {
  return request<DocumentDtoPagedResultApiResponse['value']>(
    `/api/documents?search=${encodeURIComponent(search ?? '')}&page=${page}&pageSize=${pageSize}`,
    { method: 'GET' },
  );
}

export async function getDocument(id: number): Promise<DocumentDto | null> {
  try {
    return await request<DocumentDtoApiResponse['value']>(
      `/api/documents/${id}`,
      { method: 'GET' },
    );
  } catch (error) {
    if (error instanceof ApiError && error.httpStatus === 404) {
      return null;
    }
    throw error;
  }
}

export async function createDocument(
  input: CreateDocumentRequest & { file: File },
): Promise<DocumentDtoApiResponse['value']> {
  const formData = new FormData();
  formData.append('File', input.file);
  formData.append('Type', String(input.type));
  if (input.fileName) {
    formData.append('FileName', input.fileName);
  }
  if (input.collectionName) {
    formData.append('CollectionName', input.collectionName);
  }
  if (input.sizeInBytes !== null && input.sizeInBytes !== undefined) {
    formData.append('SizeInBytes', String(input.sizeInBytes));
  }
  return request<DocumentDtoApiResponse['value']>(
    '/api/documents',
    { method: 'POST', body: formData },
  );
}

export async function updateDocument(
  id: number,
  input: UpdateDocumentRequest,
): Promise<DocumentDtoApiResponse['value']> {
  return request<DocumentDtoApiResponse['value']>(
    `/api/documents/${id}`,
    { method: 'PUT', body: input },
  );
}

export async function deleteDocument(id: number): Promise<BooleanApiResponse['value']> {
  return request<BooleanApiResponse['value']>(
    `/api/documents/${id}`,
    { method: 'DELETE' },
  );
}
