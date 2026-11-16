# AGENTS.md — RagAssistantWebApp

This repository contains the **React + TypeScript frontend** for the RAG Assistant. The application foundation, the responsive layout/design system, and authentication exist at `frontend/rag-assistant-ui/`. The chat interface exists as a **UI preview backed by isolated mock data**: it makes no network requests and must not be described as a working chat feature. Documents, data sources, and settings remain unimplemented.

The backend is a separate ASP.NET Core project at `../RagAssistantApi`. Its rules remain authoritative for all backend work and must not be weakened.

---

## 1. Read Before Any Task

1. `PROJECT_CONTEXT.md` — verified facts, current status, blockers, open questions.
2. `Docs/Ai/frontend-architecture.md` — system boundaries, stack, structure, state, routing.
3. The standards relevant to the task:
   - `Docs/Ai/frontend-coding-standards.md`
   - `Docs/Ai/frontend-security-standards.md`
   - `Docs/Ai/frontend-testing-standards.md`
   - `Docs/Ai/frontend-ui-ux-guidelines.md`
   - `Docs/Ai/frontend-api-integration.md`
   - `Docs/Ai/frontend-workflow.md`
4. The actual source files you will change — documentation is a map, not a substitute.
5. For any API contract: the corresponding backend source in `../RagAssistantApi`. Do not rely on summaries.

If a document conflicts with source, the source wins; update the document in the same change.

---

## 2. Task Routing

Before implementing, classify the task:

| Task | Where |
|---|---|
| UI, routing, client state, styling, frontend tests | This repository |
| New or changed API contract | Split: define the contract here, implement it in the backend repository under its rules, then integrate |
| Backend controllers/services/database/auth/RAG | `../RagAssistantApi` only |
| Documentation/standards | `Docs/Ai/` and `PROJECT_CONTEXT.md` |

- Do not modify backend source from a frontend task.
- Do not modify frontend source from a backend task unless both are explicitly in scope.
- Do not change application source as part of a documentation-only task.

---

## 3. Backend Instructions Are Preserved

All backend rules remain in force for backend work. Before working in `../RagAssistantApi`, read and follow:

- `../RagAssistantApi/AGENTS.md`
- `../RagAssistantApi/Docs/Ai/PROJECT_CONTEXT.md`
- `../RagAssistantApi/Docs/rules/csharp-coding-standards.md`
- `../RagAssistantApi/Docs/rules/project-workflow.md`
- `../RagAssistantApi/Docs/rules/security-standards.md`
- `../RagAssistantApi/Docs/rules/sql-server-standards.md`
- `../RagAssistantApi/Docs/rules/testing-standards.md`
- `../RagAssistantApi/Docs/rules/post-implementation-review.md`

Backend obligations that the frontend work must never undermine:

- Build and relevant tests must actually run; results must be reported honestly.
- Never claim a change was applied or verified unless confirmed.
- All changed files must be identified.
- An independent Reviewer must be invoked after implementation, and the report saved under the backend's `Docs/Ai/reviews/`.
- The backend changelog and database changelog must be updated when those repositories change.
- Security, authorization, token validation, and database controls must never be weakened.
- Database changes require versioned SQL scripts and the backend's CRUD stored-procedure standards.

If a frontend task requires backend changes, stop and hand off with an explicit contract request. Do not silently expand scope across repositories.

---

## 4. Frontend Rules

- The frontend is an independent, separately deployable SPA.
- It talks only to documented backend HTTP APIs (and, only if added, a documented real-time channel).
- It never connects to SQL Server, Qdrant, Ollama, or model files.
- It never implements retrieval, embedding, chunking, prompting, or backend business rules.
- API calls live outside UI components.
- Server state lives in TanStack Query. Zustand only when genuinely needed.
- TypeScript strict mode. No `any` without documented, approved justification.
- Keep components small; prefer feature-based organization.
- Do not introduce libraries beyond the approved stack without a documented decision and approval.
- Do not invent endpoints, DTOs, query parameters, or status codes. If a contract is missing, the feature is blocked.
- Do not store sensitive data in browser storage unnecessarily. Access tokens belong in memory.
- Authorization is enforced by the backend; UI gating is not a security control.
- Persian-first, RTL-native UI; accessibility is an acceptance criterion.

Detailed rules live in `Docs/Ai/`.

---

## 5. Implementation Rules

- Keep changes focused; avoid unrelated edits, refactors, dependency upgrades, and formatting sweeps.
- Inspect existing patterns before adding new ones.
- Prefer the smallest coherent implementation.
- Do not add speculative abstractions, feature flags, or compatibility shims.
- Do not leave commented-out code or TODOs that imply completed work.
- Update tests for behavior changes; add regression tests for fixes.
- Update documentation and `Docs/Ai/CHANGELOG_AI.md` in the same change.

---

## 6. Build and Test Requirements

Run these from `frontend/rag-assistant-ui/` (the repository root has no `package.json`):

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

- Report the exact commands and actual results.
- Distinguish tests written, executed, and passed.
- State clearly when a command could not run and why.
- Never claim integration verification against a mock.
- The backend solution builds at `afd92ec` plus an uncommitted tree, but the API cannot start: `Authentication:Jwt:SecretKey` is shorter than 32 characters. Real API/E2E verification is blocked until that is configured by the backend owner. Do not pretend otherwise.
- Playwright is not installed yet and `npm run e2e` does not exist; add both only when a runnable integration path exists.

Backend builds/tests belong to the backend repository and follow its guidelines.

---

## 7. Post-Task Requirements

After implementing:

1. Identify every changed file.
2. Perform the code review and security review checklists in `Docs/Ai/frontend-workflow.md`.
3. Save a review report under `Docs/Ai/reviews/` when the task changes application code.
4. Update the relevant standards/architecture/API documents if behavior or decisions changed.
5. Update `PROJECT_CONTEXT.md` if verified facts or blockers changed.
6. Append an entry to `Docs/Ai/CHANGELOG_AI.md` with:
   - Date, task, scope.
   - Changed files.
   - Summary.
   - Build/test commands and results.
   - Known issues and follow-ups.
7. Report results honestly, including blockers and unverified areas.

If an independent reviewer is unavailable, say so. Do not claim an independent review occurred.

---

## 8. Current Status (2026-11-16)

- This repository: documentation plus the **frontend foundation, layout/design system, authentication, and a chat UI preview** at `frontend/rag-assistant-ui/` (Vite, React 19, strict TypeScript, Tailwind 4, router, providers, env validation, Vitest, Radix primitives, light/dark/system themes, bilingual `fa`/`en` shell, responsive sidebar/header, a static `/design-system` page, login page, session restore, logout, route guards, and a responsive chat interface with Markdown/code rendering, composer, conversation history, and expandable mock sources). Documents, data sources, and settings remain honest "not implemented" placeholders.
- The chat page is a **UI preview only**. All conversations, messages, and sources come from `src/features/chat/mock/`; there are no HTTP calls, no invented DTOs, and a visible preview banner states that replies are mock and are not saved. Mock replies are simulated locally with a timer. Do not connect this UI to an endpoint until the backend chat contract is verified.
- Verified in the chat task: `npm run typecheck`, `npm run lint`, `npm run test` (**68 tests, 11 files**), and `npm run build` all pass. Browser verification used headless Chrome over CDP at 1440/768/360 px in `fa`/`en` and light/dark, with screenshots under `Docs/Ai/reviews/assets/2026-11-16-chat/`. See `Docs/Ai/CHANGELOG_AI.md` and `Docs/Ai/reviews/2026-11-16-chat-ui.md`.
- Verified in the authentication task: the same four gates passed (48 tests, 9 files). Browser interaction checks used scripted DOM events with a mocked `fetch`; screenshots were unavailable then. See `Docs/Ai/reviews/2026-11-16-auth-ui-integration.md`.
- Backend: **builds successfully** (`dotnet build RagAssistant.Api.slnx` → 0 errors) but **cannot start**: `Authentication:Jwt:SecretKey` is shorter than 32 characters, so no contract is runtime-verified; all contracts remain source-verified only. The backend working tree is dirty and was not modified from this repository.
- Only the auth endpoints are verified by source; the frontend calls `login`, `refresh`, and `logout` only. There is **no registration endpoint**, so no register page exists. Real chat, conversation persistence, streaming, citations, documents, data sources, and settings are **blocked** and must not be faked.
- Known issue: feature placeholder pages still hardcode Persian copy, so English mode shows Persian feature text. Next work requires explicit approval and remains blocked where backend contracts are missing.

See `PROJECT_CONTEXT.md` for evidence and open questions.
