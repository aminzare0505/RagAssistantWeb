# Frontend Development Workflow — RAG Assistant

> **Status:** Mandatory process for work in `RagAssistantWebApp`.
> **Last updated:** 2026-11-15
>
> Related: [Architecture](./frontend-architecture.md) · [Coding standards](./frontend-coding-standards.md) · [Security](./frontend-security-standards.md) · [Testing](./frontend-testing-standards.md) · [API integration](./frontend-api-integration.md) · [Project context](../../PROJECT_CONTEXT.md)

---

## 1. Purpose

This workflow keeps frontend work correct, reviewable, and honest about what was actually verified. It preserves the backend project's rules while adding frontend-specific gates.

The application foundation now exists at `frontend/rag-assistant-ui/`; product features do not. Any feature work requires its own approval and a verified backend contract. See §12 for what the completed bootstrap did and did not include.

---

## 2. First Step: Classify the Task

Before reading code or writing anything, decide:

| Classification | Signals | Action |
|---|---|---|
| **Frontend-only** | UI, state, routing, styling, client tests | Work in this repository only |
| **Frontend + contract** | Needs a new/changed API shape | Stop; define the required contract; create a backend task; do not invent routes |
| **Backend** | Controllers, services, database, auth, RAG | Work in `RagAssistantApi` under its `AGENTS.md`; do not mix frontend changes |
| **Cross-cutting** | Shared decision (auth flow, contract versioning) | Split into two tasks with explicit interfaces and deploy order |
| **Documentation-only** | Docs, ADRs, standards | Update docs; no source changes |

Rules:

- Never modify backend source from a frontend task.
- Never modify frontend source from a backend task unless the task explicitly spans both and both repos are in scope.
- If a task is ambiguous, ask one concise question rather than guessing.

---

## 3. Required Reading

Before implementing, read in this order:

1. `AGENTS.md` (this repository) — task routing and preserved backend rules.
2. `PROJECT_CONTEXT.md` — verified facts, blockers, open questions.
3. The relevant standard:
   - Any UI change: `frontend-ui-ux-guidelines.md`.
   - Any logic/API change: `frontend-coding-standards.md` + `frontend-api-integration.md`.
   - Any auth/upload/data change: `frontend-security-standards.md`.
   - Any behavior change: `frontend-testing-standards.md`.
4. The actual source you will touch. Documentation is a map, not a substitute for reading code.
5. For backend contracts: the corresponding backend file in `RagAssistantApi`, not just this repository's summary.

If the docs and the source disagree, the source wins. Update the docs in the same change.

---

## 4. Before Implementation

1. **Confirm the feature is not blocked.** Check the readiness matrix in the architecture doc. If the backend endpoint does not exist or the backend does not build, the feature is blocked.
2. **Verify the contract.** Open the backend controller/DTO. Do not rely on an endpoint name remembered from a summary.
3. **Inspect the existing frontend patterns.** Reuse the feature structure, query keys, error handling, and test helpers.
4. **Identify the impact surface:**
   - Routes and guards.
   - Query cache keys and invalidation.
   - Auth/session behavior.
   - Shared components.
   - Accessibility and RTL.
   - Environment variables.
   - Tests and fixtures.
5. **Plan the smallest coherent change.** No unrelated refactors, formatting sweeps, or dependency upgrades.
6. **Write down what will be verified and how.** If it cannot be verified, say so before starting.

---

## 5. Implementation Workflow

1. Create or update the feature module in its own folder.
2. Add wire types in `src/api/types` only if the contract is verified.
3. Add the API module (paths, request mapping) before the hook.
4. Add query/mutation hooks with key factories and cancellation.
5. Build the UI from `components/ui` primitives; keep business logic out of components.
6. Implement loading, empty, error, and permission states.
7. Handle RTL, keyboard, and screen-reader behavior.
8. Add tests at the appropriate level (see testing standards).
9. Update the relevant documentation and the changelog.
10. Run the quality gates.

Rules:

- Keep API calls outside components.
- Keep components small and composable.
- Do not duplicate backend validation as the source of truth.
- Do not add a library when the platform or an existing dependency suffices.
- Do not change a shared component's behavior for one screen; add a variant or compose.
- Do not leave TODOs that imply completed work.

---

## 6. Build and Test Gates

Run before reporting completion, from `frontend/rag-assistant-ui/`:

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

When a critical journey is affected and a runnable backend exists:

```bash
npm run e2e
```

Rules:

- If a command cannot run, explain why and report it as not executed.
- Do not skip a failing test to make the suite green.
- Do not disable lint rules to pass the gate.
- Do not claim a build succeeded without executing it.
- Record the exact commands and results in the task report.
- The backend currently does not compile at `afd92ec`; until it does, real API and E2E verification is impossible. State this rather than mocking the backend and calling it verified.

Database, Qdrant, Ollama, and model verification are backend concerns and are **never** performed from this repository.

---

## 7. Code Review

A review is required after implementation, before declaring the task complete.

Reviewer inputs:

- Task requirements.
- Changed files.
- Implementation summary.
- Commands executed and their results.

Checklist:

- [ ] Scope matches the request; no unrelated edits.
- [ ] Feature boundaries respected (no cross-feature internal imports).
- [ ] No `any`, unsafe casts, or suppressed type errors.
- [ ] API access only through the API layer; no `fetch` in components.
- [ ] No duplicated backend business rules.
- [ ] Query keys and invalidation are correct and minimal.
- [ ] Loading, empty, error, and permission states implemented.
- [ ] RTL and accessibility verified.
- [ ] Tests cover behavior and failure paths.
- [ ] No secrets, tokens, or PII in code, logs, fixtures, or screenshots.
- [ ] Documentation and changelog updated.
- [ ] Reported results match what was actually executed.

If an independent reviewer agent is unavailable, say so explicitly; do not claim an independent review happened.

Save review reports under `Docs/Ai/reviews/` using the backend's report structure:

- A. Overall assessment
- B. Security findings (severity, location, evidence, fix)
- C. Performance findings
- D. Impact analysis / regression risk
- E. Test results
- F. Pre-release checklist
- G. Final verdict: READY / READY WITH WARNINGS / NOT READY

---

## 8. Security Review

Every change gets a security pass using the checklist in [security standards §15](./frontend-security-standards.md). Minimum questions:

- Does this change touch tokens, session lifecycle, or refresh concurrency?
- Does it introduce a new data sink (storage, analytics, clipboard, URL, external request)?
- Does it render untrusted or model-generated content?
- Does it add a dependency or a third-party origin?
- Does it weaken a backend control or assume client-side enforcement?
- Does it expose errors, identifiers, or content in logs?

Report findings by severity. Never claim a complete security audit. Never claim "no vulnerabilities" — state which classes of issues were checked.

---

## 9. Documentation Updates

Update documentation in the same change when behavior or decisions change:

| Change | Update |
|---|---|
| Contracts, endpoints, DTOs | `Docs/Ai/frontend-api-integration.md` |
| Folder structure, state, routing decisions | `Docs/Ai/frontend-architecture.md` |
| New conventions or prohibitions | `Docs/Ai/frontend-coding-standards.md` |
| Auth, storage, CSP, upload rules | `Docs/Ai/frontend-security-standards.md` |
| Test tooling or required scenarios | `Docs/Ai/frontend-testing-standards.md` |
| Visual patterns, states, copy | `Docs/Ai/frontend-ui-ux-guidelines.md` |
| Process changes | `Docs/Ai/frontend-workflow.md` |
| Verified project facts, blockers, open questions | `PROJECT_CONTEXT.md` |
| Every completed task | `Docs/Ai/CHANGELOG_AI.md` |

Rules:

- Do not overwrite unrelated sections.
- Distinguish verified facts from assumptions.
- Do not claim the app exists or works.
- If a backend document is stale (for example, a missing config section that now exists), record the discrepancy here and in `PROJECT_CONTEXT.md`. Do not edit the backend repository from a frontend task.

---

## 10. Changelog Requirements

Every completed task appends an entry to `Docs/Ai/CHANGELOG_AI.md`:

```markdown
## YYYY-MM-DD — <short task title>

**Scope:** <frontend-only | docs-only | frontend + contract>
**Changed files:**
- path — what changed

**Summary:** <1–3 sentences>

**Build:** `<command>` — <result / not executed + reason>
**Tests:** `<command>` — <passed/failed/skipped or not executed + reason>
**E2E:** <result or "not executed: backend does not compile">
**Known issues / follow-ups:** <list or "none">
```

Rules:

- Newest entry first or last, consistently.
- Never write "tests pass" without a command and result.
- Link follow-ups to their blockers.
- Do not include secrets, tokens, or real user data.

---

## 11. Honest Reporting

The final task report must include:

- Changed files.
- What was implemented and what was deliberately not.
- Commands executed and actual results.
- Tests written vs executed vs passed.
- Anything blocked and why.
- Contract questions raised.
- Residual risks.
- Recommended next step.

Prohibited:

- "Done" when part of the task is blocked.
- Test results that were not observed.
- Screenshots or claims of UI verification that did not happen.
- Hiding a broken build.
- Describing a mock-only path as integration-verified.

---

## 12. Bootstrap Record (Creating the React App)

The bootstrap was explicitly approved and completed on 2026-11-15. It was a foundation-only task.

Completed:

1. Moved the app into `frontend/rag-assistant-ui/` (the requested location); documentation stays at the repository root.
2. Initialized with Vite 8 + React 19 + TypeScript 5.9 in strict mode.
3. Installed only the approved dependencies; feature-only libraries were deferred.
4. Wrote the lockfile and verified the peer graph with `npm ls vite vitest` (single `vite@8.3.8`). Note: the repository is not initialized as a git repository, so nothing was committed.
5. Added ESLint 9 (type-aware flat config), Prettier 3, Vitest 5, RTL 16, and jest-dom.
6. Added `.env.example`, `.gitignore`, and the Vite `/api` proxy.
7. Added a minimal shell, error boundary, Query provider, router, home page, and four honest placeholder routes. No product feature was created.
8. Ran `typecheck`, `lint`, `test` (3 tests), and `build`; results are recorded in `Docs/Ai/CHANGELOG_AI.md`.
9. Updated `PROJECT_CONTEXT.md`, the architecture document, and the changelog.

Deliberately not done:

- Playwright and `npm run e2e` (no runnable backend, no integration path).
- A theme provider/toggle (tokens and a `.dark` block exist, but no switch).
- A backend health check (no usable endpoint; the home page states the API is unavailable instead).
- Any `src/api/` transport, auth, storage, or session code.

Product modules must not be scaffolded before the backend contracts they need are verified.

---

## 13. Blocked-Work Protocol

If a required backend contract is missing or broken:

1. Document the blocker in `PROJECT_CONTEXT.md` and the task report.
2. Specify the exact contract needed (method, path, request, response, errors, authorization).
3. Do not create speculative client code that calls it.
4. Do not substitute fabricated data in a production path.
5. Continue only with work that is genuinely independent (for example, design-system primitives, auth shell) and clearly mark it as non-functional.

A blocked task is a valid outcome. A fabricated integration is not.
