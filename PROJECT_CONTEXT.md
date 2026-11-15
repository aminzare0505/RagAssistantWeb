# PROJECT_CONTEXT.md — RagAssistantWebApp

> **Purpose:** Give any AI agent or developer the verified state of this repository and its backend dependency without re-exploring everything.
> **Generated / verified:** 2026-11-15
> **This repository:** documentation plus a **frontend foundation** at `frontend/rag-assistant-ui/`. No product feature (auth, chat, documents, data sources, settings) is implemented.
> **Backend baseline:** `../RagAssistantApi` at commit `afd92ec` (`Chat Method`), branch `main`, working tree clean at inspection.
> **Backend build:** `dotnet build RagAssistant.Api.slnx` → **1 error, 31 warnings**. The solution does not compile.
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

Frontend foundation created on 2026-11-15 (verified by executed commands — see §1.1):

| Area | Present |
|---|---|
| Build | `package.json`, `package-lock.json`, `vite.config.ts`, three `tsconfig*.json`, `index.html` |
| Quality | `eslint.config.js`, `.prettierrc.json`, `.prettierignore`, `.gitignore`, `.env.example` |
| App shell | `src/main.tsx`, `src/app/*` (router, providers, error boundary), `src/layouts/app-shell.tsx` |
| Pages/routes | Home, 404, route error, and four honest placeholder feature routes |
| Styling | Tailwind CSS 4 stylesheet with design tokens; RTL (`lang="fa" dir="rtl"`) |
| Tests | Vitest + RTL setup and three router tests |
| Not present | `src/api/`, auth/session, HTTP client, `e2e/`, Playwright, TanStack devtools, Zustand, React Hook Form, React Markdown |

**Do not claim any product feature is implemented.** The foundation renders an app shell, navigation, and placeholder pages only; no backend call is made anywhere.

### 1.1 Verified commands and results (2026-11-15)

Run from `frontend/rag-assistant-ui/` with portable Node 24.22.3 / npm 11.19.1:

| Command | Result |
|---|---|
| `npm install` | Succeeded; 373 packages added; `package-lock.json` written |
| `npm run typecheck` (`tsc -b`) | Passed, no errors |
| `npm run lint` (`eslint .`) | Passed, no findings |
| `npm run test` (`vitest run`) | 3/3 tests passed |
| `npm run build` (`tsc -b && vite build`) | Succeeded; CSS 21.92 kB, JS 466.93 kB (145.35 kB gzip) |
| Dev server + browser check | RTL, active nav, lazy routes, deep links, and 404 verified; no console errors; no horizontal overflow at 526 px |
| `npm audit --omit=dev` | **Not verified** (timed out; no result observed) |

Not executed: Playwright/E2E (not installed), real API calls (backend does not compile).

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
| Test execution | Not run; the solution does not build | Verified (build attempt) |

### 3.2 Build state — blocker

```text
dotnet build RagAssistant.Api.slnx
→ 31 Warning(s), 1 Error(s)
→ RagAssistant.Api\Controllers\ChatController.cs(31,77): error CS1525: Invalid expression term ')'
```

Additional verified defects in the chat path:

- `ChatController` declares two actions with the same route and signature (`[HttpPost("Chat")]` twice).
- `RagService.ChatAboutFileAsync` still contains demo/debug code: it inserts a `SiteUser` with a plaintext password and executes `int.Parse("e")`, which throws every time.
- No streaming, no citations in the response, no conversation persistence endpoint.

Consequence: **no endpoint is runtime-verified**. Auth contracts are verified by source only.

### 3.3 HTTP surface (source-verified)

| Method | Route | Auth | Status |
|---|---|---|---|
| POST | `/api/auth/login` | Anonymous | Verified source; returns 204 on invalid credentials |
| POST | `/api/auth/refresh` | Anonymous | Verified source |
| POST | `/api/auth/logout` | Anonymous (refresh token in body) | Verified source |
| POST | `/api/auth/logout-all` | `[Authorize]` | Verified source |
| POST | `/api/auth/change-password` | `[Authorize]` | Verified source |
| POST | `/api/Chat/Chat` | None declared | **Invalid source; unusable** |
| GET/DELETE | `/api/test/*` | Mixed/incomplete | Demo only; must not be used |
| GET | `/WeatherForecast` | Anonymous | Template leftover |

No endpoints exist for:

- Conversations (list, create, rename, delete).
- Documents (upload, list, details, delete, status).
- Data sources (list, configure, schema, permissions).
- Settings (model, retrieval, embedding, preferences).
- Streaming, SSE, SignalR, hubs.
- Current user (`/me`).

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

Foundation exists at `frontend/rag-assistant-ui/`; product modules do not. Items below are the decided architecture, with implementation status marked.

### 4.1 Technology decisions

| Area | Decision | Installed version | Status |
|---|---|---|---|
| UI | React 19.x | 19.3.1 | Implemented |
| Language | TypeScript strict | 5.9.3 | Implemented |
| Build | Vite 8.x | 8.3.8 | Implemented |
| Styling | Tailwind CSS 4.x via `@tailwindcss/vite` | 4.3.5 | Implemented |
| Components | shadcn/ui (vendored) | local `Button` only | Partially implemented (one primitive) |
| Routing | React Router 7.x, library mode | 7.18.5 | Implemented |
| Server state | TanStack Query 5.x | 5.107.1 | Provider installed; no queries yet |
| Client state | Zustand only when justified | — | Deferred until justified |
| Forms | React Hook Form 7.x | — | Deferred until the first real form |
| Validation | Zod 4.x | 4.6.7 | Implemented (environment schema) |
| Icons | Lucide React | 1.73.0 | Implemented |
| Markdown | React Markdown 10.x (no raw HTML) | — | Deferred until chat exists |
| Code highlighting | rehype-highlight | — | Deferred until chat exists |
| Unit tests | Vitest + jsdom | 5.1.0 / 31.0.1 | Implemented |
| Component tests | React Testing Library 16.x | 16.3.3 | Implemented |
| E2E | Playwright | — | Deferred until an integration path exists |
| Package manager | npm | 11.19.1 | Implemented |
| Language/locale | Persian-first, RTL | — | Implemented |

Versions are pinned in `frontend/rag-assistant-ui/package-lock.json` with caret ranges in `package.json`. A single `vite@8.3.8` satisfies Vitest's peer requirement (Vitest 5.x requires Vite as a peer); ESLint is held at 9.39.5 line. Deferred libraries are intentionally not installed to avoid unused dependencies; they must be added only when a feature needs them, under the approved stack.

Node: the toolchain was resolved on 2026-11-15 with a portable Node 24.22.3 LTS / npm 11.19.1 install at `%LOCALAPPDATA%\nodejs-portable\node-v24.22.3-win-x64`. A helper at `%LOCALAPPDATA%\nodejs-portable\env.sh` prepends it to `PATH` for the current shell. The **system `PATH` was not modified**, so `node`/`npm` may still be absent from a fresh shell; source that helper first.

### 4.2 Structural decisions

- Independent SPA, separately deployable; no shared code with the backend.
- Feature-based modules: `auth`, `chat`, `documents`, `data-sources`, `settings`.
- API access only through a typed client layer; no `fetch` in components.
- Access token in memory; refresh token in `sessionStorage` as an interim measure.
- Same-origin reverse proxy in production; Vite `/api` proxy in development (required because the backend has no CORS).
- No streaming implementation until a backend contract exists.
- Persian-first design with logical CSS properties and self-hosted Vazirmatn.
- No direct SQL Server, Qdrant, Ollama, or model access.

### 4.3 Planned module status

| Module | Plan | Current status |
|---|---|---|
| Authentication | Login, refresh, logout, logout-all, change password | Implementable after the backend builds and is runtime-verified |
| Chat | Conversations, messages, markdown, code, citations, stop, regenerate | **Blocked** |
| Documents | Upload, progress, status, list, delete, details | **Blocked** |
| Data sources | Config, schema, permissions, source selection | **Blocked** |
| Settings | Model, retrieval, embedding, preferences | **Blocked** (client-only preferences excepted) |

---

## 5. Architecture Decisions

| ID | Decision | In foundation | Consequence |
|---|---|---|---|
| AD-01 | SPA with Vite, no SSR | Yes | Static deployment |
| AD-02 | React Router library mode | Yes | Client-side data fetching only |
| AD-03 | Feature-based architecture with public feature APIs | Feature folders exist with `index.ts`; import boundaries not yet enforced by lint | Import boundaries must be enforced |
| AD-04 | TanStack Query owns server state | Provider only | No duplicated API state |
| AD-05 | Zustand opt-in | Not installed | Must be justified per use |
| AD-06 | Single `fetch`-based HTTP client | Not implemented | Central auth/cancellation/envelope handling |
| AD-07 | Access token in memory; refresh token in `sessionStorage` (interim) | Not implemented | Residual XSS exposure; backend cookie recommended |
| AD-08 | Same-origin proxy in production | Vite dev proxy configured | No CORS change in development |
| AD-09 | No direct infrastructure access | Yes (no such dependency exists) | Security boundary |
| AD-10 | Persian-first RTL | Yes; font stack prefers Vazirmatn but font files are not bundled yet | Logical CSS, self-hosted font |
| AD-11 | Versions pinned in `package-lock.json` at scaffold | Yes | Reproducible builds |
| AD-12 | No streaming until a contract exists | Yes | Chat is not real-time |

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
10. No `/me` endpoint; identity display requires decoding the token (untrusted, display-only).
11. The backend does not compile at the inspected commit.
12. Persian text and RTL are first-class; mixed Latin/code content must render correctly.

---

## 7. Unknown or Unverified Items

| Item | Status |
|---|---|
| Runtime behavior of any endpoint | Unverified (backend does not build) |
| Exact serialized role claim name | Unverified (`ClaimTypes.Role` may be mapped to `role`) |
| Live database schema vs EF model | Unverified |
| Qdrant/Ollama connectivity and model availability | Unverified |
| Chat request/response contract | Unknown (intended shape exists, but unusable) |
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
| `npm audit` result | Unverified: the command timed out; no vulnerability report was observed |
| Browser verification at desktop/tablet widths | Not exercised: browser checks were performed at a 526 px viewport only |

---

## 8. Conflicts and Missing Information

1. **Backend build failure** — `ChatController.cs:31`; blocks all runtime integration.
2. **Backend `PROJECT_CONTEXT.md` is stale** — it reports missing `Qdrant`, `Ollama`, and `Embedding` sections; those sections now exist in `appsettings.json`. It also predates the test project and `ChatController`.
3. **Backend context says "no test project"** — `RagAssistant.Tests` now exists (commit `06caa1a`), but cannot run until the build is fixed.
4. **Envelope vs HTTP status** — clients cannot rely on HTTP status alone; the `statusCode` field is also unreliable.
5. **Identity mapping** — `Authentication.Users.Id` and `usr.SiteUser.Id` are not connected in code; conversation ownership is undefined.
6. **Repo layout assumption** — the task style assumes a monorepo (`agent.md`, `PROJECT_CONTEXT.md` at the root, `Docs/Ai/`). In reality the backend is a separate repository. This repository has its own `AGENTS.md` and `PROJECT_CONTEXT.md`; the backend's instructions are preserved by reference and were not modified.
7. **`agent.md` vs `AGENTS.md`** — only `AGENTS.md` is used; no `agent.md` was created.
8. **No CORS** — cross-origin development without the proxy will fail in the browser.
9. **Plaintext password column** — `usr.SiteUser.Password` exists in the model; the frontend must never request or display it.
10. **Demo endpoints** — `/api/test/*` are not product contracts.

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

1. **Backend (blocking):** fix `ChatController` so the solution builds; then run `dotnet test`.
2. **Backend:** standardize the error contract (real HTTP statuses, correct envelope `statusCode`, JSON error shape).
3. **Backend:** decide and document the chat streaming contract and citation payload.
4. **Backend:** add conversation, document, data source, and settings endpoints with authorization and ownership checks.
5. **Backend:** add `/me` or another verified identity endpoint.
6. **Both:** confirm the deployment model (same-origin proxy vs CORS).
7. **Frontend foundation (done, awaiting approval for the next step):** Vite + React + TypeScript, ESLint/Prettier, Vitest/RTL, Tailwind, routing, env validation, providers, app shell, and placeholder routes.
8. **Frontend (needs approval):** add the HTTP client, `ApiResponse<T>` envelope handling, and the auth session lifecycle against the source-verified auth contracts; verify in a browser once the backend builds.
9. **Frontend (needs approval):** add Playwright and the first E2E smoke path when a runnable backend exists.
10. **Frontend:** add Vazirmatn as a self-hosted asset (licence-compatible) and remove the font's network dependency.
11. **Frontend:** implement features in dependency order once their contracts are verified.

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
| Frontend app root | `frontend/rag-assistant-ui/` |
| Frontend env validation | `frontend/rag-assistant-ui/src/lib/env.ts` |
| Frontend route table | `frontend/rag-assistant-ui/src/app/router.tsx` |
| Frontend test harness | `frontend/rag-assistant-ui/src/test/render-app.tsx` |
| Backend instructions (authoritative for backend) | `../RagAssistantApi/AGENTS.md` |
| Backend context (note staleness) | `../RagAssistantApi/Docs/Ai/PROJECT_CONTEXT.md` |
| Backend auth controller | `../RagAssistantApi/RagAssistant.Api/Controllers/AuthController.cs` |
| Backend chat controller (broken) | `../RagAssistantApi/RagAssistant.Api/Controllers/ChatController.cs` |
| Backend envelope | `../RagAssistantApi/RagAssistant.Domain/Results/Result.cs` |
| Backend JWT issuance | `../RagAssistantApi/Amin.AspNetCore.Authentication/Authentication/JwtTokenService.cs` |
| Backend refresh rotation | `../RagAssistantApi/RagAssistant.Api/Authentication/SqlRefreshTokenStore.cs` |
| Backend composition root | `../RagAssistantApi/RagAssistant.Api/Program.cs` |
