# Frontend Testing Standards — RAG Assistant

> **Status:** Standards for the React application. Foundation tests exist (3, passing); product-feature tests do not.
> **Scope:** `RagAssistantWebApp` only. Backend tests (`RagAssistant.Tests`, xUnit) are owned by `RagAssistantApi` and must not be changed from this repository.
> **Last updated:** 2026-11-15
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
- Disabled/pending state prevents double submission.

### 5.3 Provider wrapper

Create one `renderWithProviders` helper that supplies:

- `QueryClientProvider` with a fresh client per test (`retry: false`, `gcTime: 0`).
- `MemoryRouter` when the component uses routing.
- Auth context with a controllable test session.
- Theme provider if needed.

Do not create a provider monolith that hides which dependency a test relies on; allow overrides.

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

- Login success stores the access token in memory and the refresh token in session storage.
- Access token is never written to `localStorage`.
- Page reload with a stored refresh token triggers exactly one refresh.
- Concurrent 401s trigger exactly one refresh.
- Refresh failure clears the session and redirects to login.
- Refresh network ambiguity is **not** retried with the same token.
- Password change success clears the session.
- Logout clears tokens and TanStack Query caches.

### 8.3 Chat UI

- Markdown renders as formatted text, not raw HTML.
- Raw HTML in model output is not executed or rendered as elements.
- Code blocks render with a language label and copy control.
- Copy action writes the message text and shows feedback.
- Streaming output updates accessible regions without stealing focus (when a streaming contract exists).
- Stop control aborts the request (when a streaming contract exists).
- Citation UI renders only fields supplied by the API; it never fabricates page numbers (see API doc).
- Long messages wrap without horizontal page overflow; code blocks scroll internally.

### 8.4 Documents

- Unsupported file type is rejected before upload with a clear message.
- Oversized file is rejected client-side (UX) and server rejection is handled.
- Per-file upload progress and failure states (when an endpoint exists).
- Processing status polling stops on terminal state and on unmount.
- Delete requires confirmation and surfaces failure.

### 8.5 Forms

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
- The backend currently does not compile; E2E against the real API is **blocked**. Do not substitute a fake backend and call the flow verified.

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
