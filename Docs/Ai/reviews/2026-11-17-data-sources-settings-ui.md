# Review — Data Sources and Settings UI Preview

> **Date:** 2026-11-17
> **Scope:** Implementation of Task 6 — data-source list, add/edit/delete, connection forms, details, schema browser, all states; settings General/Appearance/AI/Embedding/Retrieval sections with navigation; shared hoists; tests, browser verification, and documentation in `frontend/rag-assistant-ui/`.
> **Reviewer:** Implementing agent (self-review). **No independent reviewer agent was available; an independent review did not occur.**
> **Inputs reviewed:** every file in the 2026-11-17 data-sources/settings changelog entry, the executed gate outputs, the source-inspected backend state (no data-source or settings controller; no source-type registry; RAG services commented out in DI; API cannot start), and the browser evidence under `Docs/Ai/reviews/assets/2026-11-17-data-sources-settings/`.

---

## A. Overall assessment

The change replaces the last two placeholders with complete **UI previews** and nothing more. No backend file was modified, no endpoint, DTO, source type, provider, or configuration option was invented, and neither feature performs an HTTP request. Records and schema trees come from isolated `mock/` modules; both mock stores carry delete-with-the-contract headers, and bilingual preview badges/notices state the status on every screen.

Task requirements, point by point:

1. Data-source listing with name, source type, connection status, and last sync — implemented; the status badge always pairs an icon with text, and last sync uses the shared locale-aware formatter or "never".
2. Add, Edit, and Delete UI — implemented with a shared RHF + Zod form, inline errors, a confirmation dialog, and navigation to details on save.
3. Connection configuration forms based on supported backend types — the backend exposes no type registry, so only SQL Server (the only database technology in the system) is offered and labelled as a preview example; no other type is presented.
4. Connection test — no endpoint exists, so the button is disabled with a visible `aria-describedby` reason. No simulated result.
5. Schema browser — implemented over clearly labelled example schema data, with `tree`/`treeitem`/`group` roles, `aria-expanded`, roving tabindex, Arrow/Home/End/Enter, columns with type and nullability, and an explicit empty state for the record without a schema.
6. Loading, empty, error, and confirmation states — skeletons, `EmptyState`, `ErrorState` with preview retry, deletion confirmation, and in-shell not-found for unknown ids. Loading/error are reachable through the shared DEV control only.
7. Settings sections — General (read-only), Appearance (real theme/language), AI model (drafts), Embedding (read-only server-managed), Retrieval (drafts, similarity threshold disabled), with section navigation reflected in the URL and an in-shell not-found for unknown sections.
8. Responsiveness, themes, and directions — verified in a real browser at 1440/768/360 px in `fa` RTL and `en` LTR, light and dark.
9. Security — no password, key, or connection string is stored, re-displayed, logged, or sent; after save only `hasCredential` exists. Model paths and endpoints are never rendered.

Typecheck, lint, **220 tests in 26 files**, and the production build pass. `npm run preview` plus headless Chrome confirmed the DEV control is absent from rendered production output. Not verified: independent review, live API behavior, E2E, automated accessibility scanning, screen-reader behavior, and non-Chromium browsers.

---

## B. Security findings

Classes checked: credential capture and retention, secret rendering, storage, network calls, direct database access, XSS sinks, DEV gating, error leakage, and mock-data isolation.

| # | Severity | Location | Evidence | Assessment / fix |
|---|---|---|---|---|
| B-1 | Informational | `src/features/data-sources/lib/validation.ts:68-79` | Password is required only on create, length-limited, and a pure builder maps values to `{ connection, hasCredential }`; the function comment says the password is dropped here | The stored record type has no credential field, so a leak would be a compile error, not a review miss. |
| B-2 | Informational | `src/features/data-sources/components/data-source-form.tsx:58,67,84` | Reset/default values set `password: ''`; create/update set `hasCredential` from a non-empty password or the existing source | The password field is unmounted with the form after save; the browser run confirmed no password input and no value in the DOM or storage afterwards. |
| B-3 | Informational | Details page connection card | Credential renders as «ثبت شده — هرگز نمایش داده نمی‌شود»; host renders with `dir="ltr"`; no connection string is assembled | No secret is rendered, no driver or database client exists in the dependency tree, and the browser never opens a database connection. |
| B-4 | Informational | `src/features/data-sources/mock/` | Deterministic records contain hosts/databases/usernames only; grep finds no password, key, connection string, `fetch`, `axios`, `localStorage`, or `sessionStorage` | Mock data cannot leak a credential and the feature cannot call anything. |
| B-5 | Informational | Settings Embedding/General/AI/Retrieval | Embedding rows show only server-managed labels; General shows the public API base and environment; AI/Retrieval drafts are non-secret and stay in memory | Model paths, tokenizer paths, endpoints, and keys are never exposed, matching the backend rule. |
| B-6 | Informational | `src/features/settings/mock/settings-draft-store.ts` | Session-only module store; Appearance alone persists through the existing `localStorage` providers | No new persistence surface; no settings value is written to storage. |
| B-7 | Informational | `src/components/shared/preview-state-control.tsx:31-33` | `if (!import.meta.env.DEV) return null;` | The control cannot render in production. Verified by rendering the production build in headless Chrome: zero `aria-pressed` buttons and no control label on `/data-sources` and `/settings/ai`. The i18n label strings still ship in the shared index chunk and the `previewState` branch remains in the feature chunks — reported honestly. |
| B-8 | Informational | `frontend/rag-assistant-ui/package.json` | **No dependency was added** | No supply-chain change. |
| B-9 | Low (product honesty) | Mock layers, page badges, form/details/section notices | The stores' headers, every page badge, the schema card, and the settings notices state preview status; mock files instruct deletion when contracts exist | Residual risk is a future contributor wiring the store to an endpoint or removing notices. AD-18/AD-19, API integration §10, and coding standards §5.3 forbid it. |

No vulnerable pattern was found in the reviewed classes. This is **not** a full security audit. CSP remains unconfigured at the hosting layer (unchanged).

---

## C. Accessibility findings

| # | Area | Evidence | Assessment |
|---|---|---|---|
| C-1 | Status is not color-only | `data-source-status-badge.tsx` renders a Lucide icon plus visible text; browser run counted one icon per status badge | Passes the icon+text rule. |
| C-2 | Schema tree | `schema-browser.tsx:204,230,245` — `role="tree"`, `aria-expanded`, `aria-selected`, `aria-level`, roving tabindex, key handling per item | Follows the WAI-ARIA tree pattern; tests exercise Arrow/Home/End/Enter and click. |
| C-3 | Forms | Labels via `useId`, `aria-invalid`, `aria-describedby` to inline errors, form-level `role="alert"` hint; password toggle follows the login `aria-pressed` pattern | Consistent with the auth form standard. |
| C-4 | Live announcements | Create/edit announces on the destination page (`role="status"`); settings save/reset renders in a `role="status"` paragraph | Verified in tests and the add-flow browser check (`announced: true`). |
| C-5 | Navigation | `NavLink` with `aria-current="page"`, labeled `<nav>`, horizontally scrollable tab strip at 360 px | `aria-current` asserted in tests and visible in the screenshots. |
| C-6 | Disabled controls explain themselves | Connection test has `aria-describedby`; similarity threshold has a note; provider select has a neighbouring explanation | A disabled control is never left unexplained. |
| C-7 | Touch targets | At 360 px the hamburger is 44×44 and data-source row actions are not below 44 px; at 768/1440 px icon action buttons are 36×36 | WCAG 2.2 target minimum (24×24) is met everywhere; the 44 px goal holds at 360 px. Recorded as a limitation for desktop. |
| C-8 | Not-found states | `/settings/nope` and `/data-sources/nope` render an in-shell `EmptyState` with a back action | No redirect, no shell loss. Note: `EmptyState` renders a paragraph title rather than a heading; consistent with existing usage. |

---

## D. Performance findings

1. **Bundle split works.** Data sources ship in a 30.09 kB (7.32 kB gzip) lazy chunk and settings in 12.51 kB (3.19 kB gzip); shared date formatting adds a 1.15 kB chunk. The main chunk was reduced from 616.45 kB to 600.77 kB because documents' inline preview control moved to a shared chunk.
2. **Store snapshots are stable.** Both preview stores return an unchanged array/object reference between mutations, which `useSyncExternalStore` requires; otherwise every render would resubscribe or recompute.
3. **No per-row heavy work.** Rows receive formatted strings; date formatting is cached per locale by `src/lib/format-date.ts`.
4. **No timers, polling, or network work.** Both features are synchronous over in-memory data.
5. **DEV control cost is zero in production.** The component returns `null`; verified by rendering the preview build. As with documents, the state field and render branches remain but cannot be reached.

No performance defect requires action in this change.

---

## E. Correctness and code findings

| # | Finding | Evidence | Assessment |
|---|---|---|---|
| E-1 | Password boundary is type-enforced | `DataSourceRecord` has `hasCredential` and no credential field; the builder drops the password | Stronger than a convention. |
| E-2 | Edit keeps credential | Blank password on edit preserves `hasCredential`; test and browser run both assert it | Correct and honest: the preview cannot verify the existing secret. |
| E-3 | Duplicate-name validation | Zod schema checks the live store excluding the edited id | Tests cover create and edit. |
| E-4 | Cross-field retrieval rule | `overlap < chunkSize` refine with the error attached to the overlap field | Test and browser run (overlap 300 vs chunk 300) reject it. |
| E-5 | Defaults trace to source | `settings-defaults.ts` cites `appsettings.json`, chunker, `RagService`, and `QdrantDataSource` next to the values | No invented defaults; similarity threshold is deliberately absent. |
| E-6 | 360 px overflow regression fixed | Settings nav grid item gained `min-w-0`; the browser rerun reports `overflowX: 0` on every page | The fix is in `settings-layout.tsx:25-28`. |
| E-7 | Test flakiness handled | `src/test/setup.ts` sets `asyncUtilTimeout: 3000`; destination assertions use `findBy*` after navigation | Full suite is stable at 220 tests. |
| E-8 | Dead code removed | `FeaturePlaceholder` deleted; `features` i18n block removed; router test updated | Grep shows no references remain. |
| E-9 | Shared hoists are genuine rule-of-three | Date formatting is now used by chat, documents, and data sources; the DEV control by documents and data sources | Documents' public API is unchanged. |

---

## F. Test evidence

`npm run test` → **26 files, 220 tests passed**, `Duration 11.39s`.

New coverage: 11 data-source validation, 6 store, 7 schema browser, 10 list, 10 form, 9 details, 8 settings schema, 5 settings store, 12 settings route, plus router edits. The English-copy regressions assert that Persian data-sources/settings UI strings do not appear in English mode.

Browser verification (`verification-report.json`, `errors: []`): 16 screenshots; structural checks pass on every run (`lang`/`dir`, `.dark`, `overflowX 0`, localized `h1`, preview notices, LTR hosts/ids, icon+text badges); interactions all pass: 6 empty-field errors, add → `/data-sources/src-preview-1` with announcement and no password in DOM/storage, edit keeps credential, delete cancel/confirm 5→5→4, disabled connection test with reason, schema tree 9→2 items and keyboard focus movement, DEV loading/error/recover, appearance persistence across reload, AI save/reset, retrieval defaults 300/50/5 plus overlap error, and both not-found states.

---

## G. Limitations and follow-ups

- Both features are previews: no HTTP, endpoint, DTO, registry, schema source, connection test, or settings persistence. The mock modules must be deleted, not extended, once verified contracts exist (§10.3 of the API document).
- Settings drafts reset on reload; the server configuration is unchanged and RAG services are not registered in DI.
- Only SQL Server is offered; statuses, last-sync values, and schema trees are preview data; the connection test stays disabled.
- Loading/error states are development-only; empty data-source schema exists only on the seeded `src-05` record.
- Desktop icon actions are 36×36 px; the 44 px goal is met at 360 px only.
- Native `<select>` popups are OS-styled; sub-pages keep the section document title.
- Unverified: live API, E2E, screen readers, non-Chromium browsers, and independent review.
