# PROJECT_CONTEXT.md — RagAssistantWebApp

> **Purpose:** Give any AI agent or developer the verified state of this repository and its backend dependency without re-exploring everything.
> **Generated / verified:** 2026-11-22
> **This repository:** documentation plus the **frontend foundation, layout/design system, authentication, and mock-data chat, documents, data-sources, and settings UI previews** at `frontend/rag-assistant-ui/`. No product feature is connected to a backend except authentication; chat, documents, data sources, and settings are previews.
> **Backend baseline:** `../RagAssistantApi` at commit `afd92ec` (`Chat Method`), branch `main`. **The working tree is dirty** at inspection on 2026-11-16; the backend was read only and not modified from this repository.
> **Backend reachability:** On 2026-11-22, `https://localhost:7189/swagger/index.html` and `/swagger/v1/swagger.json` returned HTTP 200. A GET to `/api/auth/login` through the Vite proxy returned HTTP 405, confirming the request reached the POST-only API route. Login/token behavior was not exercised. A prior `dotnet run` attempt on 2026-11-17 failed JWT secret validation; the current listening process/configuration was not inspected.
> **Instruction precedence:** `AGENTS.md` and `Docs/Ai/*` govern work. This file is a map; read the source before changing it.

---

## 1. Current Repository State

```text
RagAssistantWebApp/
├─ AGENTS.md
├─ PROJECT_CONTEXT.md
├─ Docs/Ai/            (standards, workflow, changelog, reviews)
└─ frontend/
   └─ rag-assistant-ui/  (React + TypeScript + Vite foundation)
```

Documentation created on 2026-11-15:

| File | Status |
|---|---|
| `AGENTS.md` | Created (frontend agent instructions; backend rules preserved by reference) |
| `PROJECT_CONTEXT.md` | Created (this file) |
| `Docs/Ai/frontend-architecture.md` | Created |
| `Docs/Ai/frontend-coding-standards.md` | Created |
| `Docs/Ai/frontend-security-standards.md` | Created |
| `Docs/Ai/frontend-testing-standards.md` | Created |
| `Docs/Ai/frontend-ui-ux-guidelines.md` | Created |
| `Docs/Ai/frontend-api-integration.md` | Created |
| `Docs/Ai/frontend-workflow.md` | Created |
| `Docs/Ai/CHANGELOG_AI.md` | Created |

Frontend foundation, layout/design system, authentication, and chat, documents, data-sources, and settings UI previews (2026-11-15 → 2026-11-17, verified by executed commands — see §1.1):

| Area | Present |
|---|---|
| Build | `package.json`, `package-lock.json`, `vite.config.ts`, three `tsconfig*.json`, `index.html` with no-flash theme/language bootstrap |
| Quality | `eslint.config.js`, `.prettierrc.json`, `.prettierignore`, `.gitignore`, `.env.example` |
| App shell | `src/main.tsx`, `src/app/*` (router, providers, navigation, page title, error boundary), `src/layouts/*` (app shell, sidebar, header, mobile navigation sheet, navigation list) |
| Pages/routes | Login, home, chat preview, documents preview + document details preview, data sources list/form/details previews, settings preview (`/settings` and `/settings/:section`), static `/design-system` reference, route-loading fallback, 404, route error |
| Design system | Semantic tokens (including sidebar and code-highlight tokens), light/dark themes, Radix-backed primitives in `src/components/ui`, shared `EmptyState`/`ErrorState`/`PreviewStateControl`, native-select `Select`, `Badge`, `Progress` |
| Internationalization | Typed `fa`/`en` catalogs, `LanguageProvider`, `<html lang/dir>` switching, Radix `DirectionProvider` |
| Transport | `src/api/http-client.ts` (bearer, timeout, abort, envelope parsing, single-flight refresh), `src/api/api-error.ts`, `src/api/types/*` |
| Session | `src/auth/token-store.ts` (access in memory, refresh in `sessionStorage`), `src/auth/jwt.ts` (display-only decoding), `src/auth/session-events.ts` |
| Auth feature | `src/features/auth/*`: `AuthProvider`, `RequireAuth`, `AuthLayout`, login page + schema + error mapping, safe `returnTo`, account `UserMenu`; plus a **development-only** preview admin sign-in (`preview/preview-admin-session.ts`) that issues no token and makes no request |
| Chat preview | `src/features/chat/*`: page, conversation history/search/delete dialog, message list, Markdown + highlighted code, copy/regenerate actions, expandable mock sources, composer (Enter/Shift+Enter, stop, disabled attachment), empty/generating states, mock data and preview hook; **no HTTP calls** |
| Documents preview | `src/features/documents/*`: list with URL-owned search/status/type/sort/page state, drag-and-drop + picker upload with validation and an indeterminate (never percentage) preview phase, status badges, delete confirmation, `/documents/:documentId` details route, empty/loading/error/filtered states, module-scoped in-memory store; **no HTTP calls** |
| Data sources preview | `src/features/data-sources/*`: list, add/edit forms (RHF + Zod), delete confirmation, `/data-sources/:sourceId` details with connection metadata and a keyboard-accessible schema tree, module-scoped in-memory store, DEV-only loading/error control; SQL Server only, connection test disabled, **no HTTP calls and no browser database access** |
| Settings preview | `src/features/settings/*`: `/settings` + `/settings/:section` with General, Appearance, AI model, Embedding, and Retrieval sections; Appearance is real (existing providers), General is read-only, AI/Retrieval are in-memory validated drafts seeded from source-verified defaults, Embedding is server-managed/read-only; **no HTTP calls** |
| Shared helpers | `src/lib/format-date.ts` (locale-cached date formatting used by chat, documents, and data sources), `src/components/shared/preview-state-control.tsx` (DEV-only ready/loading/error switch) |
| Markdown | `react-markdown@10.1.0` with `rehype-highlight@7.0.2`; raw HTML disabled; `remark-gfm` is **not** installed, so Markdown tables/GFM are unsupported |
| Tests | Vitest + RTL harness with Radix jsdom stubs, session seeding, fetch stub helpers; 230 tests in 27 files |
| Not present | `e2e/`, Playwright, TanStack devtools, Zustand, `remark-gfm`, self-hosted font files, change-password/logout-all UI, real chat/documents/data-source/settings API integration |

**Do not claim any product feature beyond authentication is integrated, or that chat, document management, data sources, or settings work.** The application renders a responsive shell, navigation, a design-system reference, and chat/documents/data-sources/settings UI previews backed by isolated mock data. The only backend calls are `login`, `refresh`, and `logout`; no other page makes a network call. The development-only preview sign-in is not authentication: it creates a local admin identity with no token, is unavailable in production builds, and is documented in §5 (AD-20).

### 1.1 Verified commands and results (latest run 2026-11-17)

Run from `frontend/rag-assistant-ui/` with portable Node 24.22.3 / npm 11.19.1:

| Command | Result |
|---|---|
| `npm install` (foundation) | Succeeded; 373 packages added; `package-lock.json` written |
| `npm install` after layout dependencies | Succeeded; Radix dialog/direction/dropdown-menu/slot/tooltip added |
| `npm install react-hook-form @hookform/resolvers` | Succeeded; `react-hook-form@7.66.0`, `@hookform/resolvers@5.2.2` (Zod 4 compatible) |
| `npm install react-markdown rehype-highlight` | Succeeded; `react-markdown@10.1.0`, `rehype-highlight@7.0.2` (highlight.js 11.11.2) |
| `npm run typecheck` (`tsc -b`) | Passed, no errors (latest run 2026-11-17) |
| `npm run lint` (`eslint .`) | Passed, no findings (latest run 2026-11-17) |
| `npm run test` (`vitest run`) | **230/230 tests passed in 27 files** (latest run 2026-11-17, after the preview sign-in addition) |
| `npm run build` (`tsc -b && vite build`) | Succeeded; CSS 46.06 kB (8.86 kB gzip), main JS 602.50 kB (186.04 kB gzip), data-sources chunk 30.09 kB (7.32 kB gzip), documents chunk 28.41 kB (8.36 kB gzip), settings chunk 12.51 kB (3.19 kB gzip), chat chunk 312.38 kB (97.88 kB gzip), shared `empty-state` chunk 81.53 kB, `format-date` chunk 1.15 kB; one chunk >500 kB advisory |
| Browser check (2026-11-15 layout task) | 360, 768, and 1440 px verified in Persian/English and light/dark; no console errors; no horizontal overflow |
| Browser check (2026-11-16 auth task) | Scripted DOM interaction against the dev server with a mocked `fetch`: guard redirect, empty-field validation, invalid credentials, successful login + `returnTo`, session restore (real 502 failure path and a stubbed success path), logout, account menu, theme and language switches. **Screenshots not captured** — the browser tool reported an unavailable viewport (0×0) |
| Browser check (2026-11-16 chat task) | Headless Chrome over CDP at 1440×900, 768×900, and 360×740 in `fa`/`en` and light/dark. Verified sidebar visibility, mobile history sheet, Markdown/code highlighting, source expansion, Enter-to-send with generating/stop states, and no page-level horizontal overflow; screenshots stored under `Docs/Ai/reviews/assets/2026-11-16-chat/` |
| Browser check (2026-11-17 documents task) | Headless Chrome over CDP at 1440×900, 768×900, and 360×740 in `fa`/`en` and light/dark, plus the details route. Verified drag-and-drop upload (indeterminate bar, no percentage text), `.txt` rejection, URL-persisted search/filter/sort/pagination surviving reload, delete confirmation (cancel and confirm), disabled retry, unknown-id not-found, DEV-only loading/error states, `dir`/`lang`/theme correctness, no page-level horizontal overflow, icon+text status badges, ≥44 px mobile action targets, and no Persian documents copy in English mode; 12 screenshots and raw results under `Docs/Ai/reviews/assets/2026-11-17-documents/` |
| Browser check (2026-11-17 data-sources/settings task) | Headless Chrome over CDP with a stubbed `/api/auth/refresh`, 16 screenshots at 1440×900, 768×900, and 360×740 in `fa`/`en` and light/dark covering the list, details with schema, create-form validation errors, delete dialog, every settings section, and the created record. Verified `lang`/`dir`/`.dark`, zero page-level horizontal overflow (the settings nav overflow at 360 px was found and fixed with `min-w-0`), localized headings, icon+text status badges, preview badges/notices, LTR hosts/ids, no Persian data-sources/settings copy in English mode, add/edit/delete flows, blank-password credential retention, password absent from DOM/storage after save, disabled connection test with reason, schema tree mouse/keyboard behavior, DEV loading/error, appearance persistence across reload, AI/retrieval session-only save and reset, overlap validation, and `/settings/nope` + `/data-sources/nope` not-found states. `npm run preview` on the production build showed no DEV control in the DOM (`aria-pressed` count 0). Screenshots and `verification-report.json` are under `Docs/Ai/reviews/assets/2026-11-17-data-sources-settings/` |
| Browser check (2026-11-17 preview sign-in) | Headless Chrome over CDP on the dev server: the Persian preview card renders, one click signs in with no `fetch` call, the account menu shows `admin` / `admin@example.com` / `Role: Admin`, the local marker survives a reload, English at 360 px shows the card with no Persian text and no overflow (44 px target), logout clears the marker and returns to `/login`. On the production build (`npm run preview`) the card is absent, the marker key cannot be set into a session, and a hand-written marker does not authenticate (the app stays on `/login`). 3 screenshots and `verification-report.json` under `Docs/Ai/reviews/assets/2026-11-17-preview-admin/` |
| `npm audit --omit=dev` | **0 production vulnerabilities** |
| `npm audit` (full tree) | 7 moderate, all dev-only (`typescript-eslint` → `minimatch`, GHSA-g3hv-75wg-m249); not auto-fixed because the fix downgrades tooling |
| `npm run e2e` | Not available; Playwright is not installed and no runnable backend exists |

Screenshots: layout task under `Docs/Ai/reviews/assets/2026-11-15-layout/`; chat task under `Docs/Ai/reviews/assets/2026-11-16-chat/`; documents task under `Docs/Ai/reviews/assets/2026-11-17-documents/`; preview sign-in under `Docs/Ai/reviews/assets/2026-11-17-preview-admin/`. No screenshots exist for the authentication task.

### 1.2 Folder-name note

The pre-existing empty directory was `Docs/AI`. It has been normalized to `Docs/Ai/` to match the backend's convention and the path referenced by all documents. On Windows these names resolve to the same directory; the canonical path is now `Docs/Ai/`.

### 1.3 Related repositories (out of scope)

- `../RagAssistantApi` — the ASP.NET Core backend. Authoritative for all API contracts, authorization, persistence, RAG, and database rules.
- `../RagAssistant` — an older Blazor-based application exists in a sibling folder. It is **not** part of this repository, is not maintained here, and must not be treated as a contract source or a design reference for the React app.

---

## 2. Status Legend

| Status | Meaning |
|---|---|
| **Verified** | Read directly from source or observed by an executed command |
| **Planned** | Decided in documentation; not implemented |
| **Unknown / Unverified** | Not confirmed; requires inspection or execution |
| **Blocked** | Cannot proceed until a dependency is resolved |

---

## 3. Backend Facts Verified on 2026-11-15

### 3.1 Platform

| Item | Fact | Status |
|---|---|---|
| Runtime | ASP.NET Core 8 (`net8.0`) | Verified (project files) |
| API style | MVC controllers, no versioning | Verified (`Program.cs`, controllers) |
| Auth | Own JWT Bearer (HMAC-SHA256), not Keycloak/OIDC | Verified (`JwtTokenService`, `Program.cs`) |
| Access token lifetime | 15 minutes | Verified (options + `appsettings.json`) |
| Refresh token lifetime | 7 days | Verified (options + `appsettings.json`) |
| Refresh rotation | Family-based; reuse revokes the family | Verified (`SqlRefreshTokenStore.RotateAsync`) |
| Security stamp | Validated against the DB on every authenticated request | Verified (`SecurityStampValidator`) |
| Authorization | Claim/permission policies (`Permission:{key}`) and roles | Verified (`PermissionPolicyProvider`, `PermissionHandler`) |
| Known permissions | `documents.read`, `documents.create`, `documents.delete`, `chat.read`, `chat.create`, `users.read`, `users.manage` | Verified (`PermissionConstants`) |
| Known roles | `admin`, `user`, `manager` | Verified (backend context + constants) |
| JSON casing | camelCase (ASP.NET Core web defaults; no custom options) | Verified (`Program.cs`) |
| CORS | None | Verified (no `AddCors`/`UseCors`) |
| Rate limiting | None | Verified (no rate limiter) |
| Central exception handling | `GlobalExceptionHandler` exists but is not registered | Verified (backend context; `Program.cs`) |
| Swagger | Development only at `/swagger` | Verified (`Program.cs`) |
| Dev URLs | `http://localhost:5000`, `https://localhost:7189`, IIS `http://localhost:37177` | Verified (`launchSettings.json`) |
| Test project | `RagAssistant.Tests` (xUnit 2.9.2, NSubstitute) | Verified (project file) |
| Test execution | Not run from this frontend task; backend tests remain out of scope | Verified |

### 3.2 Build and runtime state

```text
dotnet build RagAssistant.Api.slnx -v m
→ Build succeeded, 0 Warning(s), 0 Error(s)        (2026-11-16, dirty working tree)

dotnet run (2026-11-17)
→ InvalidOperationException: Authentication:Jwt:SecretKey must be at least 32 characters.
→ no process listening on 5000 / 7189 / 37177

HTTPS reachability (2026-11-22, read-only):
→ `https://localhost:7189/swagger/index.html` → HTTP 200
→ `https://localhost:7189/swagger/v1/swagger.json` → HTTP 200
→ Vite proxy GET `/api/auth/login` → HTTP 405 (expected for this POST-only route; confirms proxy routing, not successful authentication)
```

The build blocker (`ChatController.cs:31`) recorded on 2026-11-15 is **resolved in the uncommitted working tree**. The uncommitted tree also modifies `ChatController`, `Program`, the project file, `appsettings`, `ZareAssistantContext`, and backend docs, and adds `Utility/ConfigurationExtensions.cs`. Because the tree is dirty and moving, treat the chat path as **unverified**: this repository did not re-inspect its runtime behavior and does not modify it.

Consequence: HTTPS and the `/api` Vite proxy are reachable on this workstation. Authentication behavior and token issuance have not been tested; the GET probe only confirmed that the POST-only login route responds through the proxy. Do not assume the earlier JWT startup blocker is resolved in source: the active process/configuration was not inspected.

### 3.3 HTTP surface (source-verified)

| Method | Route | Auth | Status |
|---|---|---|---|
| POST | `/api/auth/login` | Anonymous | Verified source; returns 204 on invalid credentials; **called by the login page** |
| POST | `/api/auth/refresh` | Anonymous | Verified source; **called by session restore and the 401 handler** |
| POST | `/api/auth/logout` | Anonymous (refresh token in body) | Verified source; **called on sign-out** |
| POST | `/api/auth/logout-all` | `[Authorize]` | Verified source; no UI |
| POST | `/api/auth/change-password` | `[Authorize]` | Verified source; no UI |
| POST | `/api/Chat/Chat` | None declared | Unverified; unusable |
| GET/DELETE | `/api/test/*` | Mixed/incomplete | Demo only; must not be used |
| GET | `/WeatherForecast` | Anonymous | Template leftover |

No endpoints exist for:

- Registration (`/api/auth/register`), password reset, MFA, or `/me`.
- Conversations (list, create, rename, delete).
- Documents (upload, list, details, delete, status).
- Data sources (list, configure, schema, permissions).
- Settings (model, retrieval, embedding, preferences).
- Streaming, SSE, SignalR, hubs.

### 3.4 Response envelope

`ApiResponse<T>` fields: `isSuccess`, `value`, `message`, `errors`, `statusCode`.

Verified defects that affect clients:

- Controllers return the object rather than an `ActionResult`, so failures usually arrive with **HTTP 200**.
- `Failure(message, errors, statusCode)` ignores `statusCode` and writes **400** into the body.
- Login returns **HTTP 204 with no body** for invalid credentials.
- Unhandled exceptions are not mapped to a stable JSON error shape.

The frontend must decide success from HTTP status plus `isSuccess`, never from the body's `statusCode` alone.

### 3.5 Configuration

- `appsettings.json` now contains `Authentication:Jwt`, `ConnectionStrings`, `Ollama`, `Qdrant`, and `Embedding` sections.
  - This contradicts the backend's `Docs/Ai/PROJECT_CONTEXT.md` (TD-03), which states the RAG sections are missing. The backend document is stale on this point.
  - Values are not reproduced here; backend secrets must not be copied into this repository.
- The frontend never reads backend configuration.

### 3.6 Backend implementation that exists but is not exposed

- PDF ingestion: load → clean → chunk (300 tokens, 50 overlap) → embed → Qdrant upsert.
- Retrieval: top-5 vector search; prompt assembly; Ollama chat completion.
- Persistence: `chat`, `doc`, `usr`, and `Authentication` schemas via EF Core.
- Important gaps: no ownership enforcement in ingestion, two unmapped identity models (`Authentication.Users` vs `usr.SiteUser`), no migrations or SQL scripts in the backend repository, no per-request authorization on the future chat/document endpoints.

---

## 4. Frontend Architecture

Foundation, layout/design system, and authentication exist at `frontend/rag-assistant-ui/`; other product modules do not. Items below are the decided architecture, with implementation status marked.

### 4.1 Technology decisions

| Area | Decision | Installed version | Status |
|---|---|---|---|
| UI | React 19.x | 19.3.1 | Implemented |
| Language | TypeScript strict | 5.9.3 | Implemented |
| Build | Vite 8.x | 8.3.8 | Implemented |
| Styling | Tailwind CSS 4.x via `@tailwindcss/vite` | 4.3.5 | Implemented |
| Components | shadcn/ui (vendored) | local primitives | Implemented: Button, Input, Card, Dialog, DropdownMenu, Tooltip, Spinner, Skeleton |
| Component primitives | Radix UI | dialog 1.3.1, direction 1.2.0, dropdown-menu 2.2.1, slot 1.5.0, tooltip 1.4.1 | Implemented |
| Theming | Light/dark/system provider + `.dark` class + tokens | local implementation | Implemented |
| Routing | React Router 7.x, library mode | 7.18.5 | Implemented |
| Server state | TanStack Query 5.x | 5.107.1 | Provider installed; no server query yet |
| Client state | Zustand only when justified | — | Deferred until justified |
| UI preferences | React Context + `localStorage` (`theme`, `language`) | local implementation | Implemented; non-sensitive values only |
| Forms | React Hook Form 7.x | 7.66.0 | Implemented for login |
| Validation | Zod 4.x + `@hookform/resolvers` | 4.6.7 / 5.2.2 | Implemented (env schema, login schema, token schema) |
| Icons | Lucide React | 1.73.0 | Implemented |
| Markdown | React Markdown 10.x (no raw HTML) | 10.1.0 | Implemented in the chat preview |
| Code highlighting | rehype-highlight | 7.0.2 (highlight.js 11.11.2) | Implemented in the chat preview |
| Unit tests | Vitest + jsdom | 5.1.0 / 31.0.1 | Implemented |
| Component tests | React Testing Library 16.x | 16.3.3 | Implemented |
| E2E | Playwright | — | Deferred until an integration path exists |
| Package manager | npm | 11.19.1 | Implemented |
| Language/locale | Persian-first, bilingual `fa`/`en` shell | — | Implemented (runtime direction switching) |

Versions are pinned in `frontend/rag-assistant-ui/package-lock.json` with caret ranges in `package.json`. A single `vite@8.3.8` satisfies Vitest's peer requirement (Vitest 5.x requires Vite as a peer); ESLint is held at 9.39.5 line. Libraries not yet needed (for example Zustand, Playwright, `remark-gfm`) remain intentionally uninstalled; add them only when a real use exists and they are part of the approved stack.

Node: the toolchain was resolved on 2026-11-15 with a portable Node 24.22.3 LTS / npm 11.19.1 install at `%LOCALAPPDATA%\nodejs-portable\node-v24.22.3-win-x64`. A helper at `%LOCALAPPDATA%\nodejs-portable\env.sh` prepends it to `PATH` for the current shell. The **system `PATH` was not modified**, so `node`/`npm` may still be absent from a fresh shell; source that helper first.

### 4.2 Structural decisions

- Independent SPA, separately deployable; no shared code with the backend.
- Feature-based modules: `auth` (implemented), `chat`, `documents`, `data-sources`, `settings` (UI previews with mock data).
- API access only through a typed client layer; no `fetch` in components. Implemented in `src/api/http-client.ts`.
- Access token in memory; refresh token in `sessionStorage` as an interim measure. Implemented in `src/auth/token-store.ts`.
- Single-flight refresh, retried once on 401; refresh itself is never retried. Implemented.
- Route protection via `RequireAuth` with a restoring spinner and safe `returnTo`. Implemented.
- Same-origin reverse proxy in production; Vite `/api` proxy in development to `https://localhost:7189` (required because the backend has no CORS). The Vite proxy disables certificate verification for this localhost development certificate only.
- No streaming implementation until a backend contract exists.
- Persian-first design with logical CSS properties and self-hosted Vazirmatn.
- Bilingual shell (`fa`/`en`) with runtime direction switching; light/dark/system themes persisted outside React and applied before first paint.
- Responsive shell: fixed sidebar at `lg`, navigation sheet below `lg`, sticky header, content capped at `max-w-6xl`.
- Static `/design-system` reference page for primitives, states, and both themes/directions; it is not product navigation.
- No direct SQL Server, Qdrant, Ollama, or model access.

### 4.3 Planned module status

| Module | Plan | Current status |
|---|---|---|
| Authentication | Login, refresh, logout, protected routes; logout-all and change password when UI exists | **Implemented**: login, session restore, logout, guards, account menu. No register page (no backend endpoint). HTTPS/proxy reachability verified; login/token flow not yet runtime-tested |
| Chat | Conversations, messages, markdown, code, citations, stop, regenerate | **UI preview implemented** with isolated mock data (history/search/delete, Markdown + highlighted code, copy/regenerate, expandable sources, composer, stop, empty/generating states). No network calls; real integration **blocked** |
| Documents | Upload, progress, status, list, delete, details | **UI preview implemented** with isolated mock data: URL-owned list search/status/type/sort/pagination, drag-and-drop + picker upload with PDF/empty/10 MB preview checks, indeterminate (never percentage) preview phase, six status badges, delete confirmation, `/documents/:documentId` details. No network calls and no processing simulation; real integration **blocked** |
| Data sources | Config, schema, permissions, source selection | **UI preview implemented** with isolated mock data: list with status/last-sync, add/edit forms with Zod validation, delete confirmation, `/data-sources/:sourceId` details with connection metadata and a keyboard-accessible schema tree. SQL Server is offered as a labelled example only (no type registry exists), the connection test is disabled with a reason, and passwords are never stored or re-displayed. No network calls; real integration **blocked** |
| Settings | Model, retrieval, embedding, preferences | **UI preview implemented**: `/settings` + `/settings/:section` with General (read-only session/build info), Appearance (real theme/language persistence), AI model (drafts in memory), Embedding (read-only server-managed), and Retrieval (drafts in memory, similarity threshold disabled). No settings endpoint is called; server configuration is unchanged |

---

## 5. Architecture Decisions

| ID | Decision | In foundation | Consequence |
|---|---|---|---|
| AD-01 | SPA with Vite, no SSR | Yes | Static deployment |
| AD-02 | React Router library mode | Yes | Client-side data fetching only |
| AD-03 | Feature-based architecture with public feature APIs | Feature folders exist with `index.ts`; import boundaries not yet enforced by lint | Import boundaries must be enforced |
| AD-04 | TanStack Query owns server state | Provider only | No duplicated API state |
| AD-05 | Zustand opt-in | Not installed | Must be justified per use |
| AD-06 | Single `fetch`-based HTTP client | Implemented (`src/api/http-client.ts`) | Central auth/cancellation/envelope handling |
| AD-07 | Access token in memory; refresh token in `sessionStorage` (interim) | Implemented | Residual XSS exposure; backend cookie recommended |
| AD-08 | Same-origin proxy in production | Vite dev proxy targets the backend HTTPS profile at `https://localhost:7189` | No CORS change in development; dev proxy accepts the local development certificate |
| AD-09 | No direct infrastructure access | Yes (no such dependency exists) | Security boundary |
| AD-10 | Persian-first, bilingual (`fa`/`en`) RTL/LTR shell | Yes; font stack prefers Vazirmatn but font files are not bundled yet | Logical CSS, runtime direction switch |
| AD-11 | Versions pinned in `package-lock.json` at scaffold | Yes | Reproducible builds |
| AD-12 | No streaming until a contract exists | Yes | Chat is not real-time |
| AD-13 | Radix-backed vendored primitives; no animation/i18n library | Yes | Accessible overlays and menus; two CSS keyframes |
| AD-14 | Persist only `theme` and `language` in `localStorage` | Yes | No sensitive data in browser storage |
| AD-15 | Chat ships as an honest UI preview with isolated mock data and no invented DTOs | Implemented | UI is usable and reviewable; integration remains blocked |
| AD-16 | Documents ships as an honest UI preview with isolated mock data and no invented DTOs | Implemented | Same consequence as AD-15; upload shows an indeterminate preview phase and never simulates processing |
| AD-17 | List query state (`q`, `status`, `type`, `sort`, `page`, `size`) lives in URL search params, defaults omitted, `replace` writes | Implemented for documents | Reload, shared links, and back/forward restore the same view |
| AD-18 | Data sources ships as an honest UI preview: list, add/edit/delete, details, and schema browser over isolated mock data; SQL Server only, connection test disabled, credentials transient | Implemented | CRUD UI is reviewable without inventing a single endpoint or storing a secret; `mock/` must be deleted when the contract lands |
| AD-19 | Settings ships as an honest preview: Appearance persists in this browser; General is read-only; AI/Retrieval are session-only validated drafts; Embedding is read-only server-managed; unsupported options are disabled | Implemented | Users can exercise the layout and validation without implying server persistence; nothing is sent to the backend |
| AD-20 | A development-only preview admin sign-in lets reviewers reach authenticated pages without contacting the API: no token, no request, a sessionStorage marker guarded by `import.meta.env.DEV`, visible bilingual labelling, and UI-only roles | Implemented | Flow review is unblocked without faking authentication; production builds contain no marker check and the UI is absent |

---

## 6. Constraints the Frontend Must Respect

1. `Authorization: Bearer <accessToken>` for protected endpoints.
2. Access tokens expire in 15 minutes; refresh tokens in 7 days.
3. Refresh rotation is family-based. **Never issue concurrent refresh requests; never retry an ambiguous refresh.**
4. `logout-all` and password change invalidate existing access tokens via security stamp rotation.
5. Most failure responses use HTTP 200 with `isSuccess: false`; login failure is HTTP 204.
6. The body's `statusCode` is unreliable (currently forced to 400 on failure).
7. No CORS: development uses the Vite proxy; production must be same-origin.
8. No streaming, no SignalR, no SSE.
9. No conversation, document, source, or settings endpoints.
10. No `/me` endpoint; identity display requires decoding the token (untrusted, display-only). Implemented that way.
11. A prior backend startup failed because `Authentication:Jwt:SecretKey` was shorter than 32 characters. The current local HTTPS API responds, but its active configuration was not inspected or changed here.
12. Persian text and RTL are first-class; mixed Latin/code content must render correctly.
13. No registration endpoint exists; do not add a register page.

---

## 7. Unknown or Unverified Items

| Item | Status |
|---|---|
| Runtime behavior of auth endpoints | Not verified; HTTPS/Swagger and route reachability are verified, but no credentialed request was made |
| Login/refresh/logout against a live API | Unverified; covered only by unit/component tests with a stubbed `fetch` |
| Exact serialized role claim name | Unverified (`ClaimTypes.Role` may be mapped to `role`) |
| Live database schema vs EF model | Unverified |
| Qdrant/Ollama connectivity and model availability | Unverified |
| Chat request/response contract | Unknown (intended shape exists; source is dirty and unverified) |
| Streaming protocol | Not designed |
| Citation payload | Not designed |
| Conversation persistence contract | Not implemented |
| Document upload/list/delete contract | Not implemented |
| Data source/schema contract | Not implemented |
| Settings contract | Not implemented |
| Upload limits | Unknown |
| Production origin / reverse proxy details | Unknown |
| Refresh token cookie support | Not implemented |
| CORS policy | Not implemented |
| Rate limiting | Not implemented |
| Local Node/npm toolchain | Resolved locally on 2026-11-15 via portable Node 24.22.3 / npm 11.19.1 (not on system `PATH`); behaves correctly for `npm install`, gates, and build |
| Production bundle size | Main JS chunk 602.50 kB (186.04 kB gzip), CSS 46.06 kB (8.86 kB gzip), lazy chat chunk 312.38 kB (97.88 kB gzip), shared `empty-state` chunk 81.53 kB, lazy data-sources chunk 30.09 kB (7.32 kB gzip), lazy documents chunk 28.41 kB (8.36 kB gzip), lazy settings chunk 12.51 kB (3.19 kB gzip), `format-date` chunk 1.15 kB; Vite still warns about the main chunk (>500 kB). Acceptable now; split further when more feature code lands |
| Self-hosted font | Not bundled; the Vazirmatn stack falls back to `Segoe UI`/`Tahoma` |
| Real API/browser integration | Partially verified: dev proxy reaches API; login/token behavior remains unverified |
| Authentication screenshots | Not produced; the browser tool reported an unavailable viewport |
| Chat backend integration | **Not implemented by design**: no HTTP call, no DTO, no persistence. All data is mock and replies are simulated locally with a timer |
| Chat Markdown tables | Not supported: `remark-gfm` is not installed, so GFM tables/strikethrough/task lists do not render |
| Chat message relocalization | Mock messages are generated in the language active when the conversation was seeded; switching language afterwards does not retranslate existing message content |
| Real regenerate/stop/attachment | Regenerate rotates mock replies; stop cancels the local timer; attachment is disabled because no upload endpoint exists |
| Documents backend integration | **Not implemented by design**: no HTTP call, no request, no DTO, no persistence. All records come from `src/features/documents/mock/` and live only in a module-scoped in-memory store for the lifetime of the tab |
| Documents status values | Preview labels only (`uploaded`/`processing`/`chunking`/`embedding`/`indexed`/`failed`); the backend has no status field, enum, or transition graph |
| Documents processing progress | Never shown: the view model allows `progress`, but every preview record has `progress: null`, so the UI renders an explicit "not reported" note instead of a percentage |
| Documents retry | Disabled with a visible explanation and `aria-describedby`; there is no retry endpoint |
| Documents loading/error states | Reachable only through the `import.meta.env.DEV` preview-state control. The control is stripped from production builds; the state field and its render branches remain in the chunk but nothing can set a non-ready state, so both states are unreachable in production |
| Documents upload validation | Client checks are convenience only: PDF extension/MIME, non-zero size, and a 10 MB **preview** ceiling. The real server-side type, size, and count limits are undocumented |
| Documents filters vs new uploads | A document added while a filter/search is active can be filtered out of the visible list; the UI announces the addition instead of clearing filters |
| Documents detail document title | Details pages keep the "Documents" document title (`usePageTitle` is path-based) |
| Documents formatting helpers | Resolved 2026-11-17: locale-cached date formatting moved to `src/lib/format-date.ts` and is shared by chat, documents, and data sources. `formatBytes`/`truncateMiddle` remain documents-local |
| Data sources backend integration | **Not implemented by design**: no HTTP call, no endpoint, no DTO, no persistence. Records come from `src/features/data-sources/mock/` and live only in a module-scoped store for the lifetime of the tab |
| Data source types | Only `sql-server` is offered, labelled as a preview example. The backend has no source-type registry, so no other type is presented |
| Data source connection test | Disabled with a visible reason and `aria-describedby`; no test endpoint exists |
| Data source schema data | Fictional example trees from `src/features/data-sources/mock/mock-schema.ts`, inside a preview notice. One record intentionally has no schema to exercise the empty state |
| Data source credentials | Passwords are transient form input only. Records store `hasCredential: boolean`; no password exists in mock data, the store, the DOM after save, logs, the URL, or browser storage. An edit with a blank password keeps the credential flag |
| Data source status/last-sync | Preview labels and values only; nothing is probed |
| Settings persistence | Only theme and language persist (existing providers). AI and Retrieval drafts reset on reload; General and Embedding are read-only. No settings endpoint is called |
| Settings values | AI draft defaults come from `appsettings.json` (`qwen2.5-coder:7b`, timeout 10). Retrieval defaults come from code (`chunk 300`, `overlap 50`, hardcoded top-K 5). Similarity threshold does not exist and is shown disabled. Embedding paths/keys are server-only and never rendered |
| English feature copy | **Resolved 2026-11-17:** the placeholder component is deleted and data sources, settings, and home copy are catalog-driven in both languages. Browser verification found no Persian data-sources/settings copy in English mode (Persian source names are mock data, not UI copy) |

---

## 8. Conflicts and Missing Information

1. **Backend runtime blocked** — the solution builds, but `Authentication:Jwt:SecretKey` is < 32 characters; blocks all runtime integration.
2. **Backend working tree is dirty** — modified `ChatController`, `Program`, project file, `appsettings`, `ZareAssistantContext`, and docs; untracked `Utility/ConfigurationExtensions.cs` and `Docs/Ai/reviews/`. Contract inspection is therefore a moving target; re-verify before any chat/document work.
3. **Backend `PROJECT_CONTEXT.md` is stale** — it reports missing `Qdrant`, `Ollama`, and `Embedding` sections; those sections exist in `appsettings.json`. It also predates the test project and `ChatController`.
4. **Backend context says "no test project"** — `RagAssistant.Tests` now exists. Backend tests were not run from this repository; the API currently responds on HTTPS, but backend test execution remains out of scope here.
5. **Envelope vs HTTP status** — clients cannot rely on HTTP status alone; the `statusCode` field is also unreliable. The client handles this and ignores body `statusCode`.
6. **Identity mapping** — `Authentication.Users.Id` and `usr.SiteUser.Id` are not connected in code; conversation ownership is undefined.
7. **Repo layout assumption** — the task style assumes a monorepo (`agent.md`, `PROJECT_CONTEXT.md` at the root, `Docs/Ai/`). In reality the backend is a separate repository. This repository has its own `AGENTS.md` and `PROJECT_CONTEXT.md`; the backend's instructions are preserved by reference and were not modified.
8. **`agent.md` vs `AGENTS.md`** — only `AGENTS.md` is used; no `agent.md` was created.
9. **No CORS** — cross-origin development without the proxy will fail in the browser.
10. **Plaintext password column** — `usr.SiteUser.Password` exists in the model; the frontend must never request or display it.
11. **Demo endpoints** — `/api/test/*` are not product contracts.
12. **No registration endpoint** — requirement 2 of the auth task is satisfied by not building a register page.
13. **English feature copy defect (closed 2026-11-17)** — `FeaturePlaceholder` is deleted; data sources, settings, and home content are catalog-driven and verified in English mode.

---

## 9. Open Questions for the Backend Team

1. When will the build be fixed?
2. What is the final chat contract (full history, question + collection, or persisted conversation id)?
3. SSE or SignalR for streaming, and what is the event schema?
4. How are citations returned (document, page, chunk, score)?
5. How is `Authentication.Users.Id` mapped to `usr.SiteUser.Id`?
6. What are the conversation CRUD and pagination contracts?
7. What is the document upload/list/delete/status contract, including size limits and isolation?
8. What are the data source and schema browsing contracts?
9. What are the settings contracts?
10. Will `/me` be added?
11. Will HTTP status codes and envelope `statusCode` be standardized?
12. Is same-origin reverse proxy the permanent deployment model, or will CORS be configured?
13. Will refresh tokens move to httpOnly cookies?
14. What is the exact serialized role claim name?

---

## 10. Recommended Next Steps

1. **Backend (blocking runtime):** configure `Authentication:Jwt:SecretKey` with ≥ 32 characters (owner action; do not invent or commit a secret), then start the API and run `dotnet test`.
2. **Backend:** standardize the error contract (real HTTP statuses, correct envelope `statusCode`, JSON error shape).
3. **Backend:** decide and document the chat streaming contract and citation payload.
4. **Backend:** add conversation, document, data source, and settings endpoints with authorization and ownership checks.
5. **Backend:** add `/me` or another verified identity endpoint.
6. **Both:** confirm the deployment model (same-origin proxy vs CORS).
7. **Frontend (done):** foundation, layout/design system, authentication against source-verified contracts, and chat, documents, data-sources, and settings UI previews with isolated mock data.
8. **Frontend (needs approval):** run the authentication flow against a live backend once it starts, then add Playwright and the first E2E smoke path.
9. **Frontend:** add Vazirmatn as a self-hosted asset (licence-compatible) and remove the font fallback.
10. **Frontend:** split the main bundle further once real feature data code lands (the 600.77 kB chunk advisory is the only build warning).
11. **Frontend:** replace the chat, documents, data-sources, and settings mock layers only after the backend contract is verified and approved; the exact contracts needed are written in `Docs/Ai/frontend-api-integration.md` §8–§10.
12. **Frontend:** make details/form pages reflect their own document title (currently the section title is kept).
13. **Frontend:** implement remaining product behavior in dependency order once the relevant contracts are verified.

Do not implement product features before the relevant contracts are verified and the step is approved. Do not treat mocks as integration verification.

---

## 11. Evidence Index

| Topic | Where |
|---|---|
| Frontend architecture decisions | `Docs/Ai/frontend-architecture.md` |
| Code conventions | `Docs/Ai/frontend-coding-standards.md` |
| Auth/token/XSS/upload rules | `Docs/Ai/frontend-security-standards.md` |
| Test tooling and scenarios | `Docs/Ai/frontend-testing-standards.md` |
| Design system, RTL, states | `Docs/Ai/frontend-ui-ux-guidelines.md` |
| Verified endpoints and DTOs | `Docs/Ai/frontend-api-integration.md` |
| Task process and reporting | `Docs/Ai/frontend-workflow.md` |
| Foundation review report | `Docs/Ai/reviews/2026-11-15-frontend-foundation.md` |
| Layout/design-system review report | `Docs/Ai/reviews/2026-11-15-layout-design-system.md` |
| Authentication review report | `Docs/Ai/reviews/2026-11-16-auth-ui-integration.md` |
| Chat UI review report | `Docs/Ai/reviews/2026-11-16-chat-ui.md` |
| Documents UI review report | `Docs/Ai/reviews/2026-11-17-documents-ui.md` |
| Data sources/settings review report | `Docs/Ai/reviews/2026-11-17-data-sources-settings-ui.md` |
| Verification screenshots (layout) | `Docs/Ai/reviews/assets/2026-11-15-layout/` |
| Verification screenshots (chat) | `Docs/Ai/reviews/assets/2026-11-16-chat/` |
| Verification screenshots (documents) | `Docs/Ai/reviews/assets/2026-11-17-documents/` |
| Verification screenshots and raw checks (data sources/settings) | `Docs/Ai/reviews/assets/2026-11-17-data-sources-settings/` |
| Frontend app root | `frontend/rag-assistant-ui/` |
| Frontend env validation | `frontend/rag-assistant-ui/src/lib/env.ts` |
| Frontend route table | `frontend/rag-assistant-ui/src/app/router.tsx` |
| HTTP client | `frontend/rag-assistant-ui/src/api/http-client.ts` |
| API error model | `frontend/rag-assistant-ui/src/api/api-error.ts` |
| Auth wire types | `frontend/rag-assistant-ui/src/api/types/auth.ts` |
| Token store | `frontend/rag-assistant-ui/src/auth/token-store.ts` |
| JWT display decoding | `frontend/rag-assistant-ui/src/auth/jwt.ts` |
| Session expiry events | `frontend/rag-assistant-ui/src/auth/session-events.ts` |
| Auth provider and guard | `frontend/rag-assistant-ui/src/features/auth/` |
| Login page | `frontend/rag-assistant-ui/src/features/auth/routes/login-page.tsx` |
| Chat preview page | `frontend/rag-assistant-ui/src/features/chat/routes/chat-page.tsx` |
| Chat mock data (delete when a contract exists) | `frontend/rag-assistant-ui/src/features/chat/mock/mock-data.ts` |
| Chat preview state hook | `frontend/rag-assistant-ui/src/features/chat/hooks/use-chat-preview.ts` |
| Chat Markdown/code rendering | `frontend/rag-assistant-ui/src/features/chat/components/markdown-message.tsx`, `code-block.tsx` |
| Documents list page | `frontend/rag-assistant-ui/src/features/documents/routes/documents-page.tsx` |
| Documents details page | `frontend/rag-assistant-ui/src/features/documents/routes/document-details-page.tsx` |
| Documents preview view models | `frontend/rag-assistant-ui/src/features/documents/types.ts` |
| Documents mock data and store (delete when a contract exists) | `frontend/rag-assistant-ui/src/features/documents/mock/` |
| Documents query/validation/format libs | `frontend/rag-assistant-ui/src/features/documents/lib/` |
| Documents upload and query hooks | `frontend/rag-assistant-ui/src/features/documents/hooks/` |
| Data sources list/form/details routes | `frontend/rag-assistant-ui/src/features/data-sources/routes/` |
| Data sources mock data, schema, and store (delete when a contract exists) | `frontend/rag-assistant-ui/src/features/data-sources/mock/` |
| Data sources validation | `frontend/rag-assistant-ui/src/features/data-sources/lib/validation.ts` |
| Schema browser | `frontend/rag-assistant-ui/src/features/data-sources/components/schema-browser.tsx` |
| Settings route and sections | `frontend/rag-assistant-ui/src/features/settings/routes/settings-page.tsx`, `components/` |
| Settings defaults and schemas | `frontend/rag-assistant-ui/src/features/settings/lib/` |
| Settings draft store (delete when a contract exists) | `frontend/rag-assistant-ui/src/features/settings/mock/settings-draft-store.ts` |
| Shared date formatting | `frontend/rag-assistant-ui/src/lib/format-date.ts` |
| Shared DEV preview-state control | `frontend/rag-assistant-ui/src/components/shared/preview-state-control.tsx` |
| Shell and navigation | `frontend/rag-assistant-ui/src/layouts/` |
| Theme provider | `frontend/rag-assistant-ui/src/theme/theme-provider.tsx` |
| Language provider and catalogs | `frontend/rag-assistant-ui/src/i18n/` |
| Design-system reference | `frontend/rag-assistant-ui/src/pages/design-system-page.tsx` |
| Frontend test harness | `frontend/rag-assistant-ui/src/test/render-app.tsx` |
| Backend instructions (authoritative for backend) | `../RagAssistantApi/AGENTS.md` |
| Backend context (note staleness) | `../RagAssistantApi/Docs/Ai/PROJECT_CONTEXT.md` |
| Backend auth controller | `../RagAssistantApi/RagAssistant.Api/Controllers/AuthController.cs` |
| Backend chat controller (broken) | `../RagAssistantApi/RagAssistant.Api/Controllers/ChatController.cs` |
| Backend envelope | `../RagAssistantApi/RagAssistant.Domain/Results/Result.cs` |
| Backend JWT issuance | `../RagAssistantApi/Amin.AspNetCore.Authentication/Authentication/JwtTokenService.cs` |
| Backend refresh rotation | `../RagAssistantApi/RagAssistant.Api/Authentication/SqlRefreshTokenStore.cs` |
| Backend composition root | `../RagAssistantApi/RagAssistant.Api/Program.cs` |
