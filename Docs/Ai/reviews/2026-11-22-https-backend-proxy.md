# Review — HTTPS Backend Development Proxy

> **Date:** 2026-11-22
> **Scope:** Route frontend development `/api` requests through Vite to the backend HTTPS profile at `https://localhost:7189`.
> **Reviewer:** Implementing agent (self-review). No independent reviewer was available; an independent review did not occur.

## A. Overall assessment

Vite's development proxy now targets the backend HTTPS origin. The Swagger path `/swagger/index.html` is documentation and is not used as an API base; the frontend keeps relative `/api/...` paths. Since the backend has no CORS policy, this same-origin proxy keeps browser requests on the Vite origin.

The proxy was exercised locally: Swagger UI and the OpenAPI document each returned HTTP 200, and GET `/api/auth/login` through Vite returned HTTP 405, matching the route's POST-only behavior and confirming proxy routing. No credentials were submitted, so successful login/token behavior remains unverified. Chat, documents, data sources, and settings remain preview-only.

## B. Security findings

| Severity | Finding | Evidence / action |
|---|---|---|
| Low | The local ASP.NET development certificate may not be trusted by Node's proxy client. | `secure: false` is set only under Vite's `server.proxy` for the localhost dev target. It is not part of the production bundle or deployment configuration. |
| None found in reviewed scope | No token, credential, API contract, or third-party origin was added. | The proxy only changes the local `/api` destination. Existing auth transport and token handling are unchanged. |

Security classes checked: origin selection, TLS validation scope, secrets/tokens, CORS behavior, request logging, and production configuration. This is not a complete security audit.

## C. Performance findings

No client bundle code or dependencies changed. The proxy adds no browser-side request hop; Vite forwards matching requests to localhost.

## D. Impact analysis / regression risk

- Local development now uses HTTPS port 7189 instead of HTTP port 5000.
- If the backend's HTTPS profile is not running, API calls still fail at the proxy.
- Production routing is unchanged and still requires a same-origin reverse proxy.
- Only existing authentication calls use the API. Other product areas remain mock previews pending backend contracts.

## E. Test results

- `npm run build` — passed (`tsc -b && vite build`); existing advisory remains for a JavaScript chunk larger than 500 kB.
- Swagger UI direct request — HTTP 200.
- OpenAPI JSON direct request — HTTP 200.
- GET `/api/auth/login` through Vite — HTTP 405 as expected for a POST-only route; confirms routing only.
- Login/token flow — not executed; no credentials were supplied.
- Automated tests — not run; this configuration change was validated by the production build and a live proxy request.

## F. Pre-release checklist

- [x] Scope limited to development proxy and relevant documentation.
- [x] No secrets, tokens, or credentials added.
- [x] Certificate validation relaxation is limited to Vite's local development proxy.
- [x] Production API routing remains same-origin.
- [x] Changelog and context updated with observed runtime state.
- [ ] Real login and token issuance verified.
- [ ] Independent review completed.

## G. Final verdict: READY WITH WARNINGS

Development proxy routing is verified. Real authentication and all mock-backed feature integrations remain unverified or blocked by missing contracts. An independent review did not occur.
