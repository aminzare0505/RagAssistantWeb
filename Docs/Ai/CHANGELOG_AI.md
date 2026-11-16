# CHANGELOG_AI

## 2026-11-16 — Implement chat interface preview

**Scope:** Frontend-only (Task 4). Built the Chat page UI on the existing shell/design system with full conversation-history, message, composer, and source interactions. **No backend was modified, no endpoint or DTO was invented, and the page makes no network calls.** All conversations, messages, replies, and sources come from isolated mock data under `src/features/chat/mock/`, and a visible preview banner states this in both languages. Real chat remains blocked on the backend contract.

**Changed files (all created unless marked _modified_):**

- `frontend/rag-assistant-ui/package.json`, `package-lock.json` — _modified_: added `react-markdown@^10.1.0` and `rehype-highlight@^7.0.2` (highlight.js 11.11.2). `remark-gfm` was not added.
- `frontend/rag-assistant-ui/src/features/chat/types.ts` — preview view models (`ChatConversation`, `ChatMessage`, `ChatSource`), explicitly not wire DTOs.
- `frontend/rag-assistant-ui/src/features/chat/mock/mock-data.ts` — three seeded conversations, three rotating mock replies (prose/sources, TypeScript code block, summary), `createEmptyConversation`, `createUserMessage`, `createAssistantMessage`, `MOCK_REPLY_DELAY_MS`; the header comment says to delete the module when a contract exists.
- `frontend/rag-assistant-ui/src/features/chat/hooks/use-chat-preview.ts` — conversation store, search filter, active selection, new chat, delete, send with simulated reply timer, stop, regenerate (rotates mock variants); timer cleared on unmount.
- `frontend/rag-assistant-ui/src/features/chat/lib/clipboard.ts` — `copyText` capability check; returns `false` instead of throwing.
- `frontend/rag-assistant-ui/src/features/chat/lib/format.ts` — cached `Intl` date/number formatters and score formatting per locale.
- `frontend/rag-assistant-ui/src/features/chat/routes/chat-page.tsx` — _modified_: replaced the placeholder with the responsive two-pane layout, preview banner, mobile history sheet, conversation header, empty/generating states, and always-mounted composer.
- `frontend/rag-assistant-ui/src/features/chat/components/conversation-history.tsx` — new chat, search, list with active state and dates, delete button, and destructive confirmation dialog.
- `frontend/rag-assistant-ui/src/features/chat/components/chat-message-list.tsx` — `role="log"` container, auto-scroll via `ResizeObserver`, generating indicator.
- `frontend/rag-assistant-ui/src/features/chat/components/chat-message-item.tsx` — user/assistant rows, avatars, timestamps, Markdown, sources, copy and regenerate actions.
- `frontend/rag-assistant-ui/src/features/chat/components/markdown-message.tsx` — React Markdown with `rehype-highlight`; module-scope component overrides restrict links to `http(s)`, replace images with a placeholder, route `pre` to `CodeBlock`, and demote `h1` to `h3`.
- `frontend/rag-assistant-ui/src/features/chat/components/code-block.tsx` — language label, LTR scrollable pre, copy button using DOM text.
- `frontend/rag-assistant-ui/src/features/chat/components/copy-button.tsx` — idle/copied/failed feedback with an `aria-live` region.
- `frontend/rag-assistant-ui/src/features/chat/components/message-sources.tsx` — expandable source list with document name, optional page/score, and retrieved snippet.
- `frontend/rag-assistant-ui/src/features/chat/components/chat-composer.tsx` — auto-growing textarea, Enter/Shift+Enter with IME guard, send, stop while generating, disabled attachment with explanation.
- `frontend/rag-assistant-ui/src/features/chat/components/chat-empty-state.tsx` — empty conversation copy and suggestion prompts.
- `frontend/rag-assistant-ui/src/i18n/fa.ts`, `src/i18n/en.ts` — _modified_: full chat catalog (preview notice, history/search/delete, roles, actions, sources, composer, empty states).
- `frontend/rag-assistant-ui/src/styles/index.css` — _modified_: code-highlight tokens for both themes, `.chat-markdown` typography/spacing, `.chat-code` reset, and `.hljs-*` mappings to semantic tokens.
- `frontend/rag-assistant-ui/src/features/chat/components/markdown-message.test.tsx` — 4 Markdown/security/code tests.
- `frontend/rag-assistant-ui/src/features/chat/chat-page.test.tsx` — 16 page-level tests (history, search, delete, send, stop, regenerate, copy, sources, mobile sheet, English/dark).
- `AGENTS.md`, `PROJECT_CONTEXT.md` — _modified_: status, verified results, limitations, evidence.
- `Docs/Ai/frontend-architecture.md`, `frontend-ui-ux-guidelines.md`, `frontend-testing-standards.md`, `frontend-security-standards.md`, `frontend-coding-standards.md`, `frontend-workflow.md` — _modified_: chat preview architecture, UI patterns, test patterns, Markdown/clipboard safety, and a Task 4 record.
- `Docs/Ai/reviews/2026-11-16-chat-ui.md` — review report.
- `Docs/Ai/reviews/assets/2026-11-16-chat/*.png` — ten verification screenshots.

**Summary:**
Implemented the complete chat interface as a truthful UI preview. Desktop shows a 288 px conversation sidebar beside the message pane; below `lg` the same history opens in a start-side sheet. The message area renders user and assistant rows with timestamps, Markdown, syntax-highlighted LTR code blocks with copy, per-message copy and regenerate, and expandable sources. The composer supports multiline input, Enter/Shift+Enter, a generating state with stop, and a disabled attachment control that explains the missing endpoint. Empty, generating, search-empty, and no-conversation states are covered in both languages and themes. Mock replies are simulated locally after 600 ms so the generating/stop UI can be exercised; nothing is sent to or stored on a server.

**Typecheck:** `npm run typecheck` (`tsc -b`) — passed, no errors.
**Lint:** `npm run lint` (`eslint .`) — passed, no findings.
**Tests:** `npm run test` (`vitest run`) — **68/68 passed in 11 files** (48 pre-existing + 20 new: 16 chat page + 4 Markdown).
**Build:** `npm run build` (`tsc -b && vite build`) — succeeded; CSS 39.77 kB, main JS 606.40 kB (190.21 kB gzip), lazy chat chunk 313.11 kB (98.07 kB gzip). Vite warns that the main chunk exceeds 500 kB; no failure.
**Browser verification:** headless Chrome over CDP at 1440×900, 768×900, and 360×740 in Persian/English and light/dark, using a mocked session-restore `fetch` and seeded `sessionStorage`. Verified sidebar/sheet behavior, Markdown and highlighted code, source expansion, Enter-to-send with the stop state, auto-scroll to the newest message, and no page-level horizontal overflow. Screenshots are under `Docs/Ai/reviews/assets/2026-11-16-chat/`. The in-app browser had no visible surface (0×0 viewport, hidden visibility), so it was used only for structural checks.
**E2E:** Not executed. Playwright is not installed, and no chat backend contract exists.
**Independent review:** Not performed. No reviewer agent was available; the report is a self-review by the implementing agent.

**Known issues / follow-ups:**
- Real chat integration is blocked: no verified chat, conversation, citation, or streaming contract. The mock module must be removed, not extended, when one exists.
- Markdown tables/GFM are unsupported because `remark-gfm` is not installed; add it only with approval and tests.
- Switching language does not retranslate already-seeded mock conversation content.
- Regenerate rotates mock replies; stop cancels a local timer; attachment is disabled. None of these call a server or represent real backend behavior.
- Auto-scroll always follows the newest message; there is no "new content below" affordance yet because nothing streams.
- Main JS chunk is 606.40 kB (190.21 kB gzip); the advisory remains.
- Pre-existing defect: remaining placeholder pages (documents, data sources, settings, home content) still hardcode Persian copy in English mode.

## 2026-11-16 — Implement authentication UI and integration

**Scope:** Frontend-only (Task 3). Added the HTTP transport, session primitives, `AuthProvider`, login page, route guards, account menu, and 33 new tests, using only the source-verified auth endpoints. The backend repository was not modified. No register page was built because the backend has no registration endpoint. Chat, documents, data sources, settings, streaming, and citations remain blocked.

**Backend endpoints used:** `POST /api/auth/login`, `POST /api/auth/refresh`, `POST /api/auth/logout`. `/api/auth/logout-all` and `/api/auth/change-password` exist but have no UI.

**Security decisions:** access token in memory only; refresh token in `sessionStorage` (interim); no tokens in `localStorage`; single-flight refresh with no automatic retry (family revocation); 401 → one refresh → one retry; no refresh for login/refresh/logout; `queryClient.clear()` on login, logout, and expiry; decoded claims used for display only; `returnTo` validated to block open redirects and self-redirect to `/login`.

**Changed files (all created unless marked _modified_):**

- `frontend/rag-assistant-ui/package.json`, `package-lock.json` — _modified_: added `react-hook-form@^7.66.0` and `@hookform/resolvers@^5.2.2`.
- `frontend/rag-assistant-ui/src/api/http-client.ts` — transport: URL building, bearer header, 15 s timeout with abort composition, envelope parsing, status classification, single-flight refresh, retry-once.
- `frontend/rag-assistant-ui/src/api/api-error.ts` — `ApiError` and `ApiErrorKind`.
- `frontend/rag-assistant-ui/src/api/types/api-response.ts`, `src/api/types/auth.ts` — envelope and auth wire DTOs; Zod `jwtTokenResultSchema`.
- `frontend/rag-assistant-ui/src/auth/token-store.ts` — memory access token, `sessionStorage` refresh token, storage-blocked fallback.
- `frontend/rag-assistant-ui/src/auth/jwt.ts`, `src/auth/types.ts` — display-only claim decoding and `AuthUser`.
- `frontend/rag-assistant-ui/src/auth/session-events.ts` — single `session-expired` signal.
- `frontend/rag-assistant-ui/src/features/auth/auth-provider.tsx`, `auth-context.ts`, `use-auth.ts`, `types.ts`, `index.ts` — session state machine, restore effect, login/logout, expiry subscriber, public exports.
- `frontend/rag-assistant-ui/src/features/auth/auth-api.ts` — login/refresh/logout request helpers over `httpClient`.
- `frontend/rag-assistant-ui/src/features/auth/require-auth.tsx`, `auth-layout.tsx`, `components/session-loading.tsx` — guard, public auth layout, restoring spinner.
- `frontend/rag-assistant-ui/src/features/auth/routes/login-page.tsx`, `login-schema.ts`, `login-error-message.ts`, `safe-return-to.ts`, `components/login-shell.tsx` — login form, validation schema, safe error copy, redirect validation.
- `frontend/rag-assistant-ui/src/features/auth/components/user-menu.tsx` — account dropdown with identity and sign-out.
- `frontend/rag-assistant-ui/src/app/router.tsx` — _modified_: `AuthLayout` → `/login`; `RequireAuth` around the shell; 404 inside the authenticated tree.
- `frontend/rag-assistant-ui/src/layouts/header.tsx` — _modified_: account menu.
- `frontend/rag-assistant-ui/src/i18n/fa.ts`, `src/i18n/en.ts` — _modified_: auth strings, errors, and updated home copy.
- `frontend/rag-assistant-ui/src/test/auth.ts` — fake JWT and session seeding helpers.
- `frontend/rag-assistant-ui/src/test/api.ts` — envelope/response helpers and `FetchMock`.
- `frontend/rag-assistant-ui/src/test/render-app.tsx` — _modified_: `authenticated` prop, default session seeding.
- `frontend/rag-assistant-ui/src/test/setup.ts` — _modified_: token/session cleanup and `vi.unstubAllGlobals()`.
- `frontend/rag-assistant-ui/src/api/http-client.test.ts` — 11 transport tests.
- `frontend/rag-assistant-ui/src/features/auth/auth-provider.test.tsx` — 5 session-lifecycle tests.
- `frontend/rag-assistant-ui/src/features/auth/routes/login-page.test.tsx` — 8 login/redirect tests.
- `frontend/rag-assistant-ui/src/app/auth-routing.test.tsx` — 2 protected-route tests.
- `frontend/rag-assistant-ui/src/auth/jwt.test.ts` — 3 decoding tests.
- `frontend/rag-assistant-ui/src/features/auth/safe-return-to.test.ts` — 4 redirect-safety tests.
- `AGENTS.md`, `PROJECT_CONTEXT.md` — _modified_: implemented status, commands, backend build/runtime facts, follow-ups.
- `Docs/Ai/frontend-architecture.md`, `frontend-api-integration.md`, `frontend-security-standards.md`, `frontend-testing-standards.md`, `frontend-coding-standards.md`, `frontend-ui-ux-guidelines.md`, `frontend-workflow.md` — _modified_: implemented auth layering, contracts, storage, guards, tests, form pattern, sign-in states, and a Task 3 record.
- `Docs/Ai/reviews/2026-11-16-auth-ui-integration.md` — review report.

**Summary:**
Implemented authentication against the source-verified backend contract. The app now starts behind a session restore that exchanges the stored refresh token once, guards every product route, and redirects unauthenticated visitors to a Persian/English login page that preserves their original destination. Login uses React Hook Form + Zod with accessible field errors and a generic invalid-credentials message for HTTP 204. The HTTP client sends bearer tokens, ignores the unreliable body `statusCode`, classifies errors, and performs exactly one shared refresh on 401 before retrying once. Sign-out clears tokens and query caches and posts the refresh token. No registration page exists because the backend has no endpoint.

**Typecheck:** `npm run typecheck` (`tsc -b`) — passed, no errors.
**Lint:** `npm run lint` (`eslint .`) — passed, no findings.
**Tests:** `npm run test` (`vitest run`) — 48/48 passed in 9 files (15 pre-existing + 33 new).
**Build:** `npm run build` (`tsc -b && vite build`) — succeeded; CSS 33.40 kB, main JS 646.91 kB (203.37 kB gzip). Vite warns that the main chunk exceeds 500 kB; no failure.
**Browser verification:** dev server with a mocked `window.fetch`: protected redirect with `returnTo`, empty-field validation with `aria-invalid`, invalid credentials, successful login returning to `/settings`, refresh token in `sessionStorage` only, account menu identity, logout POST + redirect, theme switch, and English/LTR switch. Session restore was exercised through a real failing request (502 → expired notice) and a stubbed success path. **Screenshots were not produced** because the browser tool reported an unavailable viewport (0×0); interactions were driven by scripted DOM events.
**E2E:** Not executed. Playwright is not installed, and the backend builds but cannot start (`Authentication:Jwt:SecretKey` < 32 chars), so no live-contract verification was possible.
**Independent review:** Not performed. No reviewer agent was available; the report is a self-review by the implementing agent.

**Known issues / follow-ups:**
- No runtime verification of any auth endpoint; all contracts remain source-verified only.
- Registration is not implemented because no backend endpoint exists.
- Change password and logout-all have no UI.
- Refresh token in `sessionStorage` remains XSS-readable; a duplicated tab can race the original. Backend httpOnly cookies are the recommended fix.
- Session-expiry redirect clears local state but does not show a toast per failed request; it shows one notice on the login page.
- Pre-existing defect: feature placeholder pages hardcode Persian copy, so English mode shows Persian feature text.
- Backend build failure no longer blocks compilation, but the missing JWT secret blocks startup.
- Main JS chunk is 646.91 kB (203.37 kB gzip); split when feature code lands.

## 2026-11-15 — Implement application layout and design system

**Scope:** Frontend-only (Task 2). Added the responsive shell, sidebar/header navigation, light/dark/system themes, bilingual `fa`/`en` RTL-LTR support, reusable UI primitives, a static design-system reference page, and tests. The backend repository was not modified. Authentication and all product features remain unimplemented, and no API endpoint, DTO, query parameter, or status code was invented.

**Changed files (all created unless marked _modified_):**

- `frontend/rag-assistant-ui/package.json`, `package-lock.json` — _modified_: added Radix dialog, direction, dropdown-menu, slot, and tooltip.
- `frontend/rag-assistant-ui/index.html` — _modified_: pre-paint theme/language bootstrap.
- `frontend/rag-assistant-ui/src/styles/index.css` — _modified_: sidebar tokens, dark-theme values, dialog/sheet keyframes, reduced-motion coverage.
- `frontend/rag-assistant-ui/src/i18n/fa.ts` — _modified_: shell and design-system catalog; exports `Messages`.
- `frontend/rag-assistant-ui/src/i18n/en.ts` — English catalog typed as `Messages`.
- `frontend/rag-assistant-ui/src/i18n/messages.ts` — locale map, `Language`/`Direction`, `directionFor`, `isLanguage`.
- `frontend/rag-assistant-ui/src/i18n/use-language.ts`, `language-provider.tsx` — translation context, `lang`/`dir` application, persistence.
- `frontend/rag-assistant-ui/src/theme/use-theme.ts`, `theme-provider.tsx` — light/dark/system, `.dark` class, media-query listener, persistence.
- `frontend/rag-assistant-ui/src/app/navigation.ts` — typed primary navigation.
- `frontend/rag-assistant-ui/src/app/use-page-title.ts` — page title resolution and `document.title`.
- `frontend/rag-assistant-ui/src/app/providers/app-providers.tsx` — _modified_: theme, language, direction, and tooltip providers around Query.
- `frontend/rag-assistant-ui/src/app/router.tsx` — _modified_: design-system route, lazy hydrate fallbacks.
- `frontend/rag-assistant-ui/src/app/error-boundary.tsx` — _modified_: bilingual fallback using `ErrorState`; imports the catalog because it renders outside providers.
- `frontend/rag-assistant-ui/src/layouts/app-shell.tsx` — _modified_: skip link, fixed sidebar, content offset, sticky header, footer.
- `frontend/rag-assistant-ui/src/layouts/sidebar.tsx`, `header.tsx`, `navigation-list.tsx`, `mobile-navigation.tsx` — sidebar brand/nav/environment, header title and controls, active NavLinks, Radix dialog sheet.
- `frontend/rag-assistant-ui/src/components/ui/input.tsx`, `card.tsx`, `dialog.tsx`, `dropdown-menu.tsx`, `tooltip.tsx`, `spinner.tsx`, `skeleton.tsx` — vendored Radix-based primitives.
- `frontend/rag-assistant-ui/src/components/ui/button.tsx` — _modified_: 44 px-friendly icon sizing rule.
- `frontend/rag-assistant-ui/src/components/shared/empty-state.tsx`, `error-state.tsx` — shared feedback states.
- `frontend/rag-assistant-ui/src/components/shared/theme-menu.tsx`, `language-menu.tsx` — header preference menus with tooltips.
- `frontend/rag-assistant-ui/src/components/shared/feature-placeholder.tsx` — _modified_: uses the catalog and `EmptyState`.
- `frontend/rag-assistant-ui/src/pages/home-page.tsx` — _modified_: catalog-driven content on `Card` primitives.
- `frontend/rag-assistant-ui/src/pages/design-system-page.tsx` — static primitive reference.
- `frontend/rag-assistant-ui/src/pages/route-loading.tsx` — labeled spinner for lazy route hydration.
- `frontend/rag-assistant-ui/src/pages/not-found-page.tsx`, `route-error-page.tsx` — _modified_: catalog-driven shared states.
- `frontend/rag-assistant-ui/src/app/router.test.tsx` — _modified_: shell, navigation sheet, Escape, design-system, and title coverage.
- `frontend/rag-assistant-ui/src/app/preferences.test.tsx` — theme and language switching/persistence.
- `frontend/rag-assistant-ui/src/pages/design-system-page.test.tsx` — primitive rendering, dialog, and dropdown.
- `frontend/rag-assistant-ui/src/test/setup.ts` — _modified_: Radix jsdom stubs and global preference reset.
- `frontend/rag-assistant-ui/src/test/render-app.tsx` — _modified_: renders `AppProviders`.
- `AGENTS.md`, `PROJECT_CONTEXT.md` — _modified_: status, verified results, decisions, next steps.
- `Docs/Ai/frontend-architecture.md`, `frontend-coding-standards.md`, `frontend-testing-standards.md`, `frontend-ui-ux-guidelines.md`, `frontend-security-standards.md`, `frontend-workflow.md` — _modified_: bilingual shell, tokens, components, tests, and storage rules.
- `Docs/Ai/reviews/2026-11-15-layout-design-system.md` — review report.
- `Docs/Ai/reviews/assets/2026-11-15-layout/*.png` — ten verification screenshots.

**Summary:**
Implemented a responsive shell with a fixed sidebar at `lg` and a dialog-based navigation sheet below it, a sticky header with page title, theme menu, and language menu. Added light/dark/system theming and a Persian/English RTL-LTR switch, both persisted in `localStorage` and applied before first paint. Added Radix-backed Button, Input, Card, Dialog, DropdownMenu, Tooltip, Spinner, and Skeleton primitives plus shared EmptyState/ErrorState, and a static `/design-system` page that exercises them. Product routes remain honest placeholders; no HTTP request, auth flow, or fake data was added.

**Typecheck:** `npm run typecheck` (`tsc -b`) — passed, no errors.
**Lint:** `npm run lint` (`eslint .`) — passed, no findings.
**Tests:** `npm run test` (`vitest run`) — 15/15 passed in 3 files.
**Build:** `npm run build` (`tsc -b && vite build`) — succeeded; CSS 32.09 kB, JS 585.50 kB (183.89 kB gzip). Vite warns that the main chunk exceeds 500 kB; no failure.
**Browser verification:** dev server + headless Chrome at 360, 768, and 1440 px in `fa`/`en` and light/dark; sidebar and sheet navigation, dialog, dropdown, theme, and language switching behaved correctly; no console errors or warnings; no page-level horizontal overflow. Screenshots are under `Docs/Ai/reviews/assets/2026-11-15-layout/`.
**Audit:** `npm audit --omit=dev` — 0 production vulnerabilities. Full tree: 7 moderate, all dev-only (`typescript-eslint` → `minimatch`).
**E2E:** Not executed. Playwright is not installed and the backend does not compile.
**Independent review:** Not performed. No reviewer agent was available; the report is a self-review by the implementing agent.

**Known issues / follow-ups:**
- Self-hosted Vazirmatn files are still absent; the font stack falls back to system fonts.
- Main JS chunk is 585.50 kB (183.89 kB gzip); split when feature code lands.
- The dialog/sheet animations are CSS keyframes; no animation library was added.
- Theme and language are client-only; there is no server-side preference endpoint.
- Placeholder pages have no functionality and must not be described as implemented.
- Backend build failure still blocks all runtime integration.

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
