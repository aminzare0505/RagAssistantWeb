# Review — Authentication UI and Integration

> **Date:** 2026-11-16
> **Scope:** Implementation of Task 3 — HTTP transport, session primitives, `AuthProvider`, login page, route guards, account menu, and tests in `frontend/rag-assistant-ui/`.
> **Reviewer:** Implementing agent (self-review). **No independent reviewer agent was available; an independent review did not occur.**
> **Inputs reviewed:** every file listed in the 2026-11-16 changelog entry, the executed gate outputs, the source-verified backend `AuthController` contract, and the browser observations recorded in `Docs/Ai/CHANGELOG_AI.md`.

---

## A. Overall assessment

The change implements authentication and nothing else. The frontend calls exactly three source-verified endpoints — `POST /api/auth/login`, `POST /api/auth/refresh`, `POST /api/auth/logout` — and no register page exists because the backend has no registration endpoint. Chat, documents, data sources, settings, streaming, and citations remain placeholders.

The session model matches the documented backend constraints: access token in memory, refresh token in `sessionStorage`, one shared refresh request, one retry after a 401, and no automatic retry of a refresh (family revocation makes that mandatory). Controllers that return the object rather than an `ActionResult` are handled by requiring both HTTP 2xx and `isSuccess: true`; the body `statusCode` is ignored. HTTP 204 is mapped to a generic invalid-credentials message without revealing whether the username exists.

Route protection covers the whole product tree. A deep link while anonymous becomes `/login?returnTo=…`, and the original path is restored after login only when it is a safe internal path. An authenticated visitor of `/login` is redirected away. During session restore the guard shows a labeled spinner rather than flashing either the login page or the shell.

Typecheck, lint, tests (48), and the production build pass. Browser behavior was exercised with a mocked `fetch` plus one genuine failing request; screenshots could not be produced because the browser tool reported an unavailable viewport. No endpoint has been executed against a live backend: the solution builds, but the API cannot start until `Authentication:Jwt:SecretKey` is at least 32 characters.

Not verified: independent review, live API behavior, E2E, automated accessibility scanning, cross-tab refresh behavior, and mobile/screen-reader behavior on real devices.

---

## B. Security findings

Classes checked: token storage, refresh concurrency, open redirects, credential handling, error leakage, XSS sinks, new dependencies, authorization assumptions, and logging.

| # | Severity | Location | Evidence | Assessment / fix |
|---|---|---|---|---|
| B-1 | Low (accepted residual risk) | `src/auth/token-store.ts:1-33` | Access token is a module variable; refresh token is `sessionStorage['refresh_token']`; both writes are wrapped in `try/catch` | Matches AD-07 and the security matrix. No token reaches `localStorage`; tests assert that. `sessionStorage` remains readable by an XSS payload, and a duplicated tab can race the original on refresh. The documented fix is backend-issued httpOnly cookies; do not simulate with JS cookies. |
| B-2 | Informational | `src/api/http-client.ts:197-242` | Module-level `refreshInFlight` promise; `performRefresh` never retries; failure clears tokens and emits one event | Correct for family-based rotation. Exactly one refresh per tab; concurrent callers share the promise. A network-ambiguous refresh clears the session instead of replaying the old token. |
| B-3 | Informational | `src/api/http-client.ts:166-178` | 401 → `refreshAccessToken()` → retry once, guarded by `hasRetried`; retry is skipped if the in-memory token already rotated | Fail-closed: after the retry a second 401 becomes `unauthorized` and the session is already cleared. No loop is possible. |
| B-4 | Informational | `src/features/auth/safe-return-to.ts:1-25` | Rejects non-root paths, `//` prefixes, `/login` (and its query/hash forms), backslashes, and control characters | Blocks open redirects and a self-referential login loop. A manual `?returnTo=/login` previously could bounce between the guard and the login route; it now falls back to `/`. Covered by `safe-return-to.test.ts`. |
| B-5 | Informational | `src/features/auth/login-error-message.ts:6-24` | All `ApiError` kinds map to fixed catalog strings; unknown errors map to `unexpected` | No body, stack, or server text is rendered; `forbidden`, `not-found`, and `contract` degrade to a generic message. Login never distinguishes unknown user from wrong password. |
| B-6 | Informational | `src/api/api-error.ts:18-32` | Error carries `kind`, `httpStatus`, `errors[]`, `retryable`; never a request body, token, or response HTML | Correct data minimization. `retryable` defaults true only for `network`/`timeout`; 5xx is marked explicitly. |
| B-7 | Informational | `src/api/http-client.ts:141-144` | `auth` defaults to `'required'` and throws `unauthorized` **before** calling `fetch` when no token exists | Fails closed for future feature calls; auth endpoints opt out explicitly with `auth: 'none'`. |
| B-8 | Informational | `src/api/http-client.ts:161-164` | Any HTTP 204 becomes `unauthorized` | Correct today: login with invalid credentials is the only verified 204. **Limitation:** a future endpoint that legitimately returns 204 (for example a delete) would be misclassified; make the classification per-endpoint when such a contract appears. |
| B-9 | Informational | `src/auth/jwt.ts:26-54` | Decodes payload with `atob` + `TextDecoder`, reads `UserId`, `preferred_username`, `useremail`, returns nulls on any failure | Display only and explicitly documented as unverified; no permission is derived from claims and the account menu gates nothing. |
| B-10 | Informational | `src/features/auth/auth-provider.tsx:85-98` | Logout clears memory token, `sessionStorage`, user, and query cache **before** a best-effort `POST /api/auth/logout` | Local logout never depends on the network, matching the backend note that the access token stays valid until expiry. No token is logged. |
| B-11 | Informational | Repository-wide | No `dangerouslySetInnerHTML`, `innerHTML`, `eval`, or model-rendered HTML; no third-party origin, font, or analytics request added | The two new dependencies (`react-hook-form`, `@hookform/resolvers`) are form/validation libraries with no network behavior. |
| B-12 | Informational | `src/features/auth/routes/login-page.tsx:107-117` | Password input uses `type="password"` with `autoComplete="current-password"`; toggle switches `type` only, never the value | Password is never prefilled from storage, put in a URL, or logged. Field errors are static catalog strings. |

No vulnerable pattern was found in the reviewed classes. This is **not** a full security audit. The largest unaddressed item is unchanged: no Content-Security-Policy is configured, and the existing inline theme bootstrap (`index.html`) will need a hash or nonce when one is.

---

## C. Performance findings

1. **Bundle size** — Production output is 646.91 kB JavaScript (203.37 kB gzip) and 33.40 kB CSS. The increase over Task 2's 585.50 kB is `react-hook-form` + `@hookform/resolvers`, the auth feature, and the HTTP client. Vite emits the existing >500 kB advisory. Recorded as a follow-up; feature routes remain lazy.
2. **Initial work** — The shell, login page, and `AuthProvider` are eager because they gate first paint. Feature modules still load lazily behind `hydrateFallbackElement`.
3. **Restore path** — One refresh request on load, rendered behind a spinner. No polling, no background timers; token expiry is handled reactively on 401 rather than with a client-side timer.
4. **Re-render surface** — `AuthProvider` memoizes its context value on `[status, user, sessionEndedReason, login, logout]`; `login`/`logout` are stable callbacks. A status change re-renders the guard and header, which is expected.
5. **Test cost** — The suite added 33 tests and now runs in ~26 s in jsdom; component tests dominate. No real timers are used except fake/stubbed fetch sequences.

No performance defect requires action in this change.

---

## D. Impact analysis / regression risk

- All changes are inside `frontend/rag-assistant-ui/` except documentation. The backend repository was not modified; its working tree was already dirty and remains so.
- **Routing behavior changed intentionally:** `/` and all product paths are now behind `RequireAuth`. The 15 pre-existing shell/theme/design-system tests were kept meaningful by seeding a fake session in `renderApp` by default (`authenticated: true`); they still exercise the same assertions. No prior assertion was deleted or weakened.
- `src/test/setup.ts` now clears tokens, `sessionStorage`, `localStorage`, and global stubs between tests. This is stricter than before and prevents token leakage across files.
- `src/app/router.tsx` moved `/login` under `AuthLayout` and wrapped the shell in `RequireAuth`. The 404 stays inside the authenticated tree, so an anonymous visitor of an unknown path is sent to login first — consistent with not revealing which paths exist.
- The header gained `UserMenu`; layout and theme behavior are unchanged.
- `src/i18n` gained an `auth` block and revised home copy in both catalogs; typed catalogs keep the two languages structurally aligned.
- Residual risk: session restore depends on the backend's refresh contract, which is source-verified only. If the real response shape differs, login/refresh fail closed with a contract error rather than silently continuing.

---

## E. Test results

Commands were run from `frontend/rag-assistant-ui/` using portable Node 24.22.3 / npm 11.19.1, after the `returnTo` fix.

| Command | Result |
|---|---|
| `npm run typecheck` (`tsc -b`) | Passed — no errors |
| `npm run lint` (`eslint .`) | Passed — no findings |
| `npm run test` (`vitest run`) | Passed — 48/48 in 9 files |
| `npm run build` (`tsc -b && vite build`) | Passed — CSS 33.40 kB; main JS 646.91 kB (203.37 kB gzip); one chunk-size advisory |
| `npm run e2e` | Not executed — Playwright is not installed and the backend cannot start |

Coverage by file:

| File | Tests | Focus |
|---|---|---|
| `src/api/http-client.test.ts` | 11 | Bearer header and envelope value; fail-closed without a token; 204 → unauthorized; envelope failure classification; 400 → validation and 503 → server (retryable); non-JSON → contract; network rejection; one refresh then one retry; concurrent 401s share one refresh; refresh failure clears tokens and emits once; refresh without a token rejects and emits |
| `src/features/auth/auth-provider.test.tsx` | 5 | Anonymous start; restore success; restore failure clears the refresh token; expiry event leads to anonymous/expired; logout clears state and posts the refresh token |
| `src/features/auth/routes/login-page.test.tsx` | 8 | Protected redirect with `returnTo`; empty submit blocks fetch; 204 invalid credentials; network failure; successful login returns to the target with token storage asserted; unsafe `returnTo` ignored; authenticated visitor redirected; password visibility toggle |
| `src/app/auth-routing.test.tsx` | 2 | Stale refresh token + failed refresh shows the expired notice with `returnTo`; account menu identity and sign-out clear storage and post logout |
| `src/auth/jwt.test.ts` | 3 | Claims decoded; numeric/missing/array claims degrade; malformed tokens return nulls |
| `src/features/auth/safe-return-to.test.ts` | 4 | In-app path accepted; missing/relative/external rejected; backslash/control characters rejected; `/login` rejected |
| Pre-existing (`src/app/router.test.tsx` 6, `src/app/preferences.test.tsx` 6, `src/pages/design-system-page.test.tsx` 3) | 15 | Shell, navigation, preferences, primitives — still passing with a seeded session |

Not covered: live API behavior, real cookie/refresh rotation, cross-tab refresh races, screen-reader output, axe scanning, and visual regression. Coverage was not measured; no threshold is configured.

Browser verification (dev server, scripted DOM events, mocked `window.fetch`):

| Area | Observation |
|---|---|
| Guard | Anonymous deep link to `/settings` landed on `/login?returnTo=%2Fsettings` |
| Validation | Submitting empty fields showed both required messages with `aria-invalid` and `aria-describedby`; no request was sent |
| Invalid credentials | 204 produced the generic alert and stayed on `/login`; no refresh token was stored |
| Success | Login posted `{"username":"admin","password":"secret"}`, returned to `/settings`, stored the refresh token in `sessionStorage`, and left `localStorage` empty |
| Restore | A real failing request (502) produced the expired-session notice; a stubbed successful refresh restored the shell |
| Logout | Account menu showed the decoded identity; sign-out posted the refresh token, cleared storage, and returned to `/login` |
| Preferences | Theme switch and English/LTR switch still work on the login and shell screens |

Screenshots were **not produced**: the browser tool reported `NATIVE_BROWSER_VIEWPORT_UNAVAILABLE` (0×0, not visible). This is recorded as a verification gap, not as a passing visual check.

---

## F. Pre-release checklist

- [x] Scope matches the request; no product feature beyond auth, no invented endpoint.
- [x] No `any`, unsafe cast, or suppressed type error.
- [x] API access only through `httpClient`; no `fetch` in components.
- [x] No backend business rule duplicated; no invented validation contract.
- [x] Loading (restore), error (invalid credentials, network, server), and unauthorized states implemented.
- [x] Expired session handled with a single redirect and a clear notice.
- [x] Authenticated visitors redirected away from `/login`; `returnTo` validated.
- [x] Access token in memory; refresh token in `sessionStorage`; nothing sensitive in `localStorage`.
- [x] Single-flight refresh; no refresh retry; no refresh for auth endpoints.
- [x] No secrets, tokens, or PII in code, fixtures, or logs; test fixtures use obviously fake values.
- [x] RTL and LTR both render; labels, errors, and alerts use accessible roles.
- [x] Documentation, standards, changelog, and project context updated.
- [x] Reported results match what was executed; unverified items are labeled.
- [ ] Independent review — **not performed**.
- [ ] Live-API verification — **blocked** (backend cannot start: JWT secret < 32 chars).
- [ ] Playwright E2E — **not installed / not executed**.
- [ ] Automated accessibility scan — **not performed**.
- [ ] Screenshots / visual regression — **not produced**.
- [ ] CSP for the inline bootstrap — **not configured**.
- [ ] Bundle split below the 500 kB advisory — **not done**.
- [ ] Cross-tab refresh lock (`BroadcastChannel`) — **not implemented**.

---

## G. Final verdict

**READY WITH WARNINGS** — as an authentication milestone against source-verified contracts.

The implementation is complete for the requested scope and fails closed on every ambiguous path it can control. Warnings: no independent review, no live-API verification (backend cannot start), no E2E, no accessibility scan, no screenshots, residual `sessionStorage` XSS exposure, a 646.91 kB main chunk, and missing CSP. The login screen must not be described as verified against a real backend until the API starts and the flow is re-tested.
