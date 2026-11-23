# Review — Documents Interface Preview

> **Date:** 2026-11-17
> **Scope:** Implementation of Task 5 — documents list, search/filter/sort/pagination, upload with validation, status display, details route, delete confirmation, states, responsiveness, tests, and documentation in `frontend/rag-assistant-ui/`.
> **Reviewer:** Implementing agent (self-review). **No independent reviewer agent was available; an independent review did not occur.**
> **Inputs reviewed:** every file in the 2026-11-17 documents changelog entry, the executed gate outputs, the source-inspected backend state (no documents controller; `doc.Document` has no status column; API cannot start), and the browser evidence under `Docs/Ai/reviews/assets/2026-11-17-documents/`.

---

## A. Overall assessment

The change replaces the Documents placeholder with a complete **UI preview** and nothing more. No backend file was modified, no endpoint, DTO, query parameter, or status code was invented, and the feature performs **no HTTP request** and **no file read**. Records come from `src/features/documents/mock/`, a module-scoped in-memory store, and a visible bilingual preview banner plus upload, details, and status-source notices state that clearly.

Task requirements, point by point:

1. List with search, status and type filters, sorting, and pagination — implemented, with state owned by the URL.
2. Upload through picker, drag-and-drop, and keyboard, with multiple files, name/size/type validation, an indeterminate progress phase, and per-file removal and error text.
3. Display of name, type, size, upload date, status, and progress **only when a value exists**.
4. All six statuses are renderable with icon + text; the preview data covers all six.
5. View details, delete with confirmation, and a retry control that is disabled with an explanation because no endpoint exists.
6. `/documents/:documentId` details view with metadata and processing information, including an explicit "progress not reported" note.
7. Empty, filtered-empty, loading, error, and success states; loading and error are DEV-only by design.
8. Responsive at 1440/768/360, light/dark, `fa` RTL and `en` LTR, verified in a real browser.

Typecheck, lint, **142 tests in 17 files**, and the production build pass. Not verified: independent review, live API behavior, E2E, automated accessibility scanning, screen-reader behavior, and non-Chromium browsers.

---

## B. Security findings

Classes checked: upload input handling, file-content access, object URLs, filename rendering, storage, XSS sinks, network calls, dependency additions, error leakage, and mock-data isolation.

| # | Severity | Location | Evidence | Assessment / fix |
|---|---|---|---|---|
| B-1 | Informational | `src/features/documents/lib/validation.ts:7,32` | Checks extension (`file.name`, case-insensitive), rejects a non-empty MIME that is not `application/pdf`, rejects zero bytes, enforces a 10 MB preview ceiling, and rejects duplicates by normalized name + size; returns a discriminated result | Correct layering. No `FileReader`, `arrayBuffer`, or content inspection exists anywhere in the feature. Copy states the server is authoritative, so the client rule is never presented as security. |
| B-2 | Informational | `src/features/documents/components/document-upload.tsx:43-70` | Hidden `<input type="file" accept="application/pdf,.pdf" multiple>` plus a `<button type="button">` dropzone; input value reset after change | No path, filename, or file content is rendered as markup. The accept list is a convenience filter, not a trust boundary. |
| B-3 | Informational | `src/features/documents/components/document-row.tsx:29`, `document-details.tsx:64,84,102` | Filenames render as text with `dir="ltr"` and middle truncation; ids as monospace text | No `dangerouslySetInnerHTML`, no `href` built from a filename, no `URL.createObjectURL`. A hostile filename such as `<img onerror>` renders as characters. |
| B-4 | Informational | Whole feature | Grep for `fetch`, `axios`, and `XMLHttpRequest` returns nothing under `src/features/documents/`; `mock/` imports no API module | No request, no token usage, no upload. Nothing leaves the browser. Verified by grep, not assumed. |
| B-5 | Informational | `src/features/documents/hooks/use-document-upload.ts:32-40` | `useEffect` cleanup iterates the timer `Map` and cancels every pending preview upload, then clears it; removal cancels the individual timer | No leaked timers after unmount or row removal. Cancellation is the same pattern used by the chat preview. |
| B-6 | Informational | Storage | Only theme and language are read/written by the app; documents never touch `localStorage`, `sessionStorage`, `IndexedDB`, or the Cache API | No sensitive data persisted. A new document exists only in module memory for the tab lifetime. |
| B-7 | Low (product honesty) | `src/features/documents/mock/document-preview-store.ts:5-11`, page and details notices | The store header, the page banner, the upload note, the details note, and the status-source note all state that this is preview data; every mock file instructs deletion when a contract exists | The residual risk is a future contributor treating the store as the integration point or removing the notices. Architecture (AD-16), API integration §9.2, and coding standards all forbid that. |
| B-8 | Informational | `frontend/rag-assistant-ui/package.json` | **No dependency was added** for this task | No supply-chain surface change. `Progress`, `Badge`, and `Select` are local primitives. |
| B-9 | Informational | `src/features/documents/components/preview-state-control.tsx:20` | `if (!import.meta.env.DEV) return null;` | The control cannot render in a production build. Verified in `dist`: `documents-CD5nvaH0.js` has no control markup and no `aria-pressed`. |

No vulnerable pattern was found in the reviewed classes. This is **not** a full security audit. CSP remains unconfigured at the hosting layer (unchanged).

---

## C. Performance findings

1. **Bundle split works.** The documents route is lazy: `documents-CD5nvaH0.js` is 30.24 kB (8.93 kB gzip) and loads only on `/documents*`. The main chunk grew to 616.45 kB (192.91 kB gzip) from 606.40 kB; the only new main-chunk content is the documents i18n block in both catalogs (roughly 220 added catalog lines), so the increase is consistent with that rather than with feature code. The Vite >500 kB advisory is unchanged in nature and remains a recorded follow-up.
2. **Pure derivation with memoization.** Filtering, sorting, and pagination run in `useMemo` keyed on the stable store snapshot, query object, and language. `getDocuments()` returns a stable reference between changes, which `useSyncExternalStore` requires; otherwise every render would re-sort.
3. **Collator caching.** `sortDocuments` uses a cached `Intl.Collator` per language (`lib/query.ts:167`), so name sorting does not construct a collator per comparison.
4. **Formatter caching.** `lib/format.ts` caches `Intl.DateTimeFormat`/`NumberFormat` per locale, matching the chat feature's approach.
5. **No per-row work in render.** Rows receive formatted values as props; the list renders six rows per page by default.
6. **Timers only while uploading.** One 300 ms timer per accepted file, cancelled on completion, removal, or unmount. No interval, no polling, no background work.
7. **DEV control cost is zero in production.** The component returns `null` before rendering; the branch is dropped by the bundler. The `previewState` field and its render branches remain in the chunk (dead but unreachable) — a minor size cost, reported honestly rather than claimed as fully eliminated.

Playwright/E2E is absent, so there is no measured interaction budget. No performance defect requires action in this change.

---

## D. Impact analysis / regression risk

- All application changes are inside `frontend/rag-assistant-ui/`. The backend repository was not modified; its working tree was already dirty and remains so.
- **`/documents` changed from a placeholder to the preview page.** The route path, guard, lazy loading, and title are unchanged. `/documents/:documentId` was added as a lazy sibling before the `*` route, so unknown document ids render an in-shell not-found rather than a redirect.
- `src/app/navigation.ts` needed no change: `findNavigationItem` prefix-matches `/documents/...`, so details pages keep the "Documents" title and the active nav item. The consequence is that a details page does not show the filename in the browser title; recorded as a limitation.
- New shared primitives (`Progress`, `Badge`, `Select`) are additive. No existing primitive was modified, and none of them is a fork of an existing component.
- New global CSS is additive: a `progress-sweep` keyframe and `.progress-indeterminate` under `@layer utilities`. No token or existing rule was redefined. The keyframe ignores `prefers-reduced-motion`; motion is a 1.4 s horizontal sweep inside the bar only. Acceptable, flagged for the accessibility pass.
- The i18n catalogs gained a `documents` block in both languages, including three functions for word order. The Persian catalog defines `Messages`, so a missing English key fails the build.
- The router test that previously asserted "documents is not implemented" was inverted; the placeholder assertion moved to data sources. No other test changed behavior.
- Existing 68 tests continue to pass; the suite grew to 142.
- Residual risk: a future contributor may wire the mock store to an endpoint. The architecture, coding, API, UI/UX, security, and workflow documents all state the mock layer must be deleted, not extended.

---

## E. Test results

Commands were run from `frontend/rag-assistant-ui/` using portable Node 24.22.3 / npm 11.19.1.

| Command | Result |
|---|---|
| `npm run typecheck` (`tsc -b`) | Passed — no errors |
| `npm run lint` (`eslint .`) | Passed — no findings |
| `npm run test` (`vitest run`) | Passed — **142/142 in 17 files** (68 pre-existing + 74 new) |
| `npm run build` (`tsc -b && vite build`) | Passed — CSS 44.96 kB (8.69 kB gzip); main JS 616.45 kB (192.91 kB gzip); documents chunk 30.24 kB (8.93 kB gzip); chat chunk 312.31 kB (97.87 kB gzip); one chunk-size advisory |

New coverage (74 tests):

- `lib/validation.test.ts` — 9: accepted PDF, uppercase extension, wrong extension, mismatched MIME, empty MIME accepted, zero bytes, oversize, duplicates in the queue and against the list.
- `lib/query.test.ts` — 22: search normalization, status/type/combined filters, six sorts (`it.each`), stable order, immutability, pagination totals/slicing/clamping, fallback size, parse defaults, invalid values, serialize omits defaults.
- `lib/format.test.ts` — 10: byte units, Persian digits, zero, invalid ISO, middle truncation preserving the extension, short-name no-op.
- `components/document-upload.test.tsx` — 10: hints, single/multi picker, `.txt` rejection inside `role="alert"`, oversize, duplicates, uploading → done with real timers, add-to-store, cancel on remove, `fireEvent.drop`, keyboard-activatable button.
- `documents-page.test.tsx` — 15: banner/rows, status text, `dir="ltr"` and icon+text badges, search → URL + list, filters, sort, pagination → URL, URL restore, filtered-empty, empty, DEV loading/error, delete cancel/confirm, disabled retry, English-copy regression.
- `routes/document-details-page.test.tsx` — 7: metadata, progress absent + note, determinate bar when injected, delete → navigate, back, unknown id, disabled retry.
- `app/router.test.tsx` — 1 new: documents route shows search and drop controls and no "not implemented" copy.

Three initial failures were fixed rather than suppressed: a row assertion used a document that is not on page 1 under the default sort; a rejection assertion matched a shared string in two places; a pagination fixture used a page size the helper deliberately clamps. See the changelog for details.

Browser evidence (headless Chrome over CDP, mocked session restore):

| Run | Result |
|---|---|
| 1440×900 `fa` light | RTL, 6 rows, 6 badges with icons, 12 action buttons, no surface overflow, long filename `dir="ltr"` and middle-truncated, no stale copy |
| 1440×900 `en` light | LTR, English `h1`/statuses, no Persian documents copy |
| 768×900 `fa`/`en` light | Stacked layout, no overflow |
| 360×740 `fa`/`en` light | Card rows, action targets 44 px, no overflow |
| 1440/360 `fa`/`en` dark | `.dark` applied, tokens correct, no stale copy |
| Details 1440 `fa`/`en` | Six metadata fields, LTR filename heading, no progress bar, progress note visible, retry disabled with a localized reason, back link |

Interaction results (`verification-results.json`): drop → progressbar with `aria-valuenow` **null** and no percentage text → done → added with a live announcement; `.txt` drop → alert with the localized type error and no progressbar; search → `?q=security` and survives reload; status filter → 4 indexed rows; sort by size → `?sort=size-desc` with the long file first; pagination → `?sort=size-desc&page=2`, five rows, `صفحهٔ ۲ از ۲`; delete cancel keeps the row, confirm removes it; DEV loading shows the status label without the list, DEV error shows the error state, recovery restores the list; `/documents/does-not-exist` shows the in-shell not-found with navigation and a back link; details delete returns to `/documents` with the count dropping 11 → 10.

Screenshots: `Docs/Ai/reviews/assets/2026-11-17-documents/` (12 PNGs plus `verification-results.json`).

Not executed:

- `npm run e2e` — Playwright is not installed and the API cannot start.
- Live API verification — no documents endpoint exists.
- Automated axe/contrast scan and real screen-reader/device testing.
- Non-Chromium browsers.

---

## F. Pre-release checklist

- [x] Scope matches the request; no backend change, no invented contract.
- [x] Preview banner and per-area honesty notices present in both languages.
- [x] No `any`, unsafe casts, or suppressed type errors; no lint suppressions.
- [x] No `fetch`, HTTP client, or upload call in the feature.
- [x] No file content read, no object URL, no HTML/SVG rendering of file data.
- [x] Validation covers type, empty, size, and duplicates; server authority stated in copy.
- [x] No fabricated percentage; indeterminate progress only.
- [x] Retry disabled with an accessible explanation; no fake success.
- [x] Empty, filtered-empty, loading, error, and success states exist.
- [x] RTL/LTR, themes, and 360/768/1440 layouts verified in a browser.
- [x] Keyboard: dropzone is a button, selects and search are native/labeled, dialogs are Radix.
- [x] Tests added for behavior and failure paths, including an English-copy regression.
- [x] Documentation and changelog updated in the same change.
- [x] No secrets, tokens, PII, or real document content in code, fixtures, tests, or screenshots.
- [ ] Independent review — **not performed; no reviewer agent available.**
- [ ] Live backend verification — **blocked** (no documents contract; API cannot start).
- [ ] Automated accessibility scan / real assistive-technology pass — **not performed.**
- [ ] E2E — **not available.**
- [ ] Screen-reader pass for the live-region upload announcements — **not performed.**

---

## G. Final verdict

**READY WITH WARNINGS**

The documents feature is a complete, responsive, bilingual UI preview that satisfies the task without faking backend behavior. It is ready to show and iterate on, with these warnings:

1. It is **not working document management**. All records are in-memory mock data; nothing is uploaded, processed, indexed, or deleted on a server. The notices must stay until a verified contract replaces the mock layer.
2. Status values and the six-state model are UI guesses; the backend has no status, progress, or failure data.
3. Progress is never displayed because no record reports a measurement; the details view says so explicitly.
4. Retry is disabled; loading and error states are unreachable outside development.
5. The 10 MB ceiling and PDF-only rule are preview decisions, not verified server limits.
6. Delete initiated from the details route has no live-region announcement on the list it returns to.
7. No independent review, live API test, E2E, automated accessibility scan, screen-reader pass, or non-Chromium verification was performed.
8. The main bundle still triggers Vite's >500 kB advisory.
