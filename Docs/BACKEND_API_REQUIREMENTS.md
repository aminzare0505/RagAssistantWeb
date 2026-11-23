# Backend API Requirements from the Frontend

Frontend-only inventory, based on `frontend/rag-assistant-ui/src` and `Docs/Ai/frontend-api-integration.md`. Endpoints marked **Suggested** are proposals for missing integrations, not verified backend contracts. **TBD** means the UI does not establish the contract. Current live API calls are authentication only; all other listed features are UI previews backed by mock data.

## Authentication

| Method and endpoint | Purpose | Request | Response | Access |
|---|---|---|---|---|
| `POST /api/auth/login` | Sign in | JSON `{ username: string, password: string }` | Success envelope with `value: JwtTokenResult`; invalid credentials currently documented as HTTP 204/no body | Anonymous |
| `POST /api/auth/refresh` | Restore/rotate session | JSON `{ refreshToken: string }` | Success envelope with `value: JwtTokenResult` | Anonymous; refresh token required |
| `POST /api/auth/logout` | Revoke current refresh-token session | JSON `{ refreshToken: string }` | Success envelope with `value: null` | Anonymous; refresh token required |

`JwtTokenResult`: `{ accessToken: string, refreshToken: string, accessTokenExpiresAtUtc: string, refreshTokenExpiresAtUtc: string, expiresInSeconds: number, tokenType: string, refreshTokenFamilyId: string }`. Timestamps are UTC ISO 8601 per the documented frontend contract. Login/refresh/logout are implemented in the frontend. `POST /api/auth/logout-all` and `POST /api/auth/change-password` are documented backend endpoints but have no current frontend UI; they are not required by the current interface.

## Chat — mocked; no frontend API calls

| Method and suggested endpoint | Purpose | Request | Response | Access |
|---|---|---|---|---|
| `GET /api/conversations` **Suggested** | Populate/search conversation history | Query `q: string` (**TBD:** server search vs client search; paging) | `ConversationSummary[]` (**TBD:** pagination) | **TBD** |
| `POST /api/conversations` **Suggested** | Create a new conversation | Body **TBD**; UI can start an empty conversation | `Conversation` | **TBD** |
| `GET /api/conversations/{conversationId}` **Suggested** | Load selected conversation/messages | Path `conversationId: string` | `Conversation` | **TBD** |
| `DELETE /api/conversations/{conversationId}` **Suggested** | Delete conversation | Path `conversationId: string` | Success envelope, `value: null` | **TBD** |
| `POST /api/conversations/{conversationId}/messages` **Suggested** | Send user message and receive answer with sources | Body `{ content: string }`; **TBD:** language, attachments, generation options | **TBD:** `ChatMessage` or streaming protocol; answer must support source citations as displayed | **TBD** |
| `POST /api/conversations/{conversationId}/messages/{messageId}/regenerate` **Suggested** | Regenerate latest assistant answer | Path IDs; body **TBD** | **TBD:** replacement `ChatMessage` or streaming protocol | **TBD** |

Stop-generation/cancellation is exposed in the UI. Whether HTTP abort is sufficient or a server cancellation endpoint is required is **TBD**. Mock message/source fields are described under Shared DTOs; they are not established wire DTOs.

## Documents — mocked; no frontend API calls

| Method and suggested endpoint | Purpose | Request | Response | Access |
|---|---|---|---|---|
| `GET /api/documents` **Suggested** | List/search/filter/sort/page documents | Query `{ q?: string, status?: string, type?: string, sort?: string, page?: number, size?: number }`; UI sort values: `name-asc`, `name-desc`, `date-asc`, `date-desc`, `size-asc`, `size-desc`; status values: `uploaded`, `processing`, `chunking`, `embedding`, `indexed`, `failed`; type: `pdf` | `{ items: DocumentRecord[], page: number, totalPages: number, total: number }` | **TBD**; authenticated UI route, backend permission **TBD** |
| `POST /api/documents` **Suggested** | Upload PDF for processing | Multipart file; exact field name, limits, duplicate policy **TBD** | `DocumentRecord` or upload job; exact response **TBD** | **TBD** |
| `GET /api/documents/{documentId}` **Suggested** | Load details and processing status | Path `documentId: string` | `DocumentRecord` | **TBD** |
| `DELETE /api/documents/{documentId}` **Suggested** | Delete document | Path `documentId: string` | Success envelope, `value: null` | **TBD**; permission **TBD** |
| `POST /api/documents/{documentId}/retry` **Suggested** | Retry failed processing (button currently disabled) | Path `documentId: string`; body **TBD** | Updated job/document state **TBD** | **TBD** |

`DocumentRecord` needs `id`, `fileName`, `fileType`, `sizeBytes`, `uploadedAt`, `status`, and `progress: DocumentProgress | null`; `DocumentProgress` has `phase` and `percent: number`. Whether progress is polled, pushed, or included only in detail/list responses is **TBD**. Frontend preview accepts PDF and uses a 10 MiB UX limit; this is not a backend limit or contract.

## Data sources — mocked; no frontend API calls

| Method and suggested endpoint | Purpose | Request | Response | Access |
|---|---|---|---|---|
| `GET /api/data-sources` **Suggested** | List configured sources | Query/paging **TBD** | `DataSourceRecord[]` or paged response **TBD** | **TBD** |
| `POST /api/data-sources` **Suggested** | Create source | Body `{ name: string, type: string, connection: DataSourceConnection, credential: string }`; exact credential representation and source-type registry **TBD** | `DataSourceRecord` without secret | **TBD** |
| `GET /api/data-sources/{sourceId}` **Suggested** | Load source details | Path `sourceId: string` | `DataSourceRecord` | **TBD** |
| `PUT /api/data-sources/{sourceId}` **Suggested** | Update source | Path ID; body as create, credential optional/unchanged semantics **TBD** | `DataSourceRecord` without secret | **TBD** |
| `DELETE /api/data-sources/{sourceId}` **Suggested** | Delete source | Path `sourceId: string` | Success envelope, `value: null` | **TBD** |
| `POST /api/data-sources/{sourceId}/test-connection` **Suggested** | Test configured connection (button currently disabled) | Path `sourceId: string`; body **TBD** | `{ success: boolean, message?: string }` is **TBD** | **TBD** |
| `GET /api/data-sources/{sourceId}/schema` **Suggested** | Browse schema | Path `sourceId: string` | `SchemaDatabase[]` or `null`; exact nesting/loading behavior **TBD** | **TBD** |

`DataSourceConnection` in the preview has `host: string`, `port: number`, `database: string`, `username: string`. Secret values must not be returned to the client; the preview exposes only `hasCredential: boolean`. The UI currently offers SQL Server only as an example; supported source types and credential model are **TBD**.

## Settings — mocked/in-memory; no frontend API calls

| Method and suggested endpoint | Purpose | Request | Response | Access |
|---|---|---|---|---|
| `GET /api/settings` **Suggested** | Read server-managed AI/retrieval/embedding configuration | None | **TBD**: current preview draft shape is `{ ai: { model: string, timeoutSeconds: number }, retrieval: { chunkSize: number, overlapTokens: number, topK: number } }`; embedding fields **TBD** | **TBD** |
| `PUT /api/settings` **Suggested** | Save AI and retrieval settings | Same draft shape above; allowed fields and validation **TBD** | Updated settings **TBD** | **TBD**; administrative policy **TBD** |

Appearance (theme/language) is already browser-persisted and needs no backend API. General is read-only session/build information. Embedding is currently server-managed/read-only, and similarity threshold is disabled; no API requirement for either is established.

## Shared DTOs and common response models

- `ApiResponse<T>` (current frontend envelope): `{ isSuccess: boolean, value: T | null, message: string, errors: string[], statusCode: number }`. Treat HTTP status and `isSuccess` together; body `statusCode` is not authoritative. Error HTTP/body semantics need backend contract confirmation.
- `JwtTokenResult` and auth request bodies are listed under Authentication.
- `ConversationSummary` **TBD**; preview `ChatConversation` fields are `{ id: string, title: string, updatedAt: string, messages: ChatMessage[] }`.
- Preview `ChatMessage`: `{ id: string, role: 'user' | 'assistant', content: string, createdAt: string, sources: ChatSource[] }`. `ChatSource`: `{ id: string, documentName: string, page: number | null, score: number | null, snippet: string | null }`.
- Preview `DocumentRecord`, `DocumentProgress`, `DataSourceRecord`, `DataSourceConnection`, `SchemaDatabase`, `SchemaTable`, `SchemaColumn`, `AiDraft`, and `RetrievalDraft` are described above. These are UI view models only, not approved backend DTOs.
- Suggested common error details, validation error format, paging envelope, timestamps/time zone policy, IDs, and enum wire values are **TBD** where not specified above.

## Contract gaps

Only auth calls are implemented. Conversation persistence/chat generation, document upload/list/detail/delete/status/retry, data-source CRUD/schema/connection testing, and server settings are missing integrations. Endpoint names and payloads suggested here require backend contract review before implementation. Authentication and authorization for each future feature must be explicitly defined by the backend; frontend route guards do not establish access policy.
