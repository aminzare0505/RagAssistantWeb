# Task 5 — Document Management UI (preview)

## Context

The Documents route is currently a `FeaturePlaceholder` that imports `fa` directly, so English users see Persian copy. Task 5 asks for a full Documents experience: list, search, filters, sorting, pagination, upload with drag-and-drop and validation, status display, details, delete with confirmation, and all states.

The backend has **no Documents HTTP surface**: the only controllers are `AuthController`, `ChatController`, and `TestController`; there is no upload/list/detail/delete/retry endpoint, no status field on the `Document` entity, no progress field, and no upload limits. The API also cannot start (`Authentication:Jwt:SecretKey` < 32 chars). So the feature cannot be integrated.

The approved precedent for this situation is AD-15 (Task 4 chat): ship an **honest UI preview** with isolated mock data, zero HTTP calls, no invented DTOs, a visible bilingual preview banner, and the mock module deleted the moment a verified contract exists. Task 5 mirrors that as **AD-16**.

Outcome: a working, accessible, responsive, bilingual Documents UI whose data and processing are clearly labelled as in-memory preview data.

---

## Decisions taken (no blocking questions)

| Area | Decision |
|---|---|
| Scope | Full interactive UI preview, mock data isolated under `features/documents/mock/`, AD-16 |
| Accepted file types | PDF only (`application/pdf`, `.pdf`), matching backend ingestion |
| Size limit | `10 MB` preview-only UX limit, copy states the server validates the real limit (not documented) |
| Upload progress | Indeterminate progress bar during a ~300 ms simulated "uploading (preview)" phase; **no percentages anywhere**; never advances to processing/chunking/embedding/indexed |
| Processing progress | Field exists in the view model but is always `null` in mock data; the row renders only when non-null, otherwise an explicit "not reported" note |
| Retry processing | Disabled button with `aria-describedby` + `title` explaining no retry endpoint exists (same approach as the chat composer attachment) |
| Details | Route `/documents/:documentId` inside `RequireAuth` → `AppShell`; unknown id → in-shell not-found state |
| Query state | `q`, `status`, `type`, `sort`, `page`, `size` in URL search params; defaults omitted; `replace: true` writes; page size default 6, options 6/12/24 |
| State sharing | Module-scoped preview store + `useSyncExternalStore`, so list, details, and upload agree and deletions survive navigation |
| Loading/error demo | `import.meta.env.DEV`-gated Ready/Loading/Error control (stripped from production builds) |
| New primitives | `Progress`, `Badge`, native-`<select>` `Select` only. No new npm packages |
| Mock filenames | Mixed Persian/English, language-neutral (data, not UI copy) → avoids the chat "not retranslated" defect |

---

## Feature structure

```
frontend/rag-assistant-ui/src/features/documents/
  index.ts                      # + DocumentDetailsPage export
  types.ts                      # preview view models ("NOT wire DTOs")
  lib/format.ts                 # formatBytes, formatDocumentDate(Time), truncateMiddle
  lib/validation.ts             # PREVIEW_MAX_FILE_BYTES, validateDocumentFile
  lib/query.ts                  # query type, parse/serialize, filter/sort/paginate
  mock/mock-documents.ts        # 11 deterministic records (ids doc-01..doc-11)
  mock/document-preview-store.ts# subscribe/get/add/remove/reset/clear
  mock/preview-upload.ts        # MOCK_UPLOAD_DELAY_MS, schedulePreviewUpload
  hooks/use-documents-query.ts  # URL-backed query state + setters
  hooks/use-documents-preview.ts# store subscription + derived pipeline + previewState
  hooks/use-document-upload.ts  # queue, validation, simulated phase, timer cleanup
  components/document-upload.tsx
  components/upload-file-row.tsx
  components/document-toolbar.tsx
  components/document-list.tsx
  components/document-row.tsx
  components/document-status-badge.tsx
  components/document-delete-dialog.tsx
  components/document-pagination.tsx
  components/documents-loading.tsx
  components/preview-state-control.tsx
  components/document-details.tsx
  routes/documents-page.tsx     # replaces placeholder
  routes/document-details-page.tsx
```

New shared primitives: `src/components/ui/progress.tsx`, `badge.tsx`, `select.tsx`.

Router (`src/app/router.tsx`): keep the lazy `documents` route; add `documents/:documentId` as a lazy sibling **before** `{ path: '*' }`, same `hydrateFallbackElement`.

`src/app/navigation.ts` needs no edit — `findNavigationItem` already prefix-matches `/documents/...`, so detail pages keep the "Documents" title and the active nav item.

---

## View models (`types.ts`)

```ts
export type DocumentStatus = 'uploaded' | 'processing' | 'chunking' | 'embedding' | 'indexed' | 'failed';
export type DocumentFileType = 'pdf';
export interface DocumentProgress { phase: DocumentStatus; percent: number }
export interface DocumentRecord {
  id: string; fileName: string; fileType: DocumentFileType;
  sizeBytes: number; uploadedAt: string;       // ISO
  status: DocumentStatus;
  progress: DocumentProgress | null;           // always null in preview data
}
```

Header comment declares these are preview view models, not wire DTOs, and that the file is replaced when a contract exists. Query types (`DocumentQuery`, `DocumentSort`) live in `lib/query.ts`, not here.

---

## Mock layer

- `mock-documents.ts` — `createMockDocuments()`: 11 fixed records, stable ids `doc-01…doc-11`, statuses `2 uploaded / 2 processing / 1 chunking / 1 embedding / 4 indexed / 1 failed`, sizes 180 KB–8.9 MB, dates spread over ~5 weeks, one deliberately long filename to exercise middle truncation. No timers, no randomness, no `Date.now()`.
- `document-preview-store.ts` — module singleton: `subscribe`, `getDocuments`, `addDocument`, `removeDocument`, `resetDocumentPreviewStore`, `clearPreviewDocuments`. Seeded once from the mock factory. Chosen over a per-mount hook because list and details are separate route instances.
- `preview-upload.ts` — `MOCK_UPLOAD_DELAY_MS = 300`, `schedulePreviewUpload(cb): cancel`. Header states it is not an upload: nothing leaves the browser and no processing is simulated.
- Every mock file carries the delete-with-the-contract header used by `features/chat/mock/`.

---

## Validation rules (`lib/validation.ts`)

`PREVIEW_MAX_FILE_BYTES = 10 * 1024 * 1024`.
`validateDocumentFile(file, existingRowsAndDocs)` → `{ ok: true } | { ok: false, error: 'empty-file' | 'unsupported-type' | 'too-large' | 'duplicate' }`, first failure wins:

1. `empty-file` — `size === 0`.
2. `unsupported-type` — name does not end `.pdf` (case-insensitive) **or** `file.type` is set and not `application/pdf`.
3. `too-large` — `size > PREVIEW_MAX_FILE_BYTES`.
4. `duplicate` — normalized `name + size` already queued or already in the preview list.

No `FileReader`, no `arrayBuffer()`, no content inspection. UI copy states client checks are convenience only and the server is authoritative.

---

## Upload pipeline

- `DocumentUpload` owns the DOM: uncontrolled `<input type="file" multiple accept="application/pdf,.pdf" className="sr-only">` (value reset after each change) plus a dashed drop **button** (`<button type="button">`, so keyboard/Enter works by construction) with `onDragEnter/Over/Leave/Drop`, `dropActive` styling, `aria-describedby` hints, and an `aria-live="polite"` status region. Readers get: PDF-only, 10 MB preview limit, "server validates type and size", and "preview — files stay in this browser tab".
- `useDocumentUpload` owns state: `UploadRow { id, fileName, sizeBytes, phase: 'queued'|'validating'|'uploading'|'done'|'error', error }`. `addFiles` validates synchronously, appends error rows, and starts the simulated phase for valid rows. Cancel functions are kept in a ref `Map`, cancelled on row removal and on unmount (chat precedent).
- `UploadRow` UI: name (`dir="ltr"`, middle-truncated), size, phase text, indeterminate `Progress value={null}` while uploading, localized error message, remove button in every phase — files are never silently dropped.
- `addToPreviewList(id)` is enabled only on `done` rows; it appends `{ status: 'uploaded', progress: null, uploadedAt: now }` to the store and announces it. Status never advances afterwards.
- Duplicate submission is blocked by validation; `isBusy` disables the "add" actions while a row uploads.

**Why indeterminate:** a determinate bar needs a real byte count, and UI/UX guidelines forbid fabricated percentages. Indeterminate communicates "in flight, remaining unknown", which is the only truthful claim here. `Progress` still supports determinate mode for the future contract.

---

## Documents list

- `useDocumentsQuery` binds `useSearchParams` to `DocumentQuery` (`q`, `status`, `type`, `sort`, `page`, `size`), default `sort=date-desc`, `page=1`, `size=6`. Invalid values fall back silently. Setting search/status/type/sort resets `page` to 1; changing `size` resets `page` to 1. Defaults are omitted when serializing.
- `lib/query.ts`: pure generic `filterDocuments` (trim + lowercase substring on `fileName`, status, type), `sortDocuments` (cached `Intl.Collator` per language for names, numeric for size/date, stable id tiebreak), `paginateDocuments` (`totalPages = max(1, ceil(total/size))`, page clamped without rewriting the URL).
- `DocumentToolbar`: labeled search input (magnifier + `sr-only` label), status select (All + 6), type select (All + PDF only, with the hint that the backend supports PDF), sort select (6 options), page-size select, localized result count via a catalog function.
- `DocumentList` / `DocumentRow`: `<ul>`/`<li>` grid (column labels on `md+`, stacked card on mobile), filename link `dir="ltr"` with `truncateMiddle(…, 44)`, size, date, `DocumentStatusBadge`, actions (View details link, disabled Retry, Delete ghost icon). Logical CSS only (`ps/pe/ms/me/start/end`), `tabular-nums` for numbers, touch targets ≥ 44 px.
- `DocumentStatusBadge`: icon + visible text always (never color-only) — uploaded `Upload`/neutral, processing `Clock`/info, chunking `Blocks`/info, embedding `Layers`/info, indexed `CircleCheck`/success, failed `CircleAlert`/destructive.
- States: `loading` → skeleton rows; `error` → shared `ErrorState` with a preview retry that resets state; ready + empty → shared `EmptyState` pointing at the upload area; ready + filtered empty → `EmptyState` with "Clear filters"; ready + results → list; `DocumentPagination` hidden when one page.

---

## Details view

`/documents/:documentId` → `DocumentDetailsPage` reads `useParams`, looks up the store.

- Known id: back link, `<h1>` = filename (`dir="ltr"`, wraps, `title`), status badge; metadata card (name, type, size, uploaded date+time, id in monospace, status); processing card (status badge, note that status is preview data, progress row **only** when `progress !== null`, otherwise `progressUnavailable`); actions (Delete dialog → remove + `navigate('/documents', { replace: true })`, Retry disabled); preview note that nothing is loaded from the server.
- Unknown id: shared `EmptyState` (`FileQuestion`, "Document not found", back link) inside the shell.
- No content preview, chunk list, or timings — none exist in the data.

---

## i18n

Add a `documents` block to both `src/i18n/fa.ts` and `src/i18n/en.ts` (en is typed as `Messages`, so alignment is compiler-enforced). Groups:

1. Preview honesty: badge, page notice, upload notice, details notice, status-source note, added/deleted live messages.
2. Upload: title, description, dropzone label/prompt/active, choose files, type/size hints, server-validates note, queue title/empty, clear, remove, add to preview list.
3. Phases: queued, validating, uploading, done, error.
4. Validation: unsupported type, empty file, too large, duplicate, guidance to remove and re-add.
5. Statuses: label + six values.
6. Toolbar: list title, search label/placeholder, status/type/sort labels and options, type hint, page size.
7. Actions: view details, retry, retry unavailable, delete, dialog title/description/confirm/cancel, actions group label.
8. States: empty, filtered empty, clear filters, loading, error, error retry.
9. Details: title, back, metadata labels, processing labels, progress, progress unavailable, not-found.
10. Pagination: label, previous, next.
11. Dev-only preview-state labels.
12. Catalog functions for word order: `resultCount(count)`, `pageIndicator(page, total)`, `sizeLimitNote(size)`.

`fa.features.documents.description` stays (like `features.chat.description`) but the page no longer uses it.

---

## Tests

Baseline is 68 tests / 11 files. Target ≈ 50 new tests → ≈ 118 total / 17 files.

| File | ~n | Focus |
|---|---|---|
| `lib/validation.test.ts` | 9 | valid PDF, `.PDF`, wrong extension, `.pdf` with `text/html`, empty MIME accepted, zero bytes, oversize, duplicate in queue, duplicate vs list |
| `lib/query.test.ts` | 11 | search case/trim, status, type (generic fixture), combined, name collation, date/size sort, stability, pagination clamp, parse defaults/invalid, serialize omits defaults |
| `lib/format.test.ts` | 7 | bytes units, fa digits, zero, invalid ISO, middle truncation keeps extension, short no-op |
| `components/document-upload.test.tsx` | 9 | hints, picker single/multi, wrong type, oversize, duplicate, uploading→done (real timers + `waitFor`), add writes store, remove cancels, drop via `fireEvent.drop` with `{ files }`, dropzone is a keyboard-activatable button |
| `documents-page.test.tsx` | 13 | banner+rows, status text present, filename `dir="ltr"`, search updates URL+list, filters, sort, pagination+URL, URL restore, filtered empty, empty, loading/error via dev control, delete cancel/confirm, retry disabled, **English copy regression** |
| `routes/document-details-page.test.tsx` | 7 | metadata, progress absent + note, determinate when injected, delete→navigate, back, unknown id, retry disabled |
| `src/app/router.test.tsx` | edit | documents route renders search+upload (no `unavailableTitle`); move placeholder assertion to `data-sources`; optional details smoke |

Harness notes: call `resetDocumentPreviewStore()` in `beforeEach`; use `renderApp({ initialPath: '/documents?status=indexed&page=2' })` and assert `router.state.location.search`; no `URL.createObjectURL` stub needed (feature never creates object URLs — verify by grep); drop tests pass a plain `{ files: [file] }` object since the component reads only `dataTransfer.files`.

---

## Browser verification

Vite dev server + headless Chrome over CDP (API cannot start). Inject a `fetch` stub answering `/auth/refresh` plus `sessionStorage.refresh_token`, and set `language`/`theme` per run.

Capture 12 screenshots to `Docs/Ai/reviews/assets/2026-11-17-documents/`:
- 1440×900 / 768×900 / 360×740 × fa/en, light (6)
- 1440 / 360 × fa/en, dark (4)
- details view 1440 × fa/en (2)

Structural checks per run: `lang`/`dir` correct, `.dark` in dark runs, `scrollWidth <= clientWidth` on `html` and `body` with the long filename visible, `<h1>` localized, preview badge/notice visible, filenames `dir="ltr"`, status badges contain icon **and** text, actions ≥ 44 px at 360, and **English mode contains no Persian documents copy** (regression for the placeholder defect).

Interaction checks: drop a synthesized PDF → uploading (no percent text) → done → add to list → `uploaded` row; drop a `.txt` → rejection; search/filter/sort/paginate update the URL and survive reload; delete dialog confirm removes the row and the details route then 404s; `/documents/does-not-exist` shows the in-shell not-found; dev control toggles loading/error; `npm run build` + preview confirms the dev control is absent from the bundle.

---

## Documentation updates

- `Docs/Ai/CHANGELOG_AI.md` — 2026-11-17 entry: scope, every changed file, gate output with real numbers, browser evidence, limitations, mock deletion note.
- `PROJECT_CONTEXT.md` — documents = UI preview implemented, contract blocked; evidence; limitations.
- `AGENTS.md` §8 — add documents preview; scope the Persian-copy known issue to data-sources/settings only.
- `Docs/Ai/frontend-architecture.md` — module tree, routes, URL-owned query state, module-scoped preview store, readiness matrix, **AD-16**.
- `Docs/Ai/frontend-api-integration.md` — §9 "UI preview implemented; zero requests"; §9.2 exact contract needed.
- `Docs/Ai/frontend-ui-ux-guidelines.md`, `frontend-testing-standards.md`, `frontend-security-standards.md`, `frontend-coding-standards.md`, `frontend-workflow.md` (§12.4 record).
- New `Docs/Ai/reviews/2026-11-17-documents-ui.md` (self-review; no independent reviewer available).

---

## Exact contract needed (documented, not implemented)

`POST /api/documents` (multipart `file`, optional collection; 201 metadata + `Location`; 400/413/415/409), `GET /api/documents` (page, pageSize, search, status, fileType, sort, order → items/page/pageSize/total/totalPages), `GET /api/documents/{id}` (+ optional `progress {phase, percent}`, failure code, timestamps, 404), `DELETE /api/documents/{id}` (204/404, index cleanup semantics), `POST /api/documents/{id}/retry` (202, 409 unless failed). Plus: authoritative status enum names and transition graph, documented MIME/size/count limits, ownership enforcement, permissions `documents.read/create/delete`, and a startable API (secret key ≥ 32 chars) for runtime verification.

---

## To-Do (numbered; each step has a gate)

1. **i18n** — add `documents` block + catalog functions to `fa.ts` and `en.ts`. Gate: `npm run typecheck`, `npm run lint`.
2. **Types** — `features/documents/types.ts` with the "NOT wire DTOs" header. Gate: typecheck.
3. **Format lib** — `lib/format.ts` (`formatBytes`, `formatDocumentDate`, `formatDocumentDateTime`, `truncateMiddle`). Gate: typecheck.
4. **Validation lib** — `lib/validation.ts`. Gate: typecheck.
5. **Query lib** — `lib/query.ts` (pure, no React). Gate: typecheck.
6. **Mock layer** — `mock/mock-documents.ts`, `mock/document-preview-store.ts`, `mock/preview-upload.ts`. Gate: typecheck; grep proves no `fetch`/`axios` in the feature and no React/DOM-network imports in `mock/`.
7. **UI primitives** — `progress.tsx`, `badge.tsx`, `select.tsx`. Gate: typecheck + lint (a11y).
8. **Hooks** — `use-documents-query.ts`, `use-documents-preview.ts`, `use-document-upload.ts`. Gate: typecheck; review timer cleanup, duplicate guard, `isBusy`.
9. **Components** — status badge, row, list, toolbar, pagination, loading, delete dialog, upload row, upload panel, preview-state control, details. Gate: typecheck + lint (labels, `dir`, `aria-live`, logical CSS).
10. **Documents page** — replace `routes/documents-page.tsx`, update `features/documents/index.ts`. Gate: dev-server smoke on `/documents` in fa/en, light/dark.
11. **Details route** — `routes/document-details-page.tsx` + router entry. Gate: manual `/documents/doc-01` and `/documents/nope`.
12. **Tests** — six new files + `router.test.tsx` update. Gate: `npm run test` (≈118 passing, 0 failing).
13. **Full gates** — `typecheck`, `lint`, `test`, `build`; record bundle sizes; confirm the dev control is absent from `dist` (grep built assets).
14. **Browser verification** — matrix, structural + interaction checks, 12 screenshots.
15. **Documentation** — changelog, context, AGENTS, six standards/architecture docs, workflow record.
16. **Review report** — `Docs/Ai/reviews/2026-11-17-documents-ui.md` with real outputs and limitations.

---

## Known limitations (to report, not hide)

- No HTTP call, endpoint, DTO, or persistence; all data is in-memory mock. Nothing is uploaded, processed, indexed, or deleted on a server.
- Status values are preview labels; the backend enum does not exist.
- Processing progress is never shown because no data supports it.
- Retry is disabled; there is no endpoint.
- Loading/error states are only reachable through the DEV control.
- Native `<select>` uses OS-styled popups.
- A document added while a filter is active may be filtered out; the UI announces it rather than clearing filters.
- Details pages keep the "Documents" document title (`usePageTitle` is path-based).
- `features/documents/lib/format.ts` duplicates the cached-`Intl` pattern from chat; hoisting shared formatters is a recorded follow-up.
- Unverified: live API, E2E (Playwright absent), screen readers, non-Chromium browsers, independent review.