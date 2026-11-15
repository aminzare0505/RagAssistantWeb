# Frontend Security Standards — RAG Assistant

> **Status:** Mandatory standards for the React application. The foundation exists but contains no auth, token storage, or network code yet.
> **Backend baseline:** own JWT implementation in `RagAssistantApi` at commit `afd92ec` (source-inspected 2026-11-15). The backend does not compile at that commit, so no security behavior is runtime-verified.
> **Last updated:** 2026-11-15
>
> Related: [Architecture](./frontend-architecture.md) · [Coding standards](./frontend-coding-standards.md) · [API integration](./frontend-api-integration.md) · [Workflow](./frontend-workflow.md)

---

## 1. Priority

Security is a requirement on every change, not a final checklist.

- Preserve the backend's security guarantees; never weaken them to make a UI feature work.
- The browser is an untrusted environment. Anything shipped to it is public.
- The backend is the only authorization authority.
- When a security requirement is unclear, stop and ask. Do not invent an auth scheme.

---

## 2. Verified Authentication Architecture

These facts are read from backend source. Do not assume anything beyond them.

| Fact | Evidence |
|---|---|
| Authentication is **JWT Bearer**, issued by this project | `Amin.AspNetCore.Authentication/Authentication/JwtTokenService.cs` |
| Signing: HMAC-SHA256 with a configured secret ≥ 32 characters | `JwtTokenService`, `ValidateJwtOptions` |
| Access token lifetime: **15 minutes** | `JwtTokenOptions` default + `appsettings.json` |
| Refresh token lifetime: **7 days** | `JwtTokenOptions` default + `appsettings.json` |
| Access token validation includes issuer, audience, lifetime, signature, **zero clock skew** | `ServiceCollectionExtensions` |
| Every authenticated request validates a **security stamp** against the database | `SecurityStampValidator` in `OnTokenValidated` |
| Refresh tokens are opaque 64-byte random values, stored server-side only as SHA-256 hashes | `JwtTokenService`, `RefreshTokenHasher`, `SqlRefreshTokenStore` |
| Refresh rotation is **family-based**; presenting a revoked token revokes the entire family | `SqlRefreshTokenStore.RotateAsync` |
| `logout-all` and password change rotate the security stamp and revoke refresh tokens, invalidating existing access tokens | `PasswordChangeService`, `AuthenticationService` |
| Authorization is claim/permission based (`permission` claims) and role based | `PermissionAuthorizationHandler`, `PermissionConstants` |
| **Keycloak/OIDC is not configured.** `KeycloakClaimsTransformer` is not registered; `AuthenticationOptions` (Authority/ClientId) is not bound | `Program.cs`, auth library |
| **No CORS policy** is configured | `Program.cs` |
| **No rate limiting** on login/refresh | `AuthController`, `Program.cs` |

### 2.1 What this means for the frontend

- Integrate with `POST /api/auth/*` exactly as documented in [API integration](./frontend-api-integration.md). Do not invent endpoints.
- Do **not** implement Keycloak, OIDC discovery, or an Authorization Code + PKCE flow against this backend. It is not an OIDC client. Adding one would require a backend architecture change and explicit approval.
- Do not add a login form that talks to any external identity provider.
- The frontend cannot read a `/me` endpoint because none exists. Identity for display comes from the token payload (see §4.4), and authorization still comes from the backend's responses.

### 2.2 Conditional: if the backend later adopts OIDC

Only if the backend is explicitly changed to an OIDC provider (Keycloak or similar), and the change is approved:

- Use **Authorization Code flow with PKCE** (S256). Never implicit flow, never resource-owner password grant.
- Use the system browser/redirect-based flow, not embedded credentials.
- Validate `state` and `nonce`.
- Keep tokens out of URLs after the callback.
- Prefer httpOnly, Secure, SameSite cookies set by the backend over tokens in JS-readable storage.
- Do not implement this preemptively in the frontend.

---

## 3. Authentication Flows (Frontend Responsibilities)

### 3.1 Login

1. Submit `{ username, password }` to `POST /api/auth/login`.
2. Success: HTTP 200 with `ApiResponse<JwtTokenResult>` where `isSuccess` is `true`.
3. Store the access token **in memory**; store the refresh token per §4.
4. Clear any previous session state and query cache before applying the new session.
5. Invalid credentials: the backend returns **HTTP 204 with no body** (verified in `AuthController.Login`). Show a generic message such as "نام کاربری یا رمز عبور نادرست است." Never indicate whether the username exists.
6. Do not log the request body, password, or tokens.

### 3.2 Session restore (page reload)

Because the access token lives only in memory, a reload requires a refresh:

1. Read the refresh token from `sessionStorage`.
2. If absent → unauthenticated.
3. If present → one `POST /api/auth/refresh` request (single-flight, see §5).
4. Success → replace both tokens, then render the app.
5. Failure → clear session and redirect to login.
6. Render a loading shell while resolving; do not briefly render protected pages.

### 3.3 Authenticated requests

- Send `Authorization: Bearer <accessToken>`.
- Do not send tokens in query strings, fragments, or custom cookies.
- On `401` from a protected endpoint: run the single refresh flow once, then retry the original request **once**. If refresh fails, clear the session and redirect.
- On `403`: show a permission-denied state. Do not attempt to "elevate" or retry.
- Never retry a `401` in a loop.

### 3.4 Logout

- Call `POST /api/auth/logout` with the refresh token. Clear local session state regardless of the response.
- Clear all TanStack Query caches (`queryClient.clear()`).
- Do not rely on logout to invalidate the current access token; it remains valid until expiry. Use `logout-all` when the user requires immediate global invalidation.

### 3.5 Logout all sessions

- Call the authenticated `POST /api/auth/logout-all`.
- Then clear local state and redirect to login.
- Explain in the UI that all devices will be signed out.

### 3.6 Change password

The backend rotates the security stamp and revokes refresh tokens on success. Therefore:

1. On success, clear the session immediately and redirect to `/login` with a success message.
2. Do not keep the user in the app with a token that is now invalid.
3. Never display or log the current or new password.
4. Do not implement password-strength rules that contradict the backend; the backend currently validates only the current password. A client-side strength hint is acceptable as UX, but the backend remains authoritative.

---

## 4. Token Handling

### 4.1 Storage matrix

| Token | Storage | Rule |
|---|---|---|
| Access token (15 min) | **In memory only** (module-level holder + React context) | Never `localStorage`, never `sessionStorage`, never a cookie set by JS |
| Refresh token (7 days) | `sessionStorage`, **interim** | Per-tab, cleared when the tab closes; see residual risk below |
| Any token | URL | Prohibited |
| Any token | Logs, analytics, error reports | Prohibited |

### 4.2 Why not `localStorage`

`localStorage` persists across tabs and browser restarts and is readable by any script that achieves XSS. A stolen refresh token permits 7 days of session takeover. `sessionStorage` reduces the window but is not XSS-proof.

### 4.3 Recommended backend change (not implemented)

The secure long-term design is for the backend to set the refresh token in an **httpOnly, Secure, SameSite=Strict** cookie scoped to the auth endpoints, with the access token kept in memory. This requires backend changes and is out of scope here. Do not simulate it with JS cookies.

### 4.4 Identity and permission display

- There is no `/me` endpoint. The only identity source is the access-token payload.
- Decoding the JWT for display is allowed **only** with these constraints:
  - Do not verify the signature in the browser (it proves nothing).
  - Treat decoded values as untrusted display data.
  - Never use decoded permissions to decide whether an operation is allowed; the backend decides. Permissions may hide a menu item, but the request must still handle `403`.
  - Claims verified in issuer code: `UserId`, `preferred_username`, `useremail`, `security_stamp`, `permission` (repeated), and a role claim built from `ClaimTypes.Role`.
  - **Unverified:** the exact serialized name of the role claim. Outbound JWT claim mapping may emit `role` rather than the long `ClaimTypes.Role` URI. Do not build critical UI on the role claim until a real token has been inspected.
- If decoding fails, degrade to "unknown user" and rely on backend responses.

### 4.5 Token lifecycle events

Clear all session state (memory tokens, refresh token, query cache, user summary) on:

- Explicit logout.
- Refresh failure of any kind.
- Password change success.
- `logout-all` success.
- A `401` that survives one refresh attempt.
- Application-level session invalidation from the backend (`401` due to security stamp rotation).

---

## 5. Refresh Concurrency — Critical Backend Constraint

The backend uses rotating refresh tokens with **family reuse detection**. Presenting a refresh token that has already been rotated causes the **entire token family to be revoked**. Consequences:

1. **Exactly one refresh request may be in flight per tab.** Implement a single-flight promise (mutex): all concurrent callers await the same refresh promise.
2. **Never retry a refresh request automatically.** If the request's outcome is ambiguous (timeout, connection reset), the server may already have rotated the token. Retrying the old token would revoke the family. Clear the session and require login.
3. **Do not refresh proactively in multiple places.** Centralize refresh in the HTTP client's 401 handler.
4. **Do not call refresh concurrently with login or logout.**
5. **Do not store the refresh token in two places within the same tab.** One source of truth.
6. **Multi-tab caveat:** `sessionStorage` is per-tab, but duplicating a tab duplicates its storage. A duplicated tab can race the original. Until refresh tokens move to httpOnly cookies, accept this residual risk and consider a `BroadcastChannel` refresh lock as a follow-up.

This section overrides convenience. A "clever" parallel refresh implementation will cause users to be logged out unexpectedly.

---

## 6. Authorization

- Every protected operation is authorized by the backend. UI gating is cosmetic.
- Handle `401` (not authenticated), `403` (authenticated but not permitted), and `404` (not found or intentionally concealed) distinctly and safely.
- Do not infer ownership from an ID. If the URL contains a conversation or document ID, the backend must validate access; the frontend must render a safe not-found/denied state.
- Do not cache one user's data and reuse it after a different user signs in.
- Do not expose administrative navigation to unauthenticated users; still expect `403` if they navigate directly.
- Never bypass a guard by directly rendering a route component in a test-only path that ships.

---

## 7. XSS Prevention

### 7.1 Markdown rendering

- Use React Markdown **without** `rehype-raw`. Raw HTML from the model or user is not rendered.
- Do not add `rehype-raw`, `dangerouslySetInnerHTML`, or an HTML sanitizer to compensate for dev convenience.
- React Markdown's default URL transform blocks dangerous protocols (`javascript:`, `data:` text, etc.). Do not replace it with a permissive transform.
- Custom renderers must render text as text, never as HTML.
- Links:
  - External links: validate protocol is `https:` or `http:`; use `rel="noopener noreferrer"`; optionally `target="_blank"`.
  - Never allow `javascript:` or `data:` links.
  - Show the destination on hover where feasible.
- Images in markdown:
  - Remote images leak the user's IP and referrer to third parties. Prefer rendering a link or a placeholder instead of auto-loading remote images.
  - If images are allowed, restrict to `https:` and use `referrerPolicy="no-referrer"`.
- Code highlighting (`rehype-highlight`) operates on code text and produces safe elements. Do not pass model output through any HTML pipeline.

### 7.2 DOM and HTML

- No `innerHTML`, `outerHTML`, or `insertAdjacentHTML` with untrusted values.
- No `eval`, `new Function`, or dynamic script injection.
- Do not render server error bodies as HTML. Development-mode ASP.NET Core exception pages are HTML; treat any non-JSON response as an opaque failure.
- Use React text interpolation for all backend-provided strings.

### 7.3 Content Security Policy

The hosting layer must send a strict CSP. Recommended production baseline:

```text
default-src 'self';
script-src 'self';
style-src 'self' 'unsafe-inline';
img-src 'self' data: blob:;
font-src 'self';
connect-src 'self';
frame-ancestors 'none';
base-uri 'none';
form-action 'self';
object-src 'none';
```

Notes:

- `style-src 'unsafe-inline'` may be required by component libraries that set inline styles. Keep `script-src` strict; script inline injection is the main risk.
- Self-host the Persian font. Do not add fonts, scripts, or styles from third-party CDNs.
- Development needs a relaxed policy for Vite HMR (websocket and inline preamble). The development policy must not be copied to production.
- Prefer HTTP headers over `<meta>` CSP.
- Add `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin` (or stricter), and `Permissions-Policy` denying unused capabilities.

---

## 8. Secure API Communication

- Use HTTPS everywhere outside localhost.
- Base URL comes from validated environment configuration. No hardcoded production origins.
- Same-origin in production (reverse proxy). Do not add `mode: 'no-cors'`; it produces opaque responses and no security.
- Do not set `credentials: 'include'` unless the backend actually uses cookies. With Bearer tokens, the default `same-origin` policy is correct.
- Do not trust the `statusCode` property inside the response envelope. The backend currently hardcodes some values (for example, failure responses may report 400 even when 401 was requested). Use HTTP status plus `isSuccess` and the documented behavior.
- Reject malformed responses: if the body is not the expected JSON envelope, raise a contract error rather than coercing it.
- Do not follow redirects to other origins for API calls.
- Do not disable TLS verification.

### 8.1 CORS

The backend has no CORS policy. Development must use the Vite proxy. Production must be same-origin via reverse proxy. If CORS is later added, it must be an explicit backend task with a minimal allowlist; the frontend must not work around CORS.

---

## 9. CSRF

- With `Authorization: Bearer` headers and no cookies, classic CSRF does not apply.
- Do not introduce cookies for auth from the frontend.
- If the backend later moves refresh tokens to cookies, it must add CSRF protection (SameSite plus a CSRF token or Origin validation). Reassess this section at that time.

---

## 10. File Upload Security

The backend currently exposes **no upload endpoint**. When one exists:

- Accept only the file types the backend supports. Current ingestion supports **PDF** (`PdfPig`) only.
- Client-side type/size checks are UX, not security. The backend must validate content, size, and type.
- Do not read file contents in the browser beyond what is needed for preview (no preview is planned).
- Never render uploaded HTML, SVG, or scripts.
- Display filenames as text. Do not build local URLs from user-controlled names.
- Send uploads over HTTPS with the Authorization header; use `FormData` and do not set `Content-Type` manually.
- Do not store files in `localStorage`, `IndexedDB`, or the Cache API.
- Do not claim malware scanning; that is a backend responsibility.
- Handle partial failure and allow retry without duplicating documents where the API supports idempotency.

---

## 11. Sensitive Data Handling

- Conversation and document content may be confidential. Do not send it to analytics, error reporting, or third-party services.
- Do not persist message content or retrieved sources in browser storage.
- Do not put PII, tokens, or document text in URLs, titles, or `document.referrer`.
- Clipboard actions are user-initiated. Copy buttons should copy only the intended message, not internal metadata.
- Avoid caching sensitive API responses in a service worker. No service worker is planned.
- Show only the fields the API returns. Do not fabricate citations, scores, or page numbers.
- Redact sensitive values from client logs. In production, client logging should be minimal and structured; no request/response bodies.

---

## 12. Environment Variables and Secrets

- Only `VITE_*` variables are available to client code, and all are public. Never place secrets there.
- Commit `.env.example` with placeholders. Never commit `.env`, `.env.local`, or credential files.
- E2E credentials come from an untracked local file or CI secrets.
- Do not embed API keys, connection strings, signing keys, or test passwords in source, fixtures, screenshots, or documentation.
- If a secret is found in the workspace, report its location and recommend rotation; do not copy it into new files.
- If the backend returns a secret-like value (it should not), do not log or persist it.

---

## 13. Error Messages and Logging

- Show generic, actionable Persian messages. Include a request identifier only if the backend provides one (it currently does not).
- Never render stack traces, SQL text, file paths, internal hostnames, or raw exception messages.
- Do not log tokens, authorization headers, passwords, request bodies, or response bodies containing content.
- Distinguish network failure, authentication failure, authorization failure, validation failure, contract mismatch, and server failure in the error model; map each to safe UI copy.
- Avoid revealing whether an account exists during login or password reset (no reset endpoint exists).
- Client-side error reporting, if added later, requires a separate security review and data-minimization design.

---

## 14. Dependencies and Supply Chain

- Keep `package-lock.json` committed; use `npm ci` in CI.
- Run `npm audit` (or an equivalent) before releases; triage findings, do not silently ignore criticals.
- Prefer well-maintained packages; avoid adding a dependency for trivial functionality.
- Review install scripts of new dependencies; npm may execute them.
- Do not install packages from untrusted registries or URLs.
- shadcn components are vendored source; review generated components like any other code.
- Keep the Node version aligned with the project's documented baseline.

---

## 15. Security Review Checklist

Run this checklist on every frontend change:

- [ ] No secrets, tokens, or credentials in code, tests, fixtures, or logs.
- [ ] Access token remains in memory; refresh token storage unchanged and justified.
- [ ] Refresh is single-flight; no automatic retry of refresh.
- [ ] Logout clears tokens and query caches; password change clears the session.
- [ ] New routes are guarded and still tolerate `401`/`403` from the backend.
- [ ] No `dangerouslySetInnerHTML`, `innerHTML`, or raw HTML rendering.
- [ ] Markdown pipeline unchanged (no `rehype-raw`).
- [ ] External links use safe protocols and `noopener noreferrer`.
- [ ] API base URL comes from validated env; no hardcoded origins.
- [ ] Non-JSON/HTML error bodies are not rendered.
- [ ] Uploads validate type/size in UI and rely on the backend for enforcement.
- [ ] No new third-party CDN, font, script, or analytics request.
- [ ] No sensitive data in URLs, `localStorage`, analytics, or error reports.
- [ ] New dependencies justified and audited.
- [ ] CSP compatibility considered (no inline scripts).

Report findings by severity and state exactly which checks were performed by inspection versus execution. Never claim the application is "fully secure".
