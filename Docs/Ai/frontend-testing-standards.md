# Frontend Testing Standards — RAG Assistant

> **Status:** Standards for the React application. **68 tests across 11 files pass** (shell/routing, theme and language preferences, design-system primitives, HTTP client transport and refresh, auth provider lifecycle, login page, protected routing, JWT display decoding, safe `returnTo`, chat page behavior, and Markdown/code safety). The chat tests exercise UI behavior against isolated mock data; no real chat contract exists.
> **Scope:** `RagAssistantWebApp` only. Backend tests (`RagAssistant.Tests`, xUnit) are owned by `RagAssistantApi` and must not be changed from this repository.
> **Last updated:** 2026-11-16
>
> Related: [Architecture](./frontend-architecture.md) · [Coding standards](./frontend-coding-standards.md) · [API integration](./frontend-api-integration.md) · [Workflow](./frontend-workflow.md)

---

## 1. Principles

1. Tests verify **observable behavior**, not implementation details.
2. Tests are deterministic, independent, and fast.
3. No arbitrary `setTimeout`, random data, real clocks, or external services.
4. No real backend, database, Qdrant, Ollama, or model access in unit tests.
5. Do not write tests only to raise a coverage number.
6. Do not weaken assertions to make a suite pass.
7. Distinguish tests **written**, tests **executed**, and tests **passed** in every report.
8. Every bug fix gets a regression test when feasible.

---

## 2. Tooling

| Tool | Purpose |
|---|---|
| Vitest | Unit and component test runner; shares the Vite pipeline |
| jsdom | DOM environment |
| React Testing Library (RTL) | Behavior-oriented component tests |
| `@testing-library/dom` | Required peer of RTL 16 |
| `@testing-library/jest-dom` | DOM matchers (`toBeInTheDocument`, …) |
| `@testing-library/user-event` | Realistic user interaction |
| Playwright | End-to-end browser tests |
| MSW (optional, dev-only) | Multi-request network simulation when module mocking is insufficient |

Rules:

- Do not introduce a second test runner or a competing assertion library.
- Do not use Enzyme, Jest, or `react-test-renderer`.
- The Vitest major must be compatible with the chosen Vite major (verify with `npm ls vite vitest`).

---

## 3. Configuration

### 3.1 Vitest

Put the test config in `vite.config.ts` (or a dedicated `vitest.config.ts` that extends it):

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: false,
    setupFiles: ['./src/test/setup.ts'],
    restoreMocks: true,
    clearMocks: true,
    css: false,
    exclude: ['e2e/**', 'node_modules/**', 'dist/**'],
  },
});
```

- `globals: false` — import `describe`, `it`, `expect`, `vi` explicitly.
- `restoreMocks`/`clearMocks` prevent cross-test leakage.
- Do not include `e2e/` in Vitest.
- No coverage thresholds globally at first; see §11.

### 3.2 Setup file

`src/test/setup.ts`:

```ts
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});
```

Add global stubs only for APIs genuinely unavailable in jsdom (for example, `matchMedia`, `ResizeObserver`, `scrollTo`). Each stub must be minimal and documented. Do not stub `fetch` globally here.

Implemented stubs in `src/test/setup.ts` (required by the Radix primitives, the theme provider, and chat auto-scroll):

- `window.matchMedia` returning a non-matching `MediaQueryList` with `addEventListener`/`removeEventListener` (the theme provider subscribes when the theme is `system`).
- `ResizeObserver` with no-op `observe`/`unobserve`/`disconnect` (popover and dialog positioning, and the chat message list's auto-scroll sync).
- `Element.prototype.scrollIntoView`, `hasPointerCapture`, `releasePointerCapture`, and `setPointerCapture` (menu pointer handling and focus movement).

`afterEach` must also reset global state that providers mutate outside React: call `cleanup()`, `localStorage.clear()`, remove the `dark` class, and restore `<html lang="fa" dir="rtl">`. Without this, preferences leak between tests.

Implemented `afterEach` (2026-11-16): `cleanup()`, `clearTokens()`, `sessionStorage.clear()`, `localStorage.clear()`, `vi.unstubAllGlobals()`, remove `dark`, restore `<html lang="fa" dir="rtl">`. Token cleanup runs before storage clearing so the module-level access token does not survive a test.

### 3.3 Path aliases

The `@/` alias must resolve identically in Vite and Vitest. Do not duplicate alias definitions with different values.

---

## 4. Test Layout and Naming

- Co-locate unit/component tests with source: `chat-message.tsx` → `chat-message.test.tsx`.
- Keep fixtures and handlers in `src/test/` (`fixtures/`, `handlers/`).
- E2E specs live in `e2e/` with `.spec.ts`.
- Suffixes: `.test.ts` (logic/hooks), `.test.tsx` (components), `.spec.ts` (Playwright).

Naming:

- `describe` names the unit: `describe('ChatMessage', …)`, `describe('httpClient', …)`.
- `it` states the scenario and outcome in plain language:
  - `it('renders the assistant message as markdown')`
  - `it('shows a generic message when login returns 204')`
  - `it('refreshes once and retries the original request after a 401')`
  - `it('does not retry refresh after a network timeout')`
- Test names are English. Assertions may target Persian UI text; prefer accessible roles and names over raw strings where possible.

---

## 5. Component Testing (RTL)

### 5.1 Rules

- Render the component the way the user sees it. Avoid reaching into internal state.
- Query priority: `getByRole` → `getByLabelText` → `getByPlaceholderText` → `getByText` → `getByTestId` (last resort).
- Use `userEvent.setup()` and await interactions.
- Use `findBy*` for asynchronous appearance; do not wrap in manual `waitFor` unless necessary.
- Assert on what the user can perceive: visible text, accessible name, disabled state, error message.
- Do not assert on class names, internal hook calls, or component tree shape.
- No snapshot tests. They assert everything and therefore nothing.
- `data-testid` only for elements with no accessible identity (for example, a chart container); justify each use.

### 5.2 Required coverage per interactive component

- Default/empty render.
- Loading state.
- Error state with retry.
- Keyboard interaction for interactive elements.
- RTL/Persian content rendering (text direction, no clipped labels) where layout matters.
- LTR/English content rendering after the language switch.
- Disabled/pending state prevents double submission.

### 5.3 Provider wrapper

`src/test/render-app.tsx` renders the real `AppProviders` stack around a memory router:

- `ThemeProvider` (light/dark/system).
- `LanguageProvider` + Radix `DirectionProvider` (fa/rtl default).
- `TooltipProvider`.
- `QueryClientProvider` with a fresh client per test (`retry: false`, `gcTime: 0`), injectable via the `queryClient` prop.
- `createMemoryRouter(routes, { initialEntries })` for route-level tests.

For component-only tests, render the component inside `AppProviders`; do not bypass the providers if the component reads `t`, `dir`, or `theme`. When authentication exists, add a controllable test session to this helper rather than a second wrapper.

Implemented test session (2026-11-16): `renderApp` (and the provider helper) accepts `authenticated?: boolean`, default `true`, and seeds a fake session before render using `src/test/auth.ts`:

- `createAccessToken(claims?)` builds a three-segment JWT with `UserId`, `preferred_username`, `useremail`. It is not signed; the app never verifies it.
- `createTokenResult(overrides?)` returns a valid `JwtTokenResult`.
- `seedSession()` stores both tokens via the real `setTokens`; `seedRefreshToken()` writes only the refresh token to `sessionStorage` (for restore tests).
- Auth tests that need an anonymous start pass `authenticated: false`.

Seeding by default keeps the pre-existing shell/layout tests meaningful now that `/` is protected. `src/test/api.ts` provides `apiEnvelope`, `apiFailure`, `jsonResponse`, and the `FetchMock` type used with `vi.fn<FetchMock>()`.

Do not create a provider monolith that hides which dependency a test relies on; allow overrides.

### 5.4 Theme, language, and direction coverage

Required shell scenarios (implemented in `src/app/preferences.test.tsx` and `src/app/router.test.tsx`):

- Default state is Persian, RTL, and system theme.
- Selecting dark adds `.dark` to `<html>` and persists `theme=dark`; selecting light removes it.
- Selecting system persists `theme=system` and follows the media query.
- Selecting English changes the accessible names and copy, sets `<html lang="en" dir="ltr">`, and persists `language=en`; switching back restores `fa`/`rtl`.
- Persisted preferences are applied on load before assertions.
- Mobile navigation sheet opens, navigates, and closes on Escape; focus returns to the trigger (Radix behavior).
- Every interactive primitive is asserted by role/name, not by class name.

### 5.5 Chat preview coverage (implemented 2026-11-16)

`src/features/chat/chat-page.test.tsx` (16 tests) renders the real app at `/chat` with a seeded session and asserts user-visible behavior:

- Shell and content: page heading, conversation header, timestamps, and role labels.
- Markdown and highlighted code, using a stable row query rather than raw class assertions for layout.
- Message copy success (`navigator.clipboard.writeText` stubbed with `vi.fn()` **after** `userEvent.setup()`, because user-event installs its own clipboard stub) and the failure path when `navigator.clipboard` is absent.
- Code-block copy (copies the code text, not the whole message).
- Regenerate replaces the last assistant reply with the next mock variant; old text is removed.
- Source expansion reveals the snippet, sets `aria-expanded`, and the toggle is keyboard reachable.
- Enter sends and clears the composer, the Stop control appears, and the mock reply arrives after `MOCK_REPLY_DELAY_MS`.
- Shift+Enter inserts a newline instead of sending.
- Stop leaves the message count unchanged after the timer would have fired.
- New chat + suggestion send, search filtering with a no-match state, delete with confirmation, and deleting all conversations reaching the no-conversation state.
- Mobile history sheet opens, selects a conversation, and closes.
- English/LTR and dark theme seeded through persisted preferences.
- `afterEach` deletes `navigator.clipboard` so stubs do not leak.

`src/features/chat/components/markdown-message.test.tsx` (4 tests) covers:

- Formatted text and lists.
- Only absolute `http(s)` links become anchors with `target`/`rel`; relative and `javascript:` links render as text.
- Images and raw HTML never render (`img` and injected attributes are null; alt text is shown).
- Fenced code renders `.chat-code pre`, applies `.hljs-keyword`, shows the language label, and exposes the code copy button.

Mock data is not a fixture of the transport; no test asserts a chat request because none exists. Do not add a fake `fetch` expectation for chat and call it integration coverage.

### 5.6 Documents preview coverage (implemented 2026-11-17)

74 new tests across six documents files plus one router test (suite total 142 tests / 17 files):

- `src/features/documents/lib/validation.test.ts` (9): valid PDF, uppercase `.PDF`, wrong extension, `.pdf` with a foreign MIME, empty MIME accepted, zero bytes, oversize, duplicate in the queue, and duplicate against the preview list. First failure wins.
- `src/features/documents/lib/query.test.ts` (22): case/whitespace-insensitive search, status and type filters, combined filters, collator name order, all six sorts via `it.each`, stable ordering, immutable input, pagination totals/slicing/clamping, fallback page size, and parse/serialize round-trips that omit defaults.
- `src/features/documents/lib/format.test.ts` (10): byte units, Persian digits, zero, invalid ISO input, and middle truncation that preserves the extension without touching short names.
- `src/features/documents/components/document-upload.test.tsx` (10): accessible hints, picker with one and multiple files, `.txt` rejection (asserted inside `role="alert"` so shared strings cannot produce a false pass), oversize, duplicates, uploading → done with real timers and `waitFor`, adding to the store, remove/cancel, `fireEvent.drop` with `{ dataTransfer: { files } }`, and the dropzone being a real button.
- `src/features/documents/documents-page.test.tsx` (15): banner and rows, visible status text, `dir="ltr"` filenames and icon+text badges, search updating both URL and list, filters, sort, pagination and URL, restoring state from the URL, filtered-empty, empty, DEV loading/error, delete cancel/confirm, disabled retry, and an English-copy regression that fails if Persian documents copy leaks.
- `src/features/documents/routes/document-details-page.test.tsx` (7): metadata, absent progress plus the explanatory note, a determinate bar when progress is injected, delete navigating back, back link, unknown id, and disabled retry.
- `src/app/router.test.tsx` (modified): the documents route asserts the search field and drop control exist and that no "not implemented" copy renders; the placeholder assertion moved to data sources.

Harness rules learned here:

- Call `resetDocumentPreviewStore()` in `beforeEach`; the store is module-scoped and leaks across tests otherwise.
- Use `renderApp({ initialPath: '/documents?status=indexed&page=2' })` and assert `router.state.location.search` for URL-owned state.
- Use `userEvent.setup({ applyAccept: false })` when a test must reach a type-rejection path that the picker would otherwise filter out.
- No `URL.createObjectURL` stub is needed because the feature never creates object URLs; verify by grep instead of guarding defensively.
- Do not use the browser to prove what jsdom can assert (labels, `aria-live`, `aria-valuenow`); do not use jsdom to prove layout, RTL, or theme.

Mock data is not a fixture of the transport; no test asserts a documents request because none exists.

### 5.7 Data sources and settings preview coverage (implemented 2026-11-17)

78 new tests across nine files plus router edits (suite total at that point: 220 tests / 26 files):

- `src/features/data-sources/lib/validation.test.ts` (11): valid input, trimming via `schema.parse`, short name, duplicate against the store excluding the edited id, hostname rejection, port bounds and non-integers, missing database/username, password required on create, optional on edit, and payload builders that never copy the password.
- `src/features/data-sources/mock/data-source-preview-store.test.ts` (6): five seeded records with no credential keys, subscribe notifications, add/update/remove, reset/clear, and `useSyncExternalStore`-compatible snapshots.
- `src/features/data-sources/components/schema-browser.test.tsx` (7): tree/treeitem/group roles, nine visible items for `src-01`, click collapse/expand, Arrow/Home/End/Enter behavior and roving tabindex, nullability text, and the null-schema empty state.
- `src/features/data-sources/routes/data-sources-page.test.tsx` (10): banner and five rows, icon+text status badges and LTR hosts, add link, delete cancel/confirm, DEV loading/error, empty state, English copy regression via the labelled list, and unknown-id not-found.
- `src/features/data-sources/routes/data-source-form-page.test.tsx` (10): six empty-field errors, port 70000 rejection, duplicate name, create → list and details with announcement, edit prefill and a single SQL Server option, blank password keeps `hasCredential`, password absent from DOM/store/storage after save, cancel, back link, and unknown edit id.
- `src/features/data-sources/routes/data-source-details-page.test.tsx` (9): metadata and localized dates, LTR connection values, credential configured and never shown, disabled test connection with reason, schema tree contents, empty schema on `src-05`, edit link, delete returning to the list, and unknown id.
- `src/features/settings/lib/settings-schema.test.ts` (8): defaults valid, model trim/required/max length, timeout bounds, chunk bounds, overlap < chunk, fractional values rejected, and top-K bounds.
- `src/features/settings/mock/settings-draft-store.test.ts` (5): seeded defaults, AI and retrieval saves are isolated, per-section reset, full reset, and unsubscribe.
- `src/features/settings/routes/settings-page.test.tsx` (12): General read-only values, nav `aria-current` and navigation, dark theme applied and persisted, language switch to `en`/LTR, AI validation and session-only save, AI reset, AI preview and fixed Ollama provider, Embedding server-managed rows with no textbox, retrieval defaults with disabled similarity, overlap error, unknown section, and English copy regression.
- `src/app/router.test.tsx` (modified): the data-sources route renders the list, the settings route renders General navigation, and the unknown-section state renders; the placeholder assertion is gone.

Harness rules learned here:

- Call `resetDataSourcePreviewStore()` and `resetSettingsDraftStore()` in `beforeEach`.
- After `waitFor(pathname)`, use `findBy*`/`findByRole` for the destination UI: `waitFor` can resolve before React commits the lazy route.
- Assert duplicate-prone copy with `getAllByText` or scope with `within(nav)`/`within(tree)`.
- The details delete button has the plain accessible name `حذف منبع داده`; the row buttons carry per-source labels.
- `src/test/setup.ts` sets `configure({ asyncUtilTimeout: 3000 })` so lazy routes stay reliable under full-suite load.
- No network or object-URL stubs are needed; a grep proves the features contain no `fetch`, `axios`, storage, or connection string.

### 5.7.1 Development preview sign-in coverage (implemented 2026-11-17)

10 new tests across three files (suite total 230 tests / 27 files):

- `src/features/auth/preview/preview-admin-session.test.ts` (4): no session before start, a started session exposes the `admin` identity with the `Admin` role and no access token, read-back, and clear.
- `src/features/auth/auth-provider.test.tsx` (+3): the preview sign-in authenticates without calling `fetch`, the marker restores the session on remount, and logout clears the marker. The existing provider tests are unchanged; role claims are covered in `jwt.test.ts`.
- `src/features/auth/routes/login-page.test.tsx` (+1): the labelled preview action signs in and returns to `returnTo` with no request and no refresh token written.
- `src/auth/jwt.test.ts` (+2): role claims are read from both `role` and the `ClaimTypes.Role` URI with de-duplication, and missing claims yield `roles: []`.

Notes:

- Vitest runs with `import.meta.env.DEV === true`, so the preview path is exercised normally. The production guard cannot be unit-tested through `import.meta.env`; it is verified against `dist` and `npm run preview` instead (no preview card, no marker key in the bundle, a hand-written marker does not authenticate).
- Tests must never assert that preview sign-in is real authentication; assert the absence of a token and of a network call.

### 5.8 Browser verification for visual UI

Component tests do not prove layout, RTL, or theme behavior. When a task changes visual layout:

- Drive a real browser at 1440, 768, and 360 px minimum, in `fa` and `en`, in light and dark.
- Assert structural facts programmatically: `documentElement.lang/dir`, `.dark`, list/sidebar visibility, scroll-to-bottom, and `scrollWidth <= clientWidth` (no page-level horizontal overflow).
- Capture screenshots under `Docs/Ai/reviews/assets/<date>-<task>/` and reference them in the review report.
- If the in-app browser has no visible surface (0×0 viewport / hidden visibility), use headless Chrome over CDP and say so; do not claim screenshots that were not produced.
- A mocked session restore (init script seeding `sessionStorage` and answering `/api/auth/refresh`) is acceptable for reaching a guarded page, but it is not backend verification.

---

## 6. Hook Testing

- Use `renderHook` from RTL.
- Wrap hooks that need providers with the same helper.
- Test the hook's public contract: returned values and side effects, not internal `useState` calls.
- For async hooks, use `waitFor` on the observable result.
- For timer-based behavior, use `vi.useFakeTimers()` and restore in `afterEach`.

Required hook scenarios:

- Initial loading → success.
- Failure → error state and retry.
- Cancellation on unmount does not update state.
- Single-flight refresh under concurrent 401s (exactly one refresh call).

---

## 7. API Mocking

Two levels, in order of preference:

### 7.1 Module-level mocking (default)

Mock the feature API module or `httpClient` with `vi.mock`. This is fast, explicit, and keeps tests close to the code's real boundary.

```ts
vi.mock('@/features/chat/api/chat.queries', () => ({
  conversationQueryOptions: vi.fn(),
}));
```

Rules:

- Mock at the API layer, not `fetch` internals, unless the test is specifically about transport behavior.
- Return typed fixtures from `src/test/fixtures`.
- Reset mocks between tests (`restoreMocks: true`).
- Do not mock React Query itself; test the real caching/error behavior.

Implemented transport/flow strategy (2026-11-16):

- Transport tests (`src/api/http-client.test.ts`) stub `fetch` with `vi.stubGlobal('fetch', mock)`. `mock` is a `vi.fn<FetchMock>()` typed by `FetchMock` in `src/test/api.ts`, so it has no untyped parameters and lint stays clean.
- Flow tests (login page, provider, routing) also stub `fetch`, because they exercise the real client and envelope parsing. That is deliberate: mocking `httpClient` there would hide the 204/envelope behavior the tests exist to protect.
- `vi.unstubAllGlobals()` in `afterEach` restores any real `fetch`.
- No MSW is installed; add it only when a multi-request interaction cannot be expressed with a sequenced fetch stub.

### 7.2 MSW (optional)

Use MSW when a test spans multiple requests and the interaction between them matters (for example, 401 → refresh → retry). MSW is dev-only; it must never be enabled in a production build.

- Handlers live in `src/test/handlers`.
- Default handlers simulate the documented contract, including the envelope.
- Each test overrides only the handlers it needs.
- Never point MSW at a real backend URL; intercept locally.

---

## 8. Required Scenarios

### 8.1 Transport and contract

- `ApiResponse` envelope with `isSuccess: true` and a value.
- Envelope with `isSuccess: false` while HTTP status is 200 → treated as failure.
- Login failure: HTTP 204 with empty body → generic invalid-credentials message.
- HTTP 403 → permission state.
- HTTP 500 with a non-JSON body (for example, an HTML development error page) → safe generic error, body not rendered.
- Malformed JSON → contract error.
- Timeout/abort → no error toast for intentional cancellation.
- `statusCode` in the body is not trusted (regression test for the backend's current behavior).

### 8.2 Authentication

Status legend: **✔ implemented** (covered by an executed test), **— not applicable yet**.

- ✔ Login success stores the access token in memory and the refresh token in session storage.
- ✔ Access token is never written to `localStorage`.
- ✔ Page reload with a stored refresh token triggers exactly one refresh (provider restore test).
- ✔ Concurrent 401s trigger exactly one refresh.
- ✔ Refresh failure clears the session and redirects to login (expired-session notice with `returnTo`).
- ✔ Refresh without a stored token rejects and emits `session-expired` only once.
- ✔ Refresh network ambiguity is **not** retried with the same token (no retry loop in `performRefresh`).
- ✔ Logout clears tokens and local session state, and posts to `/api/auth/logout` with the refresh token.
- ✔ `login`, `logout`, and session expiry call `queryClient.clear()`. No feature query exists yet, so cache contents cannot be asserted; add that assertion with the first feature query.
- ✔ Unsafe or missing `returnTo` is ignored (open-redirect tests).
- ✔ Invalid credentials (HTTP 204) and network/server failures render safe messages and stay on `/login`.
- ✔ Empty submit is blocked client-side and never calls `fetch`.
- ✔ An authenticated visitor of `/login` is redirected away.
- ✔ A protected deep link redirects to `/login?returnTo=…` and returns there after login.
- ✔ JWT display decoding degrades to nulls for malformed tokens.
- — Password change and logout-all (no UI yet).

### 8.3 Chat UI

Status legend: **✔ implemented** (UI preview with mock data), **— not applicable until a contract exists**.

- ✔ Markdown renders as formatted text, not raw HTML.
- ✔ Raw HTML in model output is not executed or rendered as elements.
- ✔ Code blocks render with a language label and copy control.
- ✔ Copy action writes the intended text (message or code) and shows success/failure feedback.
- ✔ Conversation history supports new chat, search, selection, and delete with confirmation (mock state).
- ✔ Sources expand to show only the fields provided; the preview never invents values beyond its mock fixtures, and missing page/score values are tolerated.
- ✔ Long messages wrap without horizontal page overflow; code blocks scroll internally.
- ✔ Enter/Shift+Enter behavior and IME composition are covered.
- ✔ Stop cancels the local simulated reply (UI state only).
- ✔ Empty conversation, no-conversation, and search-empty states are covered.
- — Streaming output updates accessible regions without stealing focus (no streaming contract).
- — Stop aborts a real request (no request exists).
- — Citation fields come from the API (mock only today).

### 8.4 Documents

- Unsupported file type is rejected before upload with a clear message.
- Oversized file is rejected client-side (UX) and server rejection is handled.
- Per-file upload progress and failure states (when an endpoint exists).
- Processing status polling stops on terminal state and on unmount.
- Delete requires confirmation and surfaces failure.
- **Implemented now (preview):** PDF/empty/oversize/duplicate validation, indeterminate progress with no percentage, upload → `uploaded` never advancing, URL-owned search/filter/sort/pagination surviving reload, delete cancel/confirm, disabled retry, details progress absent unless injected, and an English-copy regression.

### 8.5 Data sources and settings (preview)

- **Implemented now (preview):** add/edit validation with inline errors and `aria-invalid`; duplicate-name and port-bound rejection; create and edit navigating to details; blank password keeping `hasCredential`; password absent from DOM/store/storage after save; delete cancel/confirm; disabled connection test with reason; schema tree mouse and keyboard operation; DEV loading/error/empty states; appearance persistence across reload; AI/retrieval session-only save/reset; overlap ≥ chunk rejection; disabled similarity threshold; unknown routes.
- **When contracts exist:** connection-failure mapping from the test endpoint, server-side duplicate/schema errors preserving input, credential rotation with a never-returned secret, and settings audit/validation responses.

### 8.6 Forms

- Required-field errors appear next to fields.
- Invalid values are not submitted.
- Server validation failure preserves user input.
- Submit is disabled while pending.
- Password fields are never prefilled.

---

## 9. Edge Cases Checklist

- Empty conversation, empty document list, empty search result.
- Very long message, long filename, long document title.
- Persian text with mixed Latin code/identifiers (bidi).
- Null optional fields from the API (`null` page number, null score).
- Duplicate submits (double click / Enter).
- Rapid navigation away during a request.
- Network offline and reconnect.
- Session expiry mid-form.
- 401 during a mutation (must not duplicate the mutation).
- Unknown enum value from the backend (default safely, do not crash).
- Unknown extra fields in a response (must be ignored, not break).
- Browser back/forward with URL search params.
- Screen reader announcements for streaming content.

---

## 10. Playwright E2E

### 10.1 Scope

E2E covers critical user journeys only:

1. Login with valid credentials → chat shell.
2. Login with invalid credentials → generic error.
3. Session restore after reload.
4. Logout.
5. Chat send → assistant reply (only after a working backend contract exists).
6. Document upload → processing status (only after an endpoint exists).
7. Unauthorized route access → redirect to login.

Do not duplicate every component test in E2E.

### 10.2 Configuration

```ts
// playwright.config.ts (proposed)
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:5173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
```

- Start with Chromium. Add Firefox/WebKit after the critical path is stable.
- Enable mobile viewport coverage for the chat and upload interfaces.
- Use trace on failure; never commit traces containing real data.
- Always `npx playwright install` in a fresh environment.

### 10.3 Authentication in E2E

- Prefer a real login through the API once per worker, not through the UI for every test.
- Persist the resulting refresh token into `sessionStorage` via `page.addInitScript` for the base URL.
- Do not hardcode credentials. Read them from an untracked `.env.e2e.local` or CI secrets.
- Never run E2E against production or a shared database.
- The backend previously failed startup due to JWT secret validation. On 2026-11-22 the HTTPS Swagger UI and OpenAPI document responded, but no authenticated flow was exercised. Recheck backend availability before each integration run; do not substitute a fake backend and call the flow verified.

### 10.4 Determinism

- No fixed sleeps. Use Playwright auto-waiting and web-first assertions.
- Seed or create test data through documented APIs only; clean up when safe.
- Tests must not depend on execution order.
- Do not assert on animations or exact timestamps.

---

## 11. Coverage

- Coverage is an indicator, not proof of correctness.
- No global fail threshold initially. If thresholds are added, apply them narrowly to high-risk modules:
  - `src/api/http-client.ts` (envelope, errors, refresh).
  - `src/features/auth` (session lifecycle).
  - `src/lib/env.ts`.
- Do not chase coverage on presentational components at the expense of behavioral tests.
- Exclude generated shadcn primitives, type-only files, and config from coverage.

---

## 12. Commands

Current scripts in `frontend/rag-assistant-ui/package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "typecheck": "tsc -b",
    "lint": "eslint .",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

`typecheck` uses `tsc -b` because the project uses TypeScript project references (`tsconfig.json` → `tsconfig.app.json` + `tsconfig.node.json`); `tsc --noEmit` alone would not check the referenced projects.

Not added yet, deliberately: `test:coverage` (no coverage provider installed) and `e2e`/`e2e:ui` (Playwright is not installed). Add them with their dependencies when the first real use exists.

Quality gate order before reporting a task complete:

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

Run `npm run e2e` when the change affects a critical journey **and** a runnable backend is available. If the backend is unavailable, state that E2E was not executed.

---

## 13. Reporting

Every task report must include:

- Test files added or changed.
- Scenarios covered.
- Exact commands executed.
- Passed / failed / skipped counts, when available.
- Tests written but not executed, and why.
- Backend or external dependencies not available.
- Known gaps.

Never say "all tests pass" without the executed command and its result. Never present a test that only runs against mocks as proof that the real API works.
