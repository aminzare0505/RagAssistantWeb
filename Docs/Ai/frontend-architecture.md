# Frontend Architecture — RAG Assistant

> **Status:** Foundation, the application layout/design system, **authentication**, and **chat, documents, data-sources, and settings UI previews** are implemented. The React application lives at `frontend/rag-assistant-ui/` and contains the responsive shell, navigation, header, light/dark themes, a bilingual (Persian/English) RTL-LTR shell, reusable UI primitives, an HTTP client with envelope/error handling, a single-flight refresh session, a development-only preview admin sign-in for reviewing authenticated pages, responsive preview interfaces for all four product modules, and tests. Only the authentication pages make network calls; chat, documents, data sources, and settings use isolated mock data, and real integration remains blocked on the backend contracts.
>
> **Backend baseline:** `RagAssistantApi` (ASP.NET Core 8), source-inspected on 2026-11-16 at commit `afd92ec` with an uncommitted working tree. A prior `dotnet run` attempt on 2026-11-17 failed JWT option validation. On 2026-11-22, the HTTPS Swagger UI and OpenAPI document returned HTTP 200, and a GET to POST-only `/api/auth/login` through Vite returned HTTP 405. This confirms HTTPS/proxy reachability only; login and token behavior remain unverified.
>
> **Last updated:** 2026-11-22
>
> **Related documents:**
> [Coding standards](./frontend-coding-standards.md) · [Security standards](./frontend-security-standards.md) · [Testing standards](./frontend-testing-standards.md) · [UI/UX guidelines](./frontend-ui-ux-guidelines.md) · [API integration](./frontend-api-integration.md) · [Workflow](./frontend-workflow.md)

---

## 1. Purpose and Scope

This repository contains **one independently deployable single-page application (SPA)** that is the presentation layer of the RAG Assistant. It is located at `frontend/rag-assistant-ui/`; documentation stays at the repository root.

In scope:

- Chat UI (conversation history, streaming-ready message rendering, citations, markdown, code highlighting).
- Document management UI (upload, processing status, listing, deletion, errors).
- Data source management UI (configuration, schema browsing, permissions, source selection).
- Settings UI (AI model, retrieval, embedding, user preferences).
- Authentication UI integrated with the **existing** backend JWT architecture.

Out of scope for this repository:

- Backend business logic.
- Retrieval, embedding, chunking, or prompt construction.
- Any direct connection to SQL Server, Qdrant, Ollama, or the ONNX model.
- Server-side rendering (SSR).
- A second backend or a BFF (backend-for-frontend). The ASP.NET Core API is the only backend.

The frontend is a **consumer of documented HTTP contracts**. Where a contract does not exist or cannot be verified, the corresponding feature is blocked (see §13).

---

## 2. System Context and Hard Boundaries

```mermaid
flowchart LR
    U[Browser user] -->|HTTPS| SPA["React SPA<br/>RagAssistantWebApp"]
    SPA -->|"JSON /api/*<br/>Bearer access token"| API["ASP.NET Core API<br/>RagAssistantApi"]
    API --> SQL[(SQL Server)]
    API --> Q[(Qdrant)]
    API --> O[Ollama]
    API --> M[ONNX embedding model]

    SPA -. "forbidden" .-> SQL
    SPA -. "forbidden" .-> Q
    SPA -. "forbidden" .-> O
    SPA -. "forbidden" .-> M
```

Non-negotiable boundary rules:

1. The frontend talks **only** to the documented HTTP API (and, if the backend adds one, a documented real-time channel).
2. The frontend never opens a SQL Server connection, a Qdrant gRPC/HTTP connection, or an Ollama request.
3. The frontend never implements retrieval, re-ranking, chunking, prompt assembly, embedding, or authorization decisions.
4. The frontend never executes database queries and never receives database credentials.
5. All protected operations are authorized by the backend. Hiding a control in the UI is a UX affordance, never a security control.
6. No backend business rule is reimplemented in the client. Validation in the client is for UX; the backend remains authoritative.

Violating these rules is an architecture defect, not a code-style issue.

---

## 3. Technology Stack

### 3.1 Selected stack

| Concern | Technology | Baseline | Rationale |
|---|---|---|---|
| UI runtime | React | 19.x | Component model, ecosystem, team requirement |
| Language | TypeScript | 5.9+ (strict) | Compile-time contract safety |
| Build tool | Vite | 8.x (installed 8.3.8) | Fast dev server, native ESM, small config surface |
| Styling | Tailwind CSS | 4.x (`@tailwindcss/vite`) | Utility-first, token-driven theming |
| Component primitives | shadcn/ui | CLI 3.x | Source-owned Radix-based components, no runtime lock-in |
| Radix packages | Dialog, Direction, Dropdown Menu, Slot, Tooltip | installed 2026-11-15 | Accessibility, focus management, and RTL support for the vendored primitives |
| Theming | Small React provider + `.dark` class + CSS variables | implemented | Light/dark/system without `next-themes` |
| UI language | Typed `fa`/`en` catalogs + `LanguageProvider` | implemented | Two shell locales, runtime direction switching; no i18n framework |
| Routing | React Router | 7.x, **library mode** | SPA routing without framework/SSR mode |
| Server state | TanStack Query | 5.x | Caching, retries, cancellation, invalidation |
| Global client state | Zustand | 5.x, only when justified | Minimal store without boilerplate |
| Forms | React Hook Form | 7.66.0 | Uncontrolled form performance |
| Validation | Zod | 4.6.7 | Runtime validation of inputs **and** environment config |
| Form resolvers | `@hookform/resolvers` | 5.2.2 | Required peer pairing for Zod 4 + React Hook Form |
| Icons | Lucide React | current 0.x | Consistent, tree-shakeable icon set |
| Markdown | React Markdown | 10.1.0 | Installed for the chat preview; raw HTML disabled |
| Code highlighting | rehype-highlight + highlight.js | 7.0.2 (highlight.js 11.11.2) | Installed for the chat preview |
| Unit/integration tests | Vitest | major that supports the chosen Vite major | Shares Vite transform pipeline |
| Component tests | React Testing Library | 16.x | Behavior-oriented tests |
| E2E tests | Playwright | current 1.5x | Cross-browser, reliable auto-waiting |
| Package manager | npm | lockfile v3 | Repository has no established alternative |

The scaffold used a portable **Node.js 24.22.3 LTS / npm 11.19.1** toolchain (Vite 8 requires **≥ 20.19 / ≥ 22.12**). `node`/`npm` are still not on the system `PATH`; the portable helper `%LOCALAPPDATA%\nodejs-portable\env.sh` must be sourced before running project commands. See `PROJECT_CONTEXT.md` §4.1.

### 3.2 Approved supporting tooling

These are not feature libraries; they are required quality gates or mandatory peers:

| Package | Why it is required |
|---|---|
| `eslint` 9 (flat config), `typescript-eslint` 8 | Type-aware linting and React hooks rules |
| `eslint-plugin-react-hooks`, `eslint-plugin-jsx-a11y`, `eslint-plugin-react-refresh` | Hook correctness, accessibility, HMR safety |
| `prettier` 3, `eslint-config-prettier` | Deterministic formatting |
| `@types/react`, `@types/react-dom`, `@types/node` | Type definitions |
| `@tailwindcss/vite` | Official Tailwind 4 Vite integration |
| `@testing-library/dom` | Required peer of RTL 16 |
| `@testing-library/jest-dom`, `@testing-library/user-event` | DOM assertions and realistic interaction |
| `jsdom` | Vitest DOM environment |
| shadcn transitive deps (`class-variance-authority`, `clsx`, `tailwind-merge`, Radix packages) | Required by the vendored primitives; do not hand-roll equivalents |
| `openapi-typescript` (optional, later) | Contract type generation once the backend compiles and its OpenAPI document is stable |
| `msw` (optional, dev-only) | Multi-request API simulation in tests; see testing standards |

### 3.3 Explicitly not adopted

Do not add these without a written decision in this document and user approval:

| Rejected | Reason |
|---|---|
| Axios | Native `fetch` plus a typed wrapper is sufficient |
| Redux / Redux Toolkit | TanStack Query covers server state; Zustand covers the little client state left |
| Next.js / Remix | The backend is ASP.NET Core; SSR adds deployment coupling for no current requirement |
| i18next / react-intl | The shell uses typed `fa`/`en` catalogs and needs no framework. Revisit only if locale count, plural rules, or message interpolation grow beyond a typed catalog |
| Animation library (`tw-animate-css`, `framer-motion`) | Two Radix `data-state` keyframes cover dialog/sheet/overlay motion; `prefers-reduced-motion` is honored |
| moment / date-fns | `Intl.DateTimeFormat` covers display; dates arrive as ISO 8601 |
| lodash | Standard ES methods cover current needs |
| styled-components / emotion | Tailwind + CSS variables |
| react-syntax-highlighter / Shiki | Heavier than needed; `rehype-highlight` satisfies the requirement |
| `jwt-decode` | The backend already returns `expiresInSeconds` and expiry timestamps; avoid client-side token parsing for decisions |
| `next-themes` | Next.js-specific; a small theme provider is enough |
| formik | React Hook Form is the chosen form library |
| `uuid` | `crypto.randomUUID()` is available |
| dnd-kit | Native drag-and-drop is enough for upload; only add for reordering with a real requirement |
| List virtualization | Add only after a measured rendering problem |
| `@microsoft/signalr` | No hub exists on the backend; do not install speculatively |
| Error-boundary package | A small class component avoids a dependency for one behavior |

### 3.4 Compatibility notes (verified after scaffolding)

- **React 19 + React Router 7 library mode**: supported; use `createBrowserRouter`, not framework mode.
- **Tailwind 4 + shadcn/ui**: Tailwind 4 uses the `@tailwindcss/vite` plugin and CSS-first configuration; do not generate the legacy `tailwind.config.js`. shadcn must be initialized in Tailwind 4 mode.
- **Zod 4 + React Hook Form**: requires `@hookform/resolvers` 5.x. Do not pair Zod 4 with resolvers 4.x.
- **React Markdown 10**: the `className` prop was removed; wrap the component in a styled container.
- **RTL 16**: `@testing-library/dom` must be installed explicitly as a peer.
- **Vitest and Vite**: current Vitest versions treat `vite` as a **required peer dependency**, not a bundled one, so a mismatched Vite copy breaks resolution. Install a Vitest major whose peer range includes the chosen Vite major and verify with `npm ls vite vitest`.
- **shadcn/ui is not a dependency**: components are copied into `src/components/ui`. Treat them as owned source.
- **Deferred feature libraries**: Zustand is approved but intentionally not installed until a real cross-route need exists. React Hook Form, `@hookform/resolvers`, React Markdown, and rehype-highlight are installed because the login form and chat preview now use them. The chat Markdown pipeline does **not** include `remark-gfm`, `rehype-raw`, or an HTML sanitizer; do not add them speculatively.

> **Verification (2026-11-15):** Dependencies are installed and pinned in `package-lock.json`: React 19.3.1, Vite 8.3.8, Vitest 5.1.0, Tailwind 4.3.5, TypeScript 5.9.3, React Router 7.18.5. `npm ls vite vitest` resolves a single `vite@8.3.8` for `vitest@5.1.0`. ESLint is held at 9.39.5 because the documented baseline and `eslint-plugin-jsx-a11y`'s peer range require it; npm marks that release unsupported upstream, and moving to ESLint 10 requires a plugin compatibility review, so it is deferred. Do not claim a different peer graph without re-running `npm ls`.
>
> **Radix and theming (2026-11-15):** `@radix-ui/react-dialog` 1.3.1, `@radix-ui/react-direction` 1.2.0, `@radix-ui/react-dropdown-menu` 2.2.1, `@radix-ui/react-slot` 1.5.0, and `@radix-ui/react-tooltip` 1.4.1 are direct dependencies. No animation or i18n library was added.

---

## 4. Repository Layout

The React application lives at `frontend/rag-assistant-ui/`; documentation stays under `Docs/`.

```text
RagAssistantWebApp/
├─ AGENTS.md                    # agent entry point (frontend + preserved backend rules)
├─ PROJECT_CONTEXT.md           # verified facts, status, open questions
├─ Docs/Ai/                     # architecture, standards, workflow, changelog, reviews
└─ frontend/
   └─ rag-assistant-ui/
      ├─ src/
      │  ├─ main.tsx            # bootstrap only
      │  ├─ app/                # router, providers, error boundary, navigation, page title
      │  ├─ api/                # http-client, ApiError, wire DTOs
      │  ├─ auth/               # token store, JWT display decoding, session events
      │  ├─ components/
      │  │  ├─ ui/              # button, input, card, dialog, dropdown-menu, tooltip, spinner, skeleton, progress, badge, select
      │  │  └─ shared/          # empty-state, error-state, preview-state-control, theme-menu, language-menu
      │  ├─ features/           # vertical feature modules (auth implemented; chat, documents, data-sources, settings previews)
      │  ├─ layouts/            # app-shell, sidebar, header, mobile-navigation, navigation-list
      │  ├─ pages/              # home, design-system, route-loading, not-found, route-error
      │  ├─ theme/              # ThemeProvider, useTheme
      │  ├─ lib/                # env validation, query client, cn()
      │  ├─ i18n/               # fa/en catalogs, LanguageProvider, useLanguage
      │  ├─ styles/             # Tailwind entry, semantic tokens, dark theme, motion
      │  └─ test/               # setup (jsdom stubs), render helper, auth/API fixtures
      ├─ .env.example
      ├─ components.json        # shadcn CLI configuration
      ├─ eslint.config.js
      ├─ vite.config.ts
      ├─ tsconfig.json
      └─ package.json
```

Planned additions (not created yet): per-feature `api/`, `schemas/`, and wire DTOs for documents/data-sources/settings, real chat `api/` and `schemas/` slices, `e2e/` with Playwright, and self-hosted font assets. The `auth` feature is implemented with `components/`, `preview/`, `routes/`, `types.ts`, and its `index.ts`. The `chat` feature currently has `components/`, `hooks/`, `lib/`, `mock/`, `routes/`, `types.ts`, and `index.ts`; it has **no** `api/` or `schemas/` slice because no chat contract exists. The `documents` feature has `components/`, `hooks/`, `lib/`, `mock/`, `routes/`, `types.ts`, and `index.ts`, also with **no** `api/` or `schemas/` slice because no documents contract exists. The `data-sources` feature has `components/`, `hooks/`, `lib/`, `mock/`, `routes/`, `types.ts`, and `index.ts`; the `settings` feature has `components/`, `hooks/`, `lib/`, `mock/`, `routes/`, `types.ts`, and `index.ts`. Both are previews with no `api/` slice. `src/lib/format-date.ts` holds the shared locale-cached date formatter, and `src/components/shared/preview-state-control.tsx` is the shared DEV-only ready/loading/error switch. `src/pages/design-system-page.tsx` is a static reference and is not a product route.

Authentication layering:

- `src/api/http-client.ts` is the only transport. It owns the base URL, headers, timeout, abort composition, envelope parsing, `401` refresh orchestration, and `ApiError` creation.
- `src/auth/` holds session primitives shared by transport and feature code: the in-memory access token + `sessionStorage` refresh token, JWT display decoding, and the session-expired event. It must not import from `src/features`.
- `src/features/auth/` owns the auth endpoints (`auth-api.ts`), the React `AuthProvider`/`useAuth`, the login route, the account menu, and the `RequireAuth` guard.
- `AuthLayout` mounts `AuthProvider` around both the public `/login` route and the protected subtree, so the state survives navigation between them.

Development preview sign-in (temporary until the API can start):

- `src/features/auth/preview/preview-admin-session.ts` holds a fixed `admin` identity with the `Admin` role. It issues no token and calls nothing; the only state is a `sessionStorage` marker (`preview_admin_session`).
- Every function begins with an `import.meta.env.DEV` guard, so production builds return `null`/`throw` before touching storage and a hand-written marker does not authenticate. The login card is rendered only when `import.meta.env.DEV` and the provider supplied `previewLogin`; the constant folds away in production, and the marker key and preview identity are absent from `dist`.
- `AuthProvider` treats the marker as an authenticated session at startup and on remount, and `logout`/session-expiry clear it. Roles decoded from a real access token (`role` or the `ClaimTypes.Role` URI) are displayed in the account menu; neither roles nor permissions gate any UI.
- This is **not** authentication and must not be described as such. Delete the preview module when real sign-in is usable; the real flow (`login`, `refresh`, `logout`) is unchanged.

Chat preview layering (temporary until a contract exists):

- `src/features/chat/mock/` is the only source of conversations, messages, replies, and sources. It is deliberately isolated, imports nothing from the API layer, and has a header comment instructing removal when the contract lands.
- `src/features/chat/hooks/use-chat-preview.ts` owns preview UI state: active conversation, search, send/stop/regenerate, and a local `setTimeout` that simulates a reply so generating and stop states are exercisable. It must never become the place where a real request is added; real chat gets TanStack Query hooks and an `api/` slice.
- `src/features/chat/lib/` holds feature-local, non-React helpers (clipboard, locale-aware formatting).
- Components receive data and callbacks as props; only the page composes the hook. No component calls `fetch`.
- The page renders a persistent preview banner. Do not remove it while the mock layer exists.

Documents preview layering (temporary until a contract exists):

- `src/features/documents/mock/` is the only source of records. `mock-documents.ts` builds eleven deterministic records; `document-preview-store.ts` is a module-scoped singleton with `subscribe`/`getDocuments`/`addDocument`/`removeDocument` (plus reset helpers for tests) so the list and the details route observe the same data and deletions survive navigation; `preview-upload.ts` only schedules a cancellable timer. The mock layer imports nothing from the API layer and every file carries a delete-when-the-contract-exists header.
- `src/features/documents/hooks/use-documents-query.ts` owns the query contract: it maps `q`, `status`, `type`, `sort`, `page`, and `size` to URL search params (defaults omitted, `replace` writes) and resets the page when a filter, sort, or size changes.
- `src/features/documents/hooks/use-documents-preview.ts` subscribes to the store with `useSyncExternalStore` and derives the visible page through the pure helpers in `lib/query.ts`. A DEV-only preview-state flag produces the loading and error surfaces; the control component is stripped from production builds, so those states are unreachable there (the state plumbing itself is not guaranteed to be tree-shaken).
- `src/features/documents/hooks/use-document-upload.ts` owns the upload queue: synchronous validation via `lib/validation.ts`, a simulated indeterminate phase, and per-row cancellations cleared on removal and unmount.
- `src/features/documents/lib/` holds pure helpers: validation, query parse/serialize/filter/sort/paginate, and locale-aware formatting. No React imports.
- `src/features/documents/types.ts` documents preview view models, not wire DTOs. Real documents integration replaces the whole mock layer with TanStack Query hooks and an `api/` slice.
- The page renders a persistent preview banner plus upload, details, and status-source notices. Do not remove them while the mock layer exists.

Data-sources preview layering (temporary until a contract exists):

- `src/features/data-sources/mock/` is the only source of records, schema trees, and statuses. `data-source-preview-store.ts` is a module-scoped singleton with `subscribe`/`getDataSources`/add/update/remove plus reset helpers, so the list, details, and form routes agree and an edit survives navigation. Every file carries a delete-when-the-contract-exists header.
- `src/features/data-sources/types.ts` documents preview view models, not wire DTOs. `DataSourceRecord` has `hasCredential: boolean` and **no** credential field; the form's `password` never leaves `lib/validation.ts`'s payload builders.
- `src/features/data-sources/lib/validation.ts` owns the Zod create/edit schemas and payload builders. `lib/announcement.ts` carries a one-shot message to the destination page's live region.
- `src/features/data-sources/hooks/use-data-sources.ts` subscribes with `useSyncExternalStore` and holds the DEV-only preview state.
- The list, form, and details pages render a preview badge/notice; the connection-test button is permanently disabled with a visible reason and the schema browser is labelled as example data. Do not remove these while the mock layer exists.

Settings preview layering (temporary until a contract exists):

- `src/features/settings/lib/settings-defaults.ts` holds source-verified defaults with file citations (Ollama, `qwen2.5-coder:7b`, timeout 10 s; chunk 300, overlap 50, top-K 5). `lib/settings-schema.ts` holds the AI and retrieval Zod schemas.
- `src/features/settings/mock/settings-draft-store.ts` is a module-scoped session-only draft store; `hooks/use-settings-drafts.ts` subscribes with `useSyncExternalStore`. Nothing is written to storage.
- Appearance uses the existing `ThemeProvider`/`LanguageProvider` (the only settings that truly persist). General is read-only session/build information. Embedding is read-only and never renders model paths, endpoints, or keys. Similarity threshold is rendered disabled because the backend does not implement it.
- Each server-backed section renders a preview badge/notice stating that saving is session-only and the server configuration is unchanged. Do not remove them while no settings contract exists.

**URL-owned query state:** list state lives in the URL rather than component state, so a reload, a shared link, and back/forward all restore the same search, filter, sort, page, and page size. This is the pattern to reuse for any future list feature; do not duplicate it in `useState`.

Rules:

- `src/api` may be imported by any feature; it must never import from `src/features` or `src/components`.
- `src/components/ui` imports only `lib` and other `ui` primitives.
- Features do not import another feature's internals (see §5).
- `app` may import features; features never import `app`.
- No backend source, SQL scripts, or server configuration live in this repository.
- The build is independent of the backend; the two are deployed separately (§12).

---

## 5. Feature-Based Organization

Each product module is a vertical slice:

```text
src/features/chat/
├─ api/
│  ├─ chat.keys.ts             # TanStack Query key factory
│  ├─ chat.queries.ts          # queryFn / queryOptions
│  └─ chat.mutations.ts        # mutation hooks
├─ components/                 # feature-specific UI
├─ hooks/                      # feature-specific non-API hooks (scroll, composer)
├─ routes/                     # route elements rendered by the router
├─ schemas/                    # Zod schemas for forms/URL state
├─ types.ts                    # feature-local types (not wire DTOs)
└─ index.ts                    # the feature's only public surface
```

Features: `auth`, `chat`, `documents`, `data-sources`, `settings`.

The tree above is the target shape for a contract-backed feature. The implemented `chat` and `documents` slices intentionally omit `api/` and `schemas/` and add `mock/` and `lib/` while they are previews; do not treat the presence of `mock/` as a production pattern.

Boundary rules:

1. Cross-feature imports go through `features/<name>/index.ts` only.
2. A shared element must be genuinely generic before it moves to `components/common` (rule of three, see coding standards).
3. Wire DTOs belong in `src/api/types`; feature types describe UI state and may combine DTOs.
4. Query keys are owned by the feature that fetches the data. A feature that needs another feature's data imports its public query options, not its internal files.
5. No feature owns routing configuration; routes are composed in `app/router.tsx`.

---

## 6. Component Architecture

Layering, from top to bottom:

```text
Route element (app/router.tsx)
  └─ Page (features/*/routes)        — composes sections, owns page-level state
      └─ Feature component           — domain-aware presentation
          └─ Common component        — generic, domain-agnostic
              └─ ui primitive        — shadcn button, dialog, input, …
```

Rules:

- Only route elements and page-level hooks call data hooks. Presentational components receive data and callbacks via props.
- Components never call `fetch` directly. All network access goes through the API layer (see §9).
- Server data is read from TanStack Query at the route/page level and passed down; avoid every leaf subscribing to the same query.
- Layout components (`AppShell`, `Sidebar`, `Header`, `MobileNavigation`) contain no business logic.
- Shared, domain-agnostic components live in `components/shared`: `EmptyState` (icon, title, description, action), `ErrorState` (`role="alert"` panel), `PreviewStateControl` (DEV-only ready/loading/error switch), `ThemeMenu`, and `LanguageMenu`.
- Vendored primitives live in `components/ui`: `Button`, `Input`, `Card`, `Dialog` (center and start-side sheet), `DropdownMenu`, `Tooltip`, `Spinner`, and `Skeleton`. They are composed, never forked per screen.
- Chat feature components (`features/chat/components/`) split into: `ConversationHistory` (new/search/select/delete), `ChatMessageList` (log container, auto-scroll, generating indicator), `ChatMessageItem` (roles, timestamps, actions), `MarkdownMessage` + `CodeBlock` + `CopyButton`, `MessageSources`, `ChatComposer`, and `ChatEmptyState`. They are composed by `ChatPage`; only that page reads the preview hook.
- Documents feature components (`features/documents/components/`) split into: `DocumentUpload` (drop button + hidden picker + live status region), `UploadFileRow` (validating/uploading/done/error row), `DocumentToolbar` (search and selects), `DocumentList` + `DocumentRow`, `DocumentStatusBadge`, `DocumentDeleteDialog`, `DocumentPagination`, `DocumentsLoading`, `PreviewStateControl` (DEV only), and `DocumentDetails`. `DocumentsPage` and `DocumentDetailsPage` compose them and are the only files that read the preview hooks.
- `pages/design-system-page.tsx` demonstrates every primitive in both themes and directions. It is the visual acceptance surface for the design system, not product functionality.
- Split a component when it mixes concerns (data + form + presentation) or exceeds ~200 lines. Line count is a signal, not a target.
- Prefer composition (`children`, render props) over boolean-prop configuration explosions.
- Do not create a wrapper component that only forwards props.

---

## 7. Routing Strategy

React Router 7 in library mode, with `createBrowserRouter` and `RouterProvider`.

**Implemented today:**

| Path | Access | Purpose |
|---|---|---|
| `/login` | public | Credential form; shows a session-expired notice when a stored session could not be restored |
| `/` | authenticated | Landing page; temporary, not the final product home |
| `/chat` | authenticated | Chat UI **preview** backed by isolated mock data; no network calls |
| `/documents` | authenticated | Documents UI **preview**: list, search/filter/sort/pagination, upload; no network calls |
| `/documents/:documentId` | authenticated | Document details **preview**; an unknown id renders an in-shell not-found state |
| `/data-sources` | authenticated | Data sources **preview**: list, statuses, last sync, add action; no network calls |
| `/data-sources/new` | authenticated | Add form **preview** (create mode); no network calls |
| `/data-sources/:sourceId` | authenticated | Source details **preview** with connection metadata and example schema tree; unknown id renders an in-shell not-found state |
| `/data-sources/:sourceId/edit` | authenticated | Edit form **preview**; blank password keeps the preview credential flag |
| `/settings` | authenticated | Settings **preview**: General (default) plus section navigation |
| `/settings/:section` | authenticated | Appearance, AI model, Embedding, or Retrieval section; an unknown section renders an in-shell not-found state |
| `/design-system` | authenticated | Static primitive reference; not part of product navigation |
| `*` | authenticated | Not found (unknown routes are guarded like every other route) |

Every path except `/login` is rendered inside `RequireAuth`, which resolves the session before rendering the shell. The tree is:

```text
AuthLayout (AuthProvider)
├─ /login                      → LoginPage
└─ RequireAuth
   └─ /                        → AppShell
      ├─ index                 → HomePage
      ├─ chat | documents | documents/:documentId
      │  data-sources | data-sources/new | data-sources/:sourceId | data-sources/:sourceId/edit
      │  settings | settings/:section | design-system (lazy)
      └─ *                     → NotFoundPage
```

**Planned once contracts exist** (unchanged target):

| Path | Access | Purpose | Backend readiness |
|---|---|---|---|
| `/` | public | Redirect to `/chat` | — |
| `/login` | public | Sign in | Endpoint exists in source; API route reachable, but login/token behavior not runtime-verified |
| `/chat` | authenticated | New conversation | Preview UI exists (mock data); contract blocked |
| `/chat/:conversationId` | authenticated | Existing conversation | Blocked (no conversation contract) |
| `/documents` | authenticated | Document list and upload | Preview UI exists (mock data); contract blocked |
| `/documents/:documentId` | authenticated | Document details and status | Preview UI exists (mock data); contract blocked |
| `/data-sources` | authenticated | Data source list | Preview UI exists (mock data); contract blocked |
| `/data-sources/:sourceId` | authenticated | Source config and schema | Preview UI exists (mock data); contract blocked |
| `/settings/profile` | authenticated | Account and password | Partial (password change exists) |
| `/settings/ai` | authenticated | Model configuration | Preview UI at `/settings/ai` (session-only drafts); contract blocked |
| `/settings/rag` | authenticated | Retrieval/embedding settings | Preview UI at `/settings/retrieval` and `/settings/embedding`; contract blocked |
| `/settings/preferences` | authenticated | UI preferences | Implemented at `/settings/appearance` (client-only) |
| `*` | public | Not found | — |

Rules:

- Use nested routes with a protected layout (`RequireAuth` renders `<Outlet />` after resolving the session).
- Lazy-load every feature route with `route.lazy` and provide `hydrateFallbackElement`; the shared fallback is a labeled spinner (`pages/route-loading.tsx`). Code-splitting per feature is mandatory.
- Do not lazy-load the shell or login route.
- Guard behavior (implemented):
  - Unauthenticated → redirect to `/login?returnTo=<internal-path>` (pathname + search), using `replace`.
  - `returnTo` is accepted only if it starts with `/`, does not start with `//`, is not the `/login` route, and contains no backslash or control characters; otherwise it is ignored. This prevents open redirects and a login redirect loop.
  - After login, navigate to the validated `returnTo`, otherwise `/` (the planned `/chat` home does not exist yet).
- `RequireAuth` shows a full-page labeled spinner while the session is being restored; it must not flash the login page or the shell.
- An authenticated visitor of `/login` is redirected to the validated `returnTo` or `/`.
- Permission/role-based menu items are a UX hint. The backend still enforces access; handle `401`/`403` responses with a safe UI state.
- Keep filters, pagination, and selected source in URL search params, not in Zustand.
- Configure `ScrollRestoration`; chat pages manage their own scroll position.
- A route-level error boundary renders per-route failures; the router `errorElement` handles unmatched/loader errors.
- Unknown conversation/document ids must render a "not found" state, not a redirected route.

---

## 8. State Management Strategy

| State kind | Owner | Examples |
|---|---|---|
| Server state | TanStack Query | conversations, messages, documents, sources, settings, schema metadata (no feature queries exist yet) |
| Session state | React Context (`AuthProvider`) + module-level token holder (`src/auth/token-store.ts`) | access token in memory, refresh token in `sessionStorage`, current user summary decoded from the access token for display only; **implemented**. In development, a `sessionStorage` preview marker (`preview_admin_session`) substitutes for a session and is ignored in production |
| UI preferences | React Context (`ThemeProvider`, `LanguageProvider`) + `localStorage` | `theme` (`light` \| `dark` \| `system`), `language` (`fa` \| `en`); non-sensitive, applied before first paint |
| URL state | React Router search params | `returnTo` on `/login`; documents list `q`, `status`, `type`, `sort`, `page`, `size` (implemented); future list filters and active source |
| Form state | React Hook Form + Zod resolver | login, data-source create/edit, settings AI/retrieval drafts (implemented); change password (future) |
| Ephemeral UI state | Local `useState` | dialog open, composer text, copied state, per-section save status |
| Chat preview state | Feature hook local state (`useChatPreview`) | seeded mock conversations, search, active id, generating flag; **temporary**, replaced by TanStack Query when a contract exists |
| Documents preview state | Module-scoped store + `useSyncExternalStore` (`features/documents/mock/document-preview-store.ts`) | the eleven preview records shared by the list and details routes; **temporary**, replaced by TanStack Query when a contract exists |
| Data-sources preview state | Module-scoped store + `useSyncExternalStore` (`features/data-sources/mock/data-source-preview-store.ts`) | the five preview records and their statuses shared by list, details, and form routes; **temporary** |
| Settings preview state | Module-scoped store + `useSyncExternalStore` (`features/settings/mock/settings-draft-store.ts`) | session-only AI/retrieval drafts with per-section reset; **temporary**; Appearance remains in `localStorage` via the providers |
| Cross-route client state | Zustand, only if it is needed in 3+ distant places and is not server state | sidebar collapse preference, onboarding dismissal |

Hard rules:

1. **Do not put server data in Zustand.** If it comes from the API, it belongs in TanStack Query.
2. **Do not create a global store for a single screen.** Local state first; lift only when shared.
3. **Do not persist tokens in `localStorage`.** See [security standards](./frontend-security-standards.md).
4. **Clear sensitive caches on logout:** call `queryClient.clear()` and reset the session store. Never show one user's cached data to another.
5. **No Redux.** No duplicate state copies (for example, messages in both a store and the query cache).
6. Derived state is computed, not stored.
7. Theme and language preferences are the only values persisted in `localStorage`; tokens and user data are never stored there.

Theme and direction pipeline:

```text
localStorage / matchMedia  →  ThemeProvider (adds/removes .dark on <html>)
localStorage               →  LanguageProvider (sets <html lang> and dir, serves typed `t`)
language.dir               →  Radix DirectionProvider  →  primitives
```

- The inline bootstrap in `index.html` applies both preferences before first paint to avoid a flash.
- Components read `t` from `useLanguage()`; they never import a catalog directly (the error boundary is the sole exception because it renders outside the providers and reads the applied `documentElement.lang`).

Session pipeline (implemented):

```text
refresh token (sessionStorage)  →  AuthProvider restore effect  →  POST /api/auth/refresh
access token (memory)           →  httpClient Authorization header  →  backend
401 from a protected request    →  httpClient single-flight refresh  →  retry once
refresh failure                 →  clear tokens → emit `session-expired` → AuthProvider → /login
```

- `src/auth/token-store.ts` is the only place tokens are read or written. The access token never leaves memory; the refresh token lives in `sessionStorage` (interim, see AD-07).
- `src/auth/jwt.ts` decodes the access payload for display (`id`, `username`, `email`); failures degrade to nulls. Decoded values are never used for authorization.
- `src/auth/session-events.ts` carries a single `session-expired` signal from the transport to `AuthProvider`, so a burst of failed requests produces one redirect.
- `AuthProvider` exposes `{ status, user, login, logout }`; `status` is `restoring` when a refresh token exists at startup, so guards show a spinner rather than the login page.

TanStack Query defaults (initial proposal; change only with a documented reason):

```ts
{
  retry: (failureCount, error) => !isClientError(error) && failureCount < 1,
  staleTime: 30_000,
  gcTime: 5 * 60_000,
  refetchOnWindowFocus: false,
  refetchOnReconnect: true,
}
```

Chat queries use `staleTime: 0`. Lists that change after mutations are invalidated explicitly, not polled.

---

## 9. Data Fetching Strategy

Mandatory layering:

```text
Component  →  feature data hook  →  TanStack Query  →  feature api module  →  httpClient  →  backend
```

- Components never import `httpClient` directly.
- Feature API modules own endpoint paths, request shapes, and response parsing for that feature.
- `src/api/http-client.ts` owns base URL, headers, cancellation, envelope parsing, and error normalization.
- Implemented today: `src/api/http-client.ts`, `src/api/api-error.ts`, `src/api/types/auth.ts`, and the `src/features/auth` module (login page, `AuthProvider`, `RequireAuth`, `AuthLayout`, `UserMenu`, `auth-api` request helpers, `safe-return-to`). No other feature calls the API.
- The chat preview calls **nothing**. Its data comes from `features/chat/mock/` and a local timer; there are no query keys, mutations, or DTOs for chat. When the backend contract is verified, add a real `api/` slice and query keys, and delete the mock module.
- The documents preview calls **nothing**. Its data comes from `features/documents/mock/` and a module-scoped in-memory store; there are no query keys, mutations, upload requests, or DTOs. When the contract is verified, add a real `api/` slice with list/detail/upload/delete/retry hooks and delete the mock module outright.
- Query keys come from a typed key factory per feature:

```ts
export const chatKeys = {
  all: ['chat'] as const,
  conversations: () => [...chatKeys.all, 'conversations'] as const,
  conversation: (id: string) => [...chatKeys.all, 'conversation', id] as const,
};
```

Rules:

- Pass the query signal (`queryFn: ({ signal }) => ...`) to every request so unmounting cancels it.
- Mutations invalidate the narrowest key that changed; do not invalidate the whole cache after every write.
- Optimistic updates only for reversible, low-risk UI (for example, renaming a conversation). Roll back on error. Never optimistically confirm document deletion or upload completion.
- Polling is allowed only for processing state, with an interval and a terminal condition. Document polling is blocked until an endpoint exists.
- No request waterfall by design: fetch independent data in parallel.
- No data fetching in render bodies.
- Contract mismatches must fail loudly in development (see API integration, envelope validation).

---

## 10. Error Boundaries

Two levels:

1. **Root boundary** (`app/error-boundary.tsx`): catches unexpected render/lifecycle errors, renders a bilingual fallback (chosen from the applied `<html lang>`) with "reload" and "go home", and logs a redacted diagnostic.
2. **Route boundary** (router `errorElement` / per-route wrapper): isolates a failing module so the shell and navigation remain usable.

Rules:

- Expected API errors (validation, 401, 403, 404, 409, 500 from the envelope) are handled **inline** by the component, not thrown to a boundary.
- Boundaries reset on navigation (key by `location.key` or pathname).
- Never render raw exception messages, stack traces, tokens, or response bodies in a boundary.
- No extra error-boundary library; implement one class component.
- React Query `onError` is for side effects (logging, toast), not for rendering.
- 404 and permission states are normal UI states, not boundary failures.

---

## 11. Environment Configuration

Configuration is read from `import.meta.env`, validated once at startup with Zod, and exported from `src/lib/env.ts`. The app fails fast with a readable developer error if configuration is invalid.

| Variable | Implemented | Default | Notes |
|---|---|---|---|
| `VITE_API_BASE_URL` | yes | `""` (same origin) | Empty string means same-origin `/api`; an absolute http(s) origin is allowed |
| `VITE_APP_ENV` | yes | `development` | `development` \| `staging` \| `production`; shown in the desktop sidebar footer |
| `VITE_ENABLE_DEVTOOLS` | no | — | Not present in `src/lib/env.ts`; TanStack Query devtools are not installed yet |
| `E2E_BASE_URL` | no | — | Reserved for Playwright config; Playwright is not installed yet |
| `E2E_USERNAME` / `E2E_PASSWORD` | no | — | Reserved for E2E only, via an untracked `.env.e2e.local`; never committed |

The implemented schema lives in `frontend/rag-assistant-ui/src/lib/env.ts` and exports only `{ apiBaseUrl, appEnv }`. Add a variable there first, then to `.env.example`, then to this table.

Rules:

- Every `VITE_*` value is **public** and ends up in the browser bundle. Never put secrets, API keys, connection strings, or tokens there.
- Commit `.env.example` with placeholders; commit no real `.env` file.
- Do not read `process.env` in client code.
- Development uses the Vite proxy for `/api` (see below), so no CORS change is needed in development.

---

## 12. Deployment Topology

The frontend and backend are **built and deployed independently** and have no shared code or shared build.

```mermaid
flowchart LR
    B[Browser] -->|HTTPS| RP[Reverse proxy / static host]
    RP -->|"/, /assets/*"| STATIC["Frontend dist/"]
    RP -->|"/api/*"| API["ASP.NET Core API"]
```

- Development: Vite dev server on `5173` proxies `/api` to `https://localhost:7189` (the backend `https` profile). Certificate verification is disabled only for this localhost dev proxy because ASP.NET uses a development certificate.
- Production: the frontend is static files; `/api` is routed to the backend by a reverse proxy on the **same origin**. This is required because the backend currently has **no CORS policy** (verified: no `AddCors`/`UseCors` in `Program.cs`).
- Do not "fix" this by adding a permissive CORS policy in the frontend repo, and do not ask the browser to bypass CORS.
- SPA fallback: unknown non-`/api` paths must serve `index.html`.
- Cache `/assets/*` immutably (hashed filenames); serve `index.html` with no-cache.
- Frontend and backend must tolerate **version skew**: deploy order must not break an in-flight page. Avoid destructive API shape assumptions; degrade gracefully on unknown fields.
- HTTPS is mandatory outside local development.
- The backend's `UseHttpsRedirection` behavior depends on the launch profile; verify the effective URL when integrating, rather than assuming.

---

## 13. Module Readiness Matrix

Any module marked **Blocked** may have UI scaffolding only if it is clearly non-functional and not presented to users as working. Do not invent endpoints.

| Module | Backend evidence (2026-11-16) | Frontend status |
|---|---|---|
| Authentication | 5 routes in `AuthController`; Swagger and the Vite proxy are reachable as of 2026-11-22; login/token behavior has not been exercised | **Implemented** (login, session restore, logout, route guards, account menu); live authentication verification remains outstanding |
| Chat | `ChatController` exists in an uncommitted, unverified working tree; no streaming or persistence endpoints | **UI preview implemented** with isolated mock data; no API call. Real integration **blocked** |
| Conversation management | Tables `chat.ChatConversations`, `ChatMessages`, `ChatMessageSources` exist; no controller | **UI preview only**: history/search/delete operate on mock state. Blocked |
| Document upload | `IIndexingService`/`IRagService.UploadFile` exist internally; no HTTP endpoint, no documented size/type limits | **UI preview implemented** with validation and an indeterminate simulated phase; no API call. Real integration **blocked**; the chat composer attachment control remains disabled |
| Document listing/details/deletion | `doc.Document` table exists; no controller, no status or progress column | **UI preview implemented** (list, search/filter/sort/pagination, details, delete). No API call; status values are preview labels. Blocked |
| Data sources | `SiteUserDataSource` only; no source-type registry, schema, or connection-test endpoint | **UI preview implemented** (list, add/edit/delete, details, example schema browser). No API call; SQL Server only; connection test disabled. Blocked |
| Settings | Configuration is server-side `appsettings`; no endpoints; RAG services commented out in DI | **UI preview implemented** (General read-only, Appearance real, AI/Retrieval session-only drafts, Embedding read-only, similarity threshold disabled). No API call. Blocked |
| Streaming / stop generation | No SSE, `IAsyncEnumerable`, SignalR, or hub registration | **Blocked**; the stop control only cancels the local mock reply timer |
| Citations | `Conversation` carries only `messageType` + `text`; sources are not returned | **Blocked**; source cards display mock fields only |

Blocked modules are not an excuse to fake data in production code. Prototype data may exist only behind a development flag that cannot ship, and only with explicit approval.

---

## 14. Architecture Decisions

| ID | Decision | Status | Consequence |
|---|---|---|---|
| AD-01 | React SPA built with Vite, no SSR | Decided | Simple static deployment; no SEO/server rendering |
| AD-02 | React Router 7 **library mode** | Decided | No framework plugin, no server loaders; all data fetching is client-side |
| AD-03 | Feature-based vertical slices | Decided | Clear ownership; enforced import boundaries |
| AD-04 | TanStack Query is the only server-state cache | Decided | No duplicated API state in Zustand |
| AD-05 | Zustand is opt-in, not default | Decided | Adds a dependency only when justified |
| AD-06 | Single shared HTTP client based on `fetch` | Decided | One place for auth, cancellation, and envelope handling |
| AD-07 | Access token in memory; refresh token in `sessionStorage` (interim) | Decided, implemented; backend cookie support still outstanding | Survives reload per tab; XSS exposure remains; see security doc |
| AD-08 | Same-origin reverse proxy in production; Vite proxy in development | Decided | Avoids backend CORS changes; requires deployment configuration |
| AD-09 | No direct infra access from the browser | Decided | Security boundary |
| AD-10 | Persian-first, bilingual (`fa`/`en`) UI shell | Decided, implemented | Typed catalogs, logical CSS, self-hosted Vazirmatn stack; RTL is the default, LTR is supported |
| AD-11 | Exact dependency versions pinned in `package-lock.json` at scaffold | Decided | Reproducible builds |
| AD-12 | No streaming implementation until a backend contract exists | Decided | UI may show non-streaming behavior only |
| AD-13 | Radix-backed vendored primitives; no animation or i18n library | Decided | Accessibility and focus management come from Radix; motion is two CSS keyframes |
| AD-14 | Persist only theme and language in `localStorage` | Decided | No sensitive data in browser storage; preferences apply before first paint |
| AD-15 | Chat ships as a UI preview with isolated mock data and a visible banner until the backend contract is verified | Decided, implemented | Exercises the interface honestly without inventing endpoints; `mock/` must be deleted when real chat lands |
| AD-16 | Documents ship as a UI preview with isolated mock data and visible notices until the backend contract is verified | Decided, implemented | Uploads show an indeterminate preview phase and never fabricate a percentage; `mock/` must be deleted when real documents land |
| AD-17 | List query state (`q`, `status`, `type`, `sort`, `page`, `size`) is owned by URL search params, with defaults omitted and `replace` writes | Decided, implemented for documents | Reload, shared links, and back/forward restore the same view; reuse for future lists instead of component state |
| AD-18 | Data sources ship as an honest UI preview with isolated mock data, a fixed SQL Server example type, a disabled connection test, and transient-only credentials | Decided, implemented | CRUD, validation, and the schema tree are reviewable without inventing an endpoint or storing a secret; `mock/` must be deleted when the contract lands |
| AD-19 | Settings ship as an honest preview: Appearance persists in this browser; General is read-only; AI/Retrieval are session-only drafts; Embedding is read-only server-managed; unsupported options are disabled | Decided, implemented | The layout and validation are exercisable without implying server persistence; nothing is sent to the backend |
| AD-20 | A development-only preview admin sign-in unblocks authenticated-page review while the API cannot start: no token, no request, a DEV-guarded `sessionStorage` marker, visible bilingual labelling, UI-only roles | Decided, implemented | The flow is reviewable without faking authentication; production builds contain no marker check, no preview identity, and no login card |

---

## 15. Non-Goals (for the initial implementation)

- Offline-first behavior, service workers, or PWA installation.
- Server-side rendering, static site generation, or edge rendering.
- Multi-tenant theming or white-labeling.
- Additional locales beyond Persian and English, or an i18n framework (the typed `fa`/`en` catalog is sufficient for the shell).
- Direct integration with SQL Server, Qdrant, Ollama, or model files.
- Micro-frontends or runtime module federation.
- A second state-management system alongside TanStack Query.
