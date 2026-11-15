# CHANGELOG_AI

## 2026-11-15 — Create frontend project foundation

**Scope:** Frontend-only. Created the runnable application skeleton at `frontend/rag-assistant-ui/`. The backend repository was not modified. No product feature was implemented, and no API endpoint, DTO, or route was invented.

**Changed files (all created unless marked _modified_):**

- `frontend/rag-assistant-ui/package.json` — scripts, dependencies, Node engine floor.
- `frontend/rag-assistant-ui/package-lock.json` — resolved dependency graph.
- `frontend/rag-assistant-ui/vite.config.ts` — React + Tailwind plugins, `@` alias, dev proxy `/api` → `http://localhost:5000`, Vitest config.
- `frontend/rag-assistant-ui/tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json` — strict TypeScript project references.
- `frontend/rag-assistant-ui/eslint.config.js` — type-aware flat config, hooks, a11y, react-refresh, Prettier.
- `frontend/rag-assistant-ui/.prettierrc.json`, `.prettierignore` — formatting.
- `frontend/rag-assistant-ui/index.html` — `lang="fa" dir="rtl"`, Persian title/description.
- `frontend/rag-assistant-ui/.env.example` — documented public `VITE_*` variables.
- `frontend/rag-assistant-ui/.gitignore` — ignores `node_modules`, `dist`, local env files, Playwright output.
- `frontend/rag-assistant-ui/components.json` — shadcn-style component config.
- `frontend/rag-assistant-ui/src/main.tsx` — entry, strict root lookup, providers, router.
- `frontend/rag-assistant-ui/src/vite-env.d.ts` — typed `import.meta.env`.
- `frontend/rag-assistant-ui/src/app/router.tsx` — route table; lazy feature routes.
- `frontend/rag-assistant-ui/src/app/router.test.tsx` — three shell/routing tests.
- `frontend/rag-assistant-ui/src/app/error-boundary.tsx` — class error boundary with Persian fallback.
- `frontend/rag-assistant-ui/src/app/providers/app-providers.tsx` — TanStack Query provider.
- `frontend/rag-assistant-ui/src/layouts/app-shell.tsx` — header, primary navigation, skip link, main outlet, footer.
- `frontend/rag-assistant-ui/src/pages/home-page.tsx` — foundation status and backend-unavailable notice.
- `frontend/rag-assistant-ui/src/pages/not-found-page.tsx` — 404 page.
- `frontend/rag-assistant-ui/src/pages/route-error-page.tsx` — route error page.
- `frontend/rag-assistant-ui/src/features/chat/index.ts`, `routes/chat-page.tsx` — honest placeholder.
- `frontend/rag-assistant-ui/src/features/documents/index.ts`, `routes/documents-page.tsx` — honest placeholder.
- `frontend/rag-assistant-ui/src/features/data-sources/index.ts`, `routes/data-sources-page.tsx` — honest placeholder.
- `frontend/rag-assistant-ui/src/features/settings/index.ts`, `routes/settings-page.tsx` — honest placeholder.
- `frontend/rag-assistant-ui/src/components/shared/feature-placeholder.tsx` — shared “not implemented” layout.
- `frontend/rag-assistant-ui/src/components/ui/button.tsx` — first vendored primitive.
- `frontend/rag-assistant-ui/src/lib/env.ts` — Zod environment validation, fail-fast.
- `frontend/rag-assistant-ui/src/lib/query-client.ts` — QueryClient defaults.
- `frontend/rag-assistant-ui/src/lib/utils.ts` — `cn()` helper.
- `frontend/rag-assistant-ui/src/i18n/fa.ts` — Persian message catalog.
- `frontend/rag-assistant-ui/src/styles/index.css` — Tailwind 4 import, theme tokens, RTL-friendly base styles.
- `frontend/rag-assistant-ui/src/test/setup.ts` — jest-dom and RTL cleanup.
- `frontend/rag-assistant-ui/src/test/render-app.tsx` — memory-router test harness.
- `AGENTS.md` — _modified_: status reflects the existing foundation; feature work still blocked.
- `PROJECT_CONTEXT.md` — _modified_: repository state, versions, commands, decisions, unverified items, next steps.
- `Docs/Ai/frontend-architecture.md` — _modified_: app location, folder tree, verified versions, environment table.
- `Docs/Ai/CHANGELOG_AI.md` — _modified_: this entry.
- `Docs/Ai/reviews/2026-11-15-frontend-foundation.md` — created review report.

**Summary:**
Scaffolded the React + TypeScript frontend foundation with Vite 8 and strict TypeScript, Tailwind 4 design tokens, React Router 7 routes, a TanStack Query provider, Zod-validated environment configuration, an RTL Persian app shell, an error boundary, and four clearly labelled placeholder feature routes. The app makes no HTTP requests, contains no auth/session code, and does not pretend the blocked features exist. Feature-only libraries (Zustand, React Hook Form, React Markdown, rehype-highlight, Playwright) were deliberately not installed.

**Typecheck:** `npm run typecheck` (`tsc -b`) — passed, no errors.
**Lint:** `npm run lint` (`eslint .`) — passed, no findings.
**Tests:** `npm run test` (`vitest run`) — 3/3 passed (home shell, lazy placeholder navigation, unknown route).
**Build:** `npm run build` (`tsc -b && vite build`) — succeeded; output CSS 21.92 kB, JS 466.93 kB (145.35 kB gzip).
**Browser verification:** dev server + headless browser at a 526 px viewport — RTL layout, active navigation state, lazy `/documents` route, direct `/settings` load, and the 404 route all behaved correctly; no console errors; no horizontal overflow. Desktop/tablet widths were not exercised.
**Dependency tree:** installed with `npm install` (373 packages). `npm ls vite vitest` shows a single `vite@8.3.8` satisfying Vitest's peer requirement.
**E2E:** Not executed. Playwright is not installed and the backend does not compile, so no integration path exists.
**Audit:** `npm audit --omit=dev` — **not verified**; the registry call timed out twice with no result.
**Independent review:** Not performed. No reviewer agent was available; the report in `Docs/Ai/reviews/` is a self-review by the implementing agent.

**Known issues / follow-ups:**
- Feature code import boundaries are documented but not yet lint-enforced.
- No HTTP client, auth/session, storage, or API layer exists yet.
- Placeholder pages have no functionality and must not be described as implemented.
- Font stack names Vazirmatn but no font file is bundled; the browser falls back to a system Persian-capable font.
- No favicon; browsers may request `/favicon.ico` and receive a 404.
- `npm ls` reports optional WASM helpers (`@emnapi/*`, `@napi-rs/wasm-runtime`, `tslib`) as extraneous although they are present in the lockfile; this is an npm optional-dependency quirk, not a broken lockfile.
- Backend build failure still blocks all runtime integration.
- Next step requires approval: HTTP client + auth shell against the source-verified auth contracts.

---

## 2026-11-15 — Establish frontend architecture and AI development standards

**Scope:** Documentation only. No application source, scaffolding, or dependencies were created.

**Changed files (all created):**

- `AGENTS.md` — frontend agent instructions; backend rules preserved by reference.
- `PROJECT_CONTEXT.md` — verified repository and backend state, decisions, blockers, open questions.
- `Docs/Ai/frontend-architecture.md` — system boundaries, stack, folder structure, routing, state, data fetching, error boundaries, environment, deployment, readiness matrix.
- `Docs/Ai/frontend-coding-standards.md` — TypeScript, React, hooks, naming, props, separation of concerns, abstraction policy, quality gates.
- `Docs/Ai/frontend-security-standards.md` — JWT integration, token storage, refresh concurrency, XSS/CSP, upload, sensitive data, secrets, review checklist.
- `Docs/Ai/frontend-testing-standards.md` — Vitest, RTL, hooks, API mocking, required scenarios, Playwright, commands, coverage policy.
- `Docs/Ai/frontend-ui-ux-guidelines.md` — design tokens, themes, RTL/Persian, accessibility, loading/empty/error states, chat, upload, citations.
- `Docs/Ai/frontend-api-integration.md` — verified auth contracts, envelope semantics, HTTP client, cancellation, streaming status, upload rules, OpenAPI, open questions.
- `Docs/Ai/frontend-workflow.md` — task routing, reading order, implementation, gates, review, security review, docs, changelog, reporting.
- `Docs/Ai/CHANGELOG_AI.md` — this file.

The pre-existing empty `Docs/AI` directory was normalized to `Docs/Ai` to match the documented path and backend convention.

**Summary:**
Prepared the documentation baseline for a React + TypeScript frontend. Verified the backend by source inspection at `RagAssistantApi` commit `afd92ec`: auth endpoints, JWT/refresh behavior, response envelope, permissions, configuration, and the current HTTP surface. No API routes or DTOs were invented; unimplemented areas are marked blocked. Locked in the proposed stack and architecture decisions, including strict TypeScript, feature-based modules, TanStack Query for server state, same-origin deployment due to the absence of CORS, and secure token handling that accounts for the backend's family-based refresh rotation.

**Backend verification performed:**
- `dotnet build RagAssistant.Api.slnx` in `../RagAssistantApi` → **1 error, 31 warnings**.
  - `RagAssistant.Api/Controllers/ChatController.cs(31,77): error CS1525: Invalid expression term ')'`.
- Source inspection only for endpoint behavior; no API, database, Qdrant, Ollama, or model execution.

**Frontend build:** Not applicable — no frontend application exists.

**Frontend tests:** Not applicable — no test suite exists.

**E2E:** Not executed. Blocked: the backend does not compile.

**Independent review:** Not performed. No reviewer agent was invoked for this documentation-only task.

**Known issues / blockers:**
- Backend build failure blocks all runtime integration.
- Chat, conversations, documents, data sources, settings, streaming, and citations have no usable HTTP contracts and are marked blocked.
- No CORS policy; development requires a Vite proxy and production requires a same-origin reverse proxy.
- No `/me` endpoint; identity display requires untrusted token decoding.
- Exact dependency versions were not live-verified because npm registry access was unavailable; they must be resolved and locked at scaffold time. Public documentation confirms Vite 8 is current (same Node ≥ 20.19 / ≥ 22.12 requirement as Vite 7) and that Vitest now requires `vite` as a peer dependency, so the Vite/Vitest majors must be chosen together.

**Follow-ups:**
- Backend: fix the build, standardize the error contract, define streaming and citation contracts, and add the missing feature endpoints.
- Frontend: await approval, then bootstrap the application and verify the peer dependency graph.
