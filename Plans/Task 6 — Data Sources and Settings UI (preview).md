# Task 6 — Data Sources and Settings UI (preview)

## Context

`/data-sources` and `/settings` are still `FeaturePlaceholder`s that import `fa` directly, so English mode shows Persian copy. Task 6 asks for a data-source list (name, type, connection status, last sync), Add/Edit/Delete, connection forms, a connection test, a schema browser, all states, plus settings for general, appearance, AI model, embedding, and retrieval.

The backend has **no surface for any of this**:

- Controllers are only `AuthController`, `ChatController`, `TestController` (`/api/test` is demo code and must not be used).
- There is no data-source entity, registry, schema endpoint, connection-test endpoint, or data-source permission. `SiteUserDataSource` is an EF CRUD class for `usr.SiteUser` (which stores a plaintext password), not a source registry.
- There is no settings endpoint. Configuration is server-side options only (`OllamaOptions`, `QdrantOptions`, `EmbeddingOptions`) bound from `appsettings.json`; the browser cannot read or write it.
- RAG services are **commented out** in `DependencyInjection.cs`, so even the configured values are not live runtime configuration.
- The API cannot start (`Authentication:Jwt:SecretKey` < 32 chars), so nothing is runtime-verifiable against it.

The approved precedent is AD-15/AD-16: blocked contract → honest UI preview with isolated `features/<x>/mock/`, zero HTTP calls, no invented DTOs, visible bilingual preview notices, and mock layers deleted the moment a verified contract exists. Task 6 applies that as **AD-18 (data sources)** and **AD-19 (settings)**.

Outcome: working, accessible, responsive, bilingual Data Sources and Settings UIs whose mock/unsupported behavior is labelled on every screen, with no secret ever stored, re-displayed, or sent anywhere.

---

## Decisions taken

| Area | Decision |
|---|---|
| Scope | Full interactive preview for both features; mock isolated under each feature's `mock/`; zero HTTP calls, zero invented DTOs |
| Source type | Only **SQL Server** is offered, as a clearly-labelled preview example — it is the only database technology in the system. Copy states the backend exposes no source-type registry, so no other type is offered |
| Source statuses | `connected` / `disconnected` / `error` — preview view-model labels only |
| Connection test | **Disabled** button with `aria-describedby` + visible reason: no test endpoint exists. No simulated success |
| Schema browser | Accessible tree over **example schema data**, inside the preview notice; one source has no schema to exercise the empty state |
| Secrets | Password captured transiently in form state, never in the store, DOM after submit, logs, URL, or storage. Store keeps only `hasCredential: boolean` (compile-time enforced: the record type has no credential field). Mock data contains no credentials. Qdrant key / embedding paths / endpoints are never rendered |
| Data-source CRUD | In-memory module store + `useSyncExternalStore`, so list, details, and form agree and survive navigation; resets on reload |
| Routes | `/data-sources`, `/data-sources/new`, `/data-sources/:sourceId`, `/data-sources/:sourceId/edit` |
| Settings routes | `/settings` (General) and `/settings/:section` for `appearance \| ai \| embedding \| retrieval`; unknown section → in-shell not-found. Section nav with `aria-current` |
| Settings editability | Appearance is **fully functional** (existing providers, persisted in this browser). General is read-only (signed-in user, API base, environment). AI/Retrieval are validated **drafts saved in memory only** — seeded from source-verified backend values, with a per-section notice that server configuration is unchanged. Embedding is read-only "server-managed" (paths/keys not shown). Similarity threshold is shown disabled: not supported |
| Providers | Only **Ollama** — the only implemented provider; no provider abstraction exists in the backend. Rendered as a disabled select with one option and an explanation |
| Preview states | Shared DEV-only Ready/Loading/Error control (promoted from documents), stripped from production builds |
| Shared code | Hoist locale-cached date formatting to `src/lib/format-date.ts` (chat/documents/data-sources = rule of three); documents keeps its public API unchanged |
| Dependencies | None added. No Textarea/Switch/RadioGroup: reuse `Button`, `Card`, `Input`, `Select`, `Badge`, `Dialog`, `Skeleton`, `Spinner`, `Tooltip`, `EmptyState`, `ErrorState`; theme/language use `Select` with immediate save |

### Source-verified settings values used as defaults

From `RagAssistantApi/RagAssistant.Api/appsettings.json`, `RagAssistant.Infrastructure/Chunking/SemanticKernelTextChunker.cs:16-17`, `RagAssistant.Application/Services/RagService.cs:61,81`, `RagAssistant.Infrastructure/DataSources/QdrantDataSources/QdrantDataSource.cs:100`:

| Setting | Value | Nature |
|---|---|---|
| AI provider | Ollama | only implementation |
| Model | `qwen2.5-coder:7b` | appsettings |
| Timeout | `10` (seconds; `OllamaOptions.TimeOut` int) | appsettings |
| Embedding model / tokenizer | server-side file paths | **never displayed** (documented rule: do not expose model paths/endpoints/keys) |
| Chunk size | `300` | chunker constructor default |
| Chunk overlap | `50` | chunker constructor default |
| Top-K | `5` | hardcoded in `RagService` and `QdrantDataSource` |
| Similarity threshold | — | **does not exist** in the backend |

---

## Feature structure

```
frontend/rag-assistant-ui/src/features/data-sources/
  index.ts
  types.ts                          # preview view models ("NOT wire DTOs")
  lib/validation.ts                 # Zod schema + create/update payload builders
  mock/mock-data-sources.ts         # 5 deterministic records (src-01..src-05)
  mock/mock-schema.ts               # example schema trees keyed by source id
  mock/data-source-preview-store.ts # subscribe/get/add/update/remove/reset/clear
  hooks/use-data-sources.ts         # store subscription + previewState
  hooks/use-data-source.ts          # single lookup by id
  components/data-source-list.tsx
  components/data-source-row.tsx
  components/data-source-status-badge.tsx
  components/data-source-delete-dialog.tsx
  components/connection-fields.tsx  # host/port/database/username/password (+ toggle)
  components/data-source-form.tsx   # RHF + Zod, create/edit modes
  components/schema-browser.tsx     # accessible tree
  components/data-sources-loading.tsx
  routes/data-sources-page.tsx
  routes/data-source-form-page.tsx
  routes/data-source-details-page.tsx

frontend/rag-assistant-ui/src/features/settings/
  index.ts
  types.ts                          # SettingsDrafts, section ids
  lib/settings-defaults.ts          # source-verified defaults with citations
  lib/settings-schema.ts            # Zod schemas for AI + retrieval drafts
  mock/settings-draft-store.ts      # module store + useSyncExternalStore
  hooks/use-settings-drafts.ts
  components/settings-layout.tsx    # section nav + children
  components/settings-section.tsx   # card + preview notice wrapper
  components/general-settings.tsx
  components/appearance-settings.tsx
  components/ai-settings.tsx
  components/embedding-settings.tsx
  components/retrieval-settings.tsx
  routes/settings-page.tsx          # reads `section`, renders nav + section
```

Shared changes:

- New `src/lib/format-date.ts` — cached `Intl.DateTimeFormat` for `fa-IR`/`en-US`, `formatDate(iso, language)`, `formatDateTime(iso, language)`; invalid ISO → `''`.
- `src/features/documents/lib/format.ts` delegates date formatting to it; `formatBytes`/`formatNumber`/`truncateMiddle` stay.
- `src/features/documents/components/preview-state-control.tsx` → `src/components/shared/preview-state-control.tsx` with props `{ state, onChange, labels, onReset }`; documents passes its copy and store reset. Update the documents page import.
- Delete `src/components/shared/feature-placeholder.tsx` and the `features` i18n block (no usage remains), updating the three test references.
- Copy-only refresh of stale `home` strings (currently says data sources/settings still have no contract and show no data).

Router (`src/app/router.tsx`), all lazy with the existing `hydrateFallbackElement`, `data-sources/new` listed before `data-sources/:sourceId`:

- `data-sources` → `DataSourcesPage`
- `data-sources/new` → `DataSourceFormPage`
- `data-sources/:sourceId` → `DataSourceDetailsPage`
- `data-sources/:sourceId/edit` → `DataSourceFormPage`
- `settings` and `settings/:section` → `SettingsPage`

`src/app/navigation.ts` needs no edit (prefix matching already keeps the section active and the document title). Details/form pages keep the "Data Sources"/"Settings" title — recorded limitation.

---

## View models

`features/data-sources/types.ts` (header: preview view models, not wire DTOs; replaced when a contract exists):

```ts
export type DataSourceStatus = 'connected' | 'disconnected' | 'error';
export type DataSourceType = 'sql-server';
export interface DataSourceConnection {
  host: string; port: number; database: string; username: string;
}
export interface DataSourceRecord {
  id: string; name: string; type: DataSourceType;
  connection: DataSourceConnection;
  status: DataSourceStatus;
  lastSyncAt: string | null;   // ISO
  hasCredential: boolean;      // no password field exists, by design
  createdAt: string;           // ISO
}
export interface SchemaColumn { name: string; dataType: string; nullable: boolean }
export interface SchemaTable { name: string; columns: SchemaColumn[] }
export interface SchemaDatabase { name: string; tables: SchemaTable[] }
```

`features/settings/types.ts`:

```ts
export type SettingsSection = 'general' | 'appearance' | 'ai' | 'embedding' | 'retrieval';
export interface AiDraft { model: string; timeoutSeconds: number }
export interface RetrievalDraft { chunkSize: number; overlapTokens: number; topK: number }
export interface SettingsDrafts { ai: AiDraft; retrieval: RetrievalDraft }
```

Form values (`DataSourceFormValues`) include `password: string` but the type never flows into a stored record: submit maps to `{ connection, hasCredential }` only.

---

## Mock layer

- `mock-data-sources.ts` — 5 fixed records `src-01…src-05`, mixed Persian/English names, hosts/databases/usernames fictional (`db.internal`, `localhost`, `analytics`, …), statuses `2 connected / 2 disconnected / 1 error`, one `lastSyncAt: null`, deterministic ISO timestamps. No password, key, or connection string anywhere.
- `mock-schema.ts` — `getMockSchema(sourceId)` returns 1–2 databases with 3–5 tables and 4–8 columns each for `src-01`–`src-03`, `null` for `src-05` (empty-state path); `src-04` has a single database. Example table names only (`Customers`, `Orders`, `Invoices`, …).
- `data-source-preview-store.ts` — module singleton: `subscribe`, `getDataSources`, `addDataSource`, `updateDataSource`, `removeDataSource`, `resetDataSourcePreviewStore`, `clearDataSourcePreviewStore`; seeded once.
- `settings-defaults.ts` — `DEFAULT_AI_DRAFT`, `DEFAULT_RETRIEVAL_DRAFT`, `SETTINGS_PROVIDER = 'Ollama'` with source-file comments.
- `settings-draft-store.ts` — module singleton seeded from the defaults: `getDrafts`, `saveAiDraft`, `saveRetrievalDraft`, `resetSection`, `resetSettingsDraftStore`, `subscribe`.

Every mock file carries the delete-with-the-contract header used by `features/chat/mock/` and `features/documents/mock/`.

grep gate: the feature trees contain no `fetch`, `axios`, `localStorage`, `sessionStorage`, `WebSocket`, or connection string.

---

## Validation

`features/data-sources/lib/validation.ts` (Zod, localized message keys passed in like `createLoginSchema`):

| Field | Rule (preview UX, not backend policy) |
|---|---|
| name | trimmed, 2–80, unique against the store excluding the edited id |
| type | fixed `sql-server` |
| host | trimmed, 1–255, no whitespace, hostname/IP pattern |
| port | integer 1–65535, default 1433 |
| database | trimmed, 2–128 |
| username | trimmed, 1–128 |
| password (create) | 1–256, required |
| password (edit) | optional; blank means "keep current credential" (preview keeps `hasCredential`) |

No connection attempt, no `FileReader`, no assembled/displayed connection string. Copy states the server would be authoritative.

`features/settings/lib/settings-schema.ts`:

| Draft field | Rule |
|---|---|
| model | trimmed, required, 1–120 |
| timeoutSeconds | integer 1–600 |
| chunkSize | integer 50–4000 |
| overlapTokens | integer 0…`chunkSize - 1` |
| topK | integer 1–50 |

Bounds are labelled preview guidance because the backend documents none.

---

## Data Sources UI

- **List** (`/data-sources`): preview badge + notice, shared DEV control, "Add data source" button, card list. Desktop labelled grid, mobile stacked cards. Rows show name, type label (`SQL Server` + preview marker in the type cell's title/description), status badge, last sync (`formatDateTime` or "never"), and actions: view, edit, delete. Loading → skeleton rows; error → `ErrorState` + preview retry; empty → `EmptyState` pointing at Add.
- **Status badge**: icon **plus** text always — connected `CircleCheck`/success, disconnected `Unplug`/warning, error `CircleAlert`/destructive.
- **Form** (`/new`, `/:sourceId/edit`): RHF + `zodResolver`, `useId` labels, inline errors, `aria-invalid`/`aria-describedby`, password show/hide toggle (login pattern), password field always empty after save. Submit adds/updates the store, announces via the destination page's `aria-live` region, and navigates to the details page. Cancel/back link returns without changes. Edit with unknown id → in-shell not-found.
- **Details** (`/:sourceId`): back link, `<h1>` name, status badge, preview notice; metadata card (name, type, status, last sync, created, id in monospace); connection card (host `dir="ltr"`, port, database, username, "credential configured — never displayed"); schema card; actions: Edit, Delete (confirmation dialog → remove + `navigate('/data-sources', { replace: true })`), **disabled** "Test connection" with visible reason.
- **Schema browser**: `role="tree"` / `treeitem` / `group`, `aria-expanded`, roving tabindex, ArrowDown/Up between visible items, ArrowRight expand-or-first-child, ArrowLeft collapse-or-parent, Home/End; databases → tables → columns (name, type, nullable). Empty schema → "no example schema for this source".
- **Delete dialog** follows `document-delete-dialog.tsx`: destructive confirm only inside the dialog, filename in `dir="ltr"`, cancel via `DialogClose`.

---

## Settings UI

- **Layout**: vertical section nav (`NavLink`, `aria-current="page"`) on `md+`, horizontally scrollable tabs at 360 px; section content in `max-w` cards. Section switch is instant and reflected in the URL.
- **General** (`/settings`): read-only rows — signed-in username/email (`useAuth`), app name, API base (`env.apiBaseUrl` or same-origin), environment (`env.appEnv`); note that these come from build/session, not a settings API.
- **Appearance** (`/settings/appearance`): theme `Select` (light/dark/system) → `setTheme`; language `Select` (fa/en) → `setLanguage`; both persist via the existing providers/localStorage. Explicit "saved in this browser" note — the only settings that actually persist.
- **AI** (`/settings/ai`): disabled provider select (only Ollama; note no provider abstraction), model text input, timeout number input; save → in-memory draft store + inline status "saved for this session only; server configuration unchanged"; reset to source-verified defaults. No endpoint is called.
- **Embedding** (`/settings/embedding`): read-only rows "Embedding model — server-managed (not exposed)", "Tokenizer — server-managed (not exposed)", plus explanation that paths/keys are server-only and no settings API exists. No values, no inputs.
- **Retrieval** (`/settings/retrieval`): chunk size, overlap, top-K numeric drafts seeded from the code defaults (300/50/5); cross-field rule overlap < chunk size; save/reset in memory with "not live configuration" notice (RAG registrations are commented out). Similarity threshold rendered **disabled** with "not supported by the backend".
- **Preview honesty**: each server-backed section carries a preview badge/notice; no success toast implies server persistence. A shared `aria-live` region announces save/reset.
- **Unknown section** (`/settings/nope`): in-shell `EmptyState` with back link.

---

## i18n

Add `dataSources` and `settings` blocks to `src/i18n/fa.ts` and `src/i18n/en.ts` (`en` is typed as `Messages`, so alignment is compiler-enforced). Remove the now-dead `features` block and stale home copy.

- `dataSources`: preview badge/notice; list labels and statuses; field labels (name/type/status/lastSync); add/edit/delete/view/test; form labels + hints; validation messages; credential semantics ("configured, never displayed", "leave blank to keep"); details labels; schema labels (schema/tables/columns/type/nullable/empty); DEV state labels; live messages; not-found. Catalog functions for counts/word order only where needed.
- `settings`: section nav labels; per-section preview notices; general labels; appearance labels; AI labels (provider, model, timeout, fixed-provider note, session-only save, reset); embedding labels (server-managed, not exposed, no endpoint); retrieval labels (chunk size, overlap, top-K, similarity threshold, unsupported note, validation); live messages; unknown-section copy.
- Home strings: replace "data sources/settings have no contract and show no data" with accurate preview status.

---

## Tests

Baseline: 142 tests / 17 files. Target ≈ 75 new → ≈ 217 total / 26 files.

| File | ~n | Focus |
|---|---|---|
| `features/data-sources/lib/validation.test.ts` | 10 | valid input, trim, short name, bad host, port bounds/non-integer, missing database/username, password required on create, optional on edit, duplicate name, output contains no password |
| `features/data-sources/mock/data-source-preview-store.test.ts` | 6 | seed count, subscribe, add, update, remove, reset/clear, records expose no credential |
| `features/data-sources/components/schema-browser.test.tsx` | 6 | databases/tables/columns render, expand/collapse, arrow keys, nullability text, empty schema |
| `features/data-sources/routes/data-sources-page.test.tsx` | 10 | banner, rows (name/type/status/last sync), LTR host, add link, delete cancel/confirm, loading/error via DEV control, empty, English copy regression, unknown id not-found |
| `features/data-sources/routes/data-source-form-page.test.tsx` | 10 | create validation, port error, duplicate name, create adds + navigates, edit prefill, blank password keeps credential, password absent after save, cancel, back, only SQL Server offered |
| `features/data-sources/routes/data-source-details-page.test.tsx` | 8 | metadata, connection metadata, credential configured/not shown, disabled test with reason, schema, edit link, delete→list, unknown id |
| `features/settings/lib/settings-schema.test.ts` | 8 | model required/trim, timeout bounds, chunk bounds, overlap < chunk, top-K bounds, non-numeric rejected, defaults valid |
| `features/settings/mock/settings-draft-store.test.ts` | 5 | seeded defaults, save AI, save retrieval, reset section, subscribe |
| `features/settings/routes/settings-page.test.tsx` | 12 | general values, section nav + aria-current, theme change applies `.dark`/removes, language change flips `dir`, AI validate + session-only save, reset, embedding shows server-managed and no paths, retrieval defaults, similarity disabled, overlap error, unknown section, English copy regression |
| `src/app/router.test.tsx` (edit) | +2 | data-sources renders list (no placeholder); settings renders sections; placeholder assertion removed |

Harness rules: call `resetDataSourcePreviewStore()` / `resetSettingsDraftStore()` in `beforeEach`; use `renderApp({ initialPath })`; assert navigation via `router.state.location.pathname`; no object-URL or network stubs needed (grep proves neither exists).

---

## Gates

From `frontend/rag-assistant-ui/` in this order: `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build`. Record real numbers and bundle sizes; confirm DEV controls are absent from `dist` assets by grep (and report honestly if state plumbing remains in the chunk, as with documents).

---

## Browser verification

Vite dev server + headless Chrome over CDP (API cannot start). Stub `/auth/refresh` and seed `sessionStorage.refresh_token`; set `language`/`theme` per run. Screenshots to `Docs/Ai/reviews/assets/2026-11-17-data-sources-settings/` (14–15 files):

- Data sources list: 1440 fa/en light, 768 fa, 360 en light, 1440 fa dark.
- Details with schema expanded: 1440 fa/en.
- Create form with validation errors: 1440 fa, 360 en.
- Delete confirmation dialog: 1440 fa.
- Settings general/appearance: 1440 fa/en light.
- Settings AI + retrieval: 1440 fa dark, 360 en.
- English settings run for the copy regression.

Structural checks per run: `lang`/`dir`, `.dark` in dark runs, `scrollWidth <= clientWidth` on `html`/`body` at 360, localized `<h1>`, preview badges/notices visible, hosts/ids `dir="ltr"`, status badges contain icon **and** text, touch targets ≥ 44 px at 360, English mode contains no Persian data-sources/settings copy.

Interaction checks: add (errors → valid → list + details); edit (name changes, blank password keeps "credential configured"); delete cancel/confirm; test-connection disabled with reason; schema expand/collapse via mouse and arrows; theme/language change and persist; AI/retrieval save shows session-only notice and reset restores defaults; overlap ≥ chunk errors; similarity threshold disabled; `/settings/nope` and `/data-sources/nope` not-found; password value is absent from DOM, store, and storage after save; DEV control toggles loading/error; `npm run build` + preview confirms DEV controls absent.

---

## Documentation updates

- `Docs/Ai/CHANGELOG_AI.md` — 2026-11-17 entry: scope, AD-18/AD-19, changed files, gates with real numbers, browser evidence, limitations, mock deletion note.
- `PROJECT_CONTEXT.md` — status, blockers, English-copy defect resolved, evidence rows, bundle sizes, screenshot paths.
- `AGENTS.md` — intro and §8: all four modules are previews; new test count; screenshot path; remove the placeholder/Persian-copy known issue.
- `Docs/Ai/frontend-architecture.md` — module trees, routes, module stores, readiness matrix rows, AD-18/AD-19, shared `format-date`/`PreviewStateControl`, placeholder removal.
- `Docs/Ai/frontend-api-integration.md` — §10 rewritten: preview implemented, zero requests; §10.3 exact contract needed.
- `Docs/Ai/frontend-ui-ux-guidelines.md` — §10/§11 rewritten as implemented previews (schema tree, secret masking, draft semantics, unsupported controls).
- `Docs/Ai/frontend-testing-standards.md` — new per-feature coverage subsection.
- `Docs/Ai/frontend-security-standards.md` — transient password handling, no secrets in mock/store/DOM/storage, no browser DB connections.
- `Docs/Ai/frontend-coding-standards.md` — transient-secret form pattern, module stores, hoisted formatters, DEV control reuse.
- `Docs/Ai/frontend-workflow.md` — §12.5 Task 6 record.
- New `Docs/Ai/reviews/2026-11-17-data-sources-settings-ui.md` (self-review; no independent reviewer available).

---

## Exact contract needed (documented, not implemented)

**Data sources**

- `GET /api/data-sources` → `items[]` (`id`, `name`, `type`, `status`, `lastSyncAt`, `createdAt`), paging optional.
- `GET /api/data-sources/types` → supported type descriptors (id, label, required fields).
- `POST /api/data-sources` (`type`, `name`, connection fields + write-only credential) → 201 + `Location`; 400/409.
- `GET /api/data-sources/{id}`; `PUT/PATCH /api/data-sources/{id}` (credential optional, never returned); `DELETE` → 204.
- `POST /api/data-sources/{id}/test-connection` → status + safe error code.
- `GET /api/data-sources/{id}/schema` → databases → tables → columns (`name`, `dataType`, `nullable`).
- Ownership/authorization per source; permissions `data-sources.read/create/update/delete`; documented credential encryption and redaction; documented limits; startable API.

**Settings**

- `GET /api/settings` → sanitized values only (provider, model, timeout, chunk size, overlap, top-K, similarity threshold or null, embedding model **name** if approved); never paths, endpoints, keys.
- `PUT /api/settings` → validated update, permission `settings.read/update`, audit trail; explicit rule for whether any of these become runtime-mutable (today they are options/code defaults and RAG DI is disabled).

---

## Known limitations (to report)

- No HTTP call, endpoint, DTO, or persistence anywhere in these features; nothing is saved or executed on a server.
- Settings drafts reset on reload; server configuration is unchanged; the RAG pipeline is not registered in DI.
- Only SQL Server is offered as a preview example; the backend has no source-type registry.
- Connection test is disabled (no endpoint). Schema data is fictional example data, clearly labelled.
- Statuses and last-sync values are preview labels.
- Loading/error states are reachable only through the DEV control; empty states only via store reset/dev control.
- Password handling is transient by design: after save only `hasCredential` exists; credentials cannot be viewed, changed, or verified.
- Embedding configuration is informational only; paths/keys deliberately not displayed.
- Similarity threshold is not supported and shown disabled.
- Native `<select>` popups are OS-styled; sub-pages keep the section document title.
- Unverified: live API, E2E (Playwright absent), screen readers, non-Chromium browsers, independent review.

---

## To-Do (numbered; each step has a gate)

1. **i18n** — add `dataSources`/`settings` blocks to `fa.ts`/`en.ts`; remove `features`; refresh home copy. Gate: typecheck, lint.
2. **Shared hoists** — `src/lib/format-date.ts`; documents delegates to it; `components/shared/preview-state-control.tsx` generalized; documents page updated. Gate: typecheck, documents tests.
3. **Data-source types + validation** — `types.ts`, `lib/validation.ts`. Gate: typecheck.
4. **Data-source mock layer** — `mock-data-sources.ts`, `mock-schema.ts`, `data-source-preview-store.ts`. Gate: typecheck; grep proves no network/storage/secrets.
5. **Data-source hooks** — `use-data-sources.ts`, `use-data-source.ts`. Gate: typecheck.
6. **Data-source components** — badge, row, list, delete dialog, connection fields, form, schema browser, loading. Gate: typecheck, lint (a11y, labels, `dir`, logical CSS).
7. **Data-source routes + router** — list, form, details; router entries. Gate: dev-server smoke on all four routes in fa/en.
8. **Settings types/defaults/schema** — `types.ts`, `lib/settings-defaults.ts`, `lib/settings-schema.ts`. Gate: typecheck.
9. **Settings draft store + hook** — `mock/settings-draft-store.ts`, `use-settings-drafts.ts`. Gate: typecheck.
10. **Settings components + route** — layout, section wrapper, five sections, `SettingsPage`; router entries. Gate: dev-server smoke on `/settings/:section` including unknown.
11. **Reuse cleanup** — delete `FeaturePlaceholder`; update router test and documents test imports. Gate: typecheck, lint.
12. **Tests** — nine new files + router test edit. Gate: `npm run test` (≈217 passing, 0 failing).
13. **Full gates** — typecheck, lint, test, build; record bundle sizes; grep `dist` for DEV controls.
14. **Browser verification** — matrix, structural + interaction checks, 14–15 screenshots, secret-absence checks.
15. **Documentation** — changelog, context, AGENTS, six standards/architecture docs, workflow record.
16. **Review report** — `Docs/Ai/reviews/2026-11-17-data-sources-settings-ui.md` with real outputs and limitations.