# Review — Development-Only Preview Admin Sign-In

> **Date:** 2026-11-17
> **Scope:** A development-only "sign in as preview admin" path so authenticated pages can be reviewed while the API cannot start; role claims added to the decoded identity and displayed in the account menu. Frontend only, in `frontend/rag-assistant-ui/`.
> **Reviewer:** Implementing agent (self-review). **No independent reviewer agent was available; an independent review did not occur.**
> **Inputs reviewed:** every file in the 2026-11-17 preview-sign-in changelog entry, the executed gate outputs, the `dist` greps, the production (`npm run preview`) and development browser runs, and the backend JWT claim construction in `../RagAssistantApi` (UserId, preferred_username, useremail, security_stamp, repeated role claims, permission claims).

---

## A. Overall assessment

The change answers a real blocker: every authenticated route was unreachable for review because the API cannot start (`Authentication:Jwt:SecretKey` is shorter than 32 characters) and there is no registration endpoint. It solves that without pretending to authenticate. The real login, refresh, and logout flow is unchanged; the preview path issues no token, performs no request, and stores only a marker that is read behind `import.meta.env.DEV`.

Request, point by point:

1. "Set a default user to login" — `/login` offers a development-only preview card with a single button; clicking it lands on the requested page (`returnTo` honoured) as `admin`.
2. "With admin permission" — the preview identity carries `roles: ['Admin']`, matching the role claim name the backend emits, and the account menu displays it.
3. "So I want to check pages" — all guarded routes are reachable in the dev server; session restore works after a remount within the tab.
4. "Then we can connect to backend services" — nothing here blocks or shapes the real integration; deleting `features/auth/preview/` and the login card restores the previous state exactly.

Typecheck, lint, **230 tests in 27 files**, and the production build pass. `dist` contains no marker key and no preview id. Not verified: independent review, live API behavior, and non-Chromium browsers.

---

## B. Security findings

Classes checked: production leakage, impersonation surface, token handling, storage, network calls, authorization assumptions, and copy honesty.

| # | Check | Result |
|---|---|---|
| B1 | Is any preview path reachable in a production build? | No. `readPreviewAdminSession`, `startPreviewAdminSession`, and `clearPreviewAdminSession` each return inert values or throw when `import.meta.env.DEV` is false, so the bundler drops them and their key literal. Verified by grep of `dist`: no `preview_admin_session`, no `preview-admin`. |
| B2 | Can a production user authenticate by writing the marker by hand? | No. The read is inside the DEV guard; the production check with a hand-written `preview_admin_session=1` left the app on `/login`. |
| B3 | Does the preview obtain a token, cookie, or credential? | No. `getAccessToken()` stays `null`, no refresh token is written, and `fetch` is not called (asserted in provider and login-page tests). |
| B4 | Can the preview leak into a real session? | No. `previewLogin` clears tokens and the query cache first, and `logout` plus the session-expiry handler clear the preview marker. The two sources are never both active. |
| B5 | Does the `Admin` role grant anything? | No. It is display-only: no guard, menu visibility rule, or request reads it. Authorization remains the backend's. |
| B6 | Is the surface labelled honestly? | Yes, in both languages: "Preview sign-in (development only)" with a note that permissions apply only to this browser. |
| B7 | Is anything persisted beyond the tab? | No. `sessionStorage` only; closing the tab ends the preview session, and logout removes the marker. |
| B8 | Does an unavailable `sessionStorage` break startup? | No. Every access is wrapped in `try`/`catch` and degrades to "no preview session". |
| B9 | Does the role decoder introduce an authorization path? | No. `decodeAccessToken` returns strings for display; `EMPTY_USER` never gains roles from unreadable input, and the de-duplicating reader ignores non-string claims. |

Residual risk: a developer could sign in as `admin` in a development build and mistake it for real authorization while reviewing. The UI notice, the documentation, and the absence of any privileged client behavior keep that risk informational; no server state is reachable without a token.

---

## C. Accessibility findings

- The preview button is a real `<button type="button">` with visible text and an `aria-hidden` icon, inside the login card's content order after the form, so it is reachable with Tab and not announced as a submit.
- The card uses a heading-weight paragraph and a muted description rather than a decorative block; the note on permissions is not truncated.
- `h-11 w-full` keeps the target at 44 px at 360 px.
- Roles in the account menu render inside `<span dir="ltr">` so `Admin` stays readable in RTL, and are omitted entirely when the array is empty, avoiding an empty "Role:" label.
- Not verified: screen-reader output for the added card, and automated axe scanning (not installed).

---

## D. Performance findings

- The preview module is three small functions plus a constant; it adds no dependency and no render work on the login page beyond one conditional card.
- Main bundle 602.50 kB (186.04 kB gzip), up 1.73 kB (0.57 kB gzip) from the previous 600.77 kB (185.47 kB gzip): the catalog copy for five keys and the role display. The conditional spread that removes `previewLogin` in production also lets the bundler drop the preview functions.
- `dist` retains the catalog strings only, consistent with the existing DEV-state labels.

---

## E. Correctness and code findings

| # | Finding | Status |
|---|---|---|
| E1 | `previewLogin` typed as `(() => void) | undefined` broke `exactOptionalPropertyTypes`. | Fixed with a conditional spread: `...(import.meta.env.DEV ? { previewLogin } : {})`. |
| E2 | Adding roles changed `decodeAccessToken`'s shape and broke three existing JWT tests silently. | Fixed: `EMPTY_USER` and expectations updated, `TEST_USER` extended, and a test added for short and long role claim names. |
| E3 | An insertion in `auth-provider.test.tsx` removed the existing "clears the local session on logout" test. | Restored verbatim; the suite count rose by exactly the new cases. |
| E4 | `clearPreviewAdminSession` was initially unguarded, so the marker literal shipped in `dist`. | Gated on `import.meta.env.DEV`; rebuilt and re-grepped until the key disappeared. This is the finding most likely to recur, and it is now documented as a rule in the coding standards. |
| E5 | Initial session state considered only a token. | Now `if (getAccessToken() || readPreviewAdminSession())`, and the initial user falls back to the preview identity. |
| E6 | Display of roles for real sessions was untested. | Covered by the provider test that decodes `role: ['Admin','Editor']` into `Admin,Editor`. |

---

## F. Test evidence

- `src/features/auth/preview/preview-admin-session.test.ts` (4): no session initially; start yields `admin` with `Admin`, marker `'1'`, and no access token; read-back after start; clear.
- `src/features/auth/auth-provider.test.tsx` (+3): role claims decoded; preview sign-in authenticates without calling `fetch`; marker restored after remount; logout clears the marker.
- `src/features/auth/routes/login-page.test.tsx` (+1): preview sign-in from `/login?returnTo=/settings` lands on `/settings`, `fetch` is not called, and no `refresh_token` is written.
- `src/auth/jwt.test.ts` (+2 with updated expectations): roles included in `EMPTY_USER`; short and long role claims read into `['Admin','Editor','Owner']`.

Gate output: `npm run typecheck` clean, `npm run lint` clean, `npm run test` **230 passed / 27 files**, `npm run build` succeeded. Production behaviour checked separately against `npm run preview`, not just the dev server, because Vitest always runs with `import.meta.env.DEV === true`.

---

## G. Limitations and follow-ups

- The preview is not authentication and must be deleted when a startable API exists. It is intentionally not behind a feature flag: the `import.meta.env.DEV` guard is the boundary.
- The multi-tab case is not covered: a preview session started in one tab does not appear in another until the app reloads there (each tab has its own `sessionStorage`). Not tested, not important for review use.
- The catalog copy still ships in production bundles (strings only, no code path).
- Not verified: independent review, E2E (Playwright absent, API cannot start), screen readers, non-Chromium browsers.
