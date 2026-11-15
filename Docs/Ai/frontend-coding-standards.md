# Frontend Coding Standards — RAG Assistant

> **Status:** Standards for the React application foundation at `frontend/rag-assistant-ui/`. Product features are not implemented.
> **Applies to:** all code under `frontend/rag-assistant-ui/src/` and (later) `frontend/rag-assistant-ui/e2e/`.
> **Last updated:** 2026-11-15
>
> Related: [Architecture](./frontend-architecture.md) · [Security](./frontend-security-standards.md) · [Testing](./frontend-testing-standards.md) · [UI/UX](./frontend-ui-ux-guidelines.md) · [API integration](./frontend-api-integration.md)

---

## 1. Non-Negotiable Rules

1. TypeScript **strict mode** is mandatory.
2. `any` is prohibited unless justified in a comment and approved in review.
3. Components do not call `fetch` or the HTTP client directly; use the API layer through feature hooks.
4. No backend business rules are duplicated in the client.
5. No secrets, tokens, or credentials in source, tests, fixtures, or logs.
6. No direct database, Qdrant, Ollama, or model access.
7. Every async operation surfaces loading, success, and failure states.
8. Every network request is cancellable.
9. No `dangerouslySetInnerHTML` for user or model content.
10. Build, type-check, lint, and tests must pass before a task is reported complete — and results must be reported honestly.

---

## 2. TypeScript

### 2.1 Required compiler options

```jsonc
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "verbatimModuleSyntax": true,
    "isolatedModules": true,
    "moduleResolution": "bundler",
    "jsx": "react-jsx"
  }
}
```

`exactOptionalPropertyTypes` is recommended but may be deferred if it causes excessive friction with third-party types; if deferred, record the reason in this document.

### 2.2 Type rules

- Prefer `unknown` over `any`; narrow with type guards or Zod at system boundaries.
- Never use non-null assertions (`!`) on API data. Treat wire data as untrusted until validated.
- Use `satisfies` for configuration objects that must also keep literal inference.
- Use discriminated unions for UI state:

```ts
type ChatRequestState =
  | { status: 'idle' }
  | { status: 'sending'; abort: () => void }
  | { status: 'streaming'; abort: () => void }
  | { status: 'error'; message: string }
  | { status: 'done' };
```

- Avoid `enum` for wire values. The backend serializes `MessageEnum` as a **number**. Mirror it as a typed literal union and map at the boundary:

```ts
export const MESSAGE_TYPE = {
  unknown: 0,
  user: 1,
  system: 2,
  assistant: 3,
  manager: 4,
} as const;

export type MessageType = (typeof MESSAGE_TYPE)[keyof typeof MESSAGE_TYPE];
```

- Prefer `type` for unions and function shapes; `interface` for extensible object contracts (component props is the main case).
- All exported functions have explicit return types where inference is not obvious.
- Dates from the API are `string` (ISO 8601). Convert once at the display boundary; do not store `Date` objects in the query cache.
- Nullability from the backend is preserved: `string | null`, not `string` with a default that hides missing data.
- Do not cast through `as unknown as T`. If a cast is unavoidable, isolate it in one audited adapter and explain why.

### 2.3 Generics and utilities

- Do not write generic abstractions until there are at least two real call sites.
- Utility types (`Partial`, `Pick`, `Omit`) are fine at the boundary; do not use them to hide an unclear model.
- No declaration merging, ambient `any` modules, or `@ts-ignore`. Use `@ts-expect-error` only with a reason and a linked issue; it will fail once the error disappears.

---

## 3. Naming Conventions

| Element | Convention | Example |
|---|---|---|
| Component file | kebab-case | `chat-message.tsx` |
| Component export | PascalCase, **named** | `export function ChatMessage(...)` |
| Hook file | kebab-case with `use-` | `use-auto-scroll.ts` |
| Hook export | `use` + camelCase | `useAutoScroll` |
| Context/provider | PascalCase + `Provider` | `AuthProvider` |
| Zod schema | camelCase + `Schema` | `loginSchema` |
| Inferred type | PascalCase | `type LoginInput = z.infer<typeof loginSchema>` |
| Query key factory | camelCase + `Keys` | `chatKeys` |
| Query/mutation hook | `use` + resource + `Query`/`Mutation` | `useConversationQuery`, `useDeleteDocumentMutation` |
| API module | resource + `.queries.ts` / `.mutations.ts` / `.keys.ts` | `documents.keys.ts` |
| Wire type | PascalCase, mirrors backend DTO | `JwtTokenResult`, `ApiResponse<T>` |
| Constant | `SCREAMING_SNAKE_CASE` | `MAX_UPLOAD_BYTES` |
| Test file | same name + `.test.ts[x]` | `chat-message.test.tsx` |
| E2E spec | feature + `.spec.ts` | `chat.spec.ts` |
| Boolean | `is`/`has`/`can`/`should` prefix | `isStreaming`, `hasMore` |
| Event handler prop | `on` + event | `onSend`, `onRetry` |
| Handler implementation | `handle` + event | `handleSend` |

- No abbreviations except widely understood ones (`id`, `url`, `api`, `ui`).
- No numeric suffixes (`Button2`).
- Persian text belongs in the message catalog, not in identifiers.

---

## 4. React Components

### 4.1 Shape

- Function declarations, not arrow-function-with-display-name patterns.
- Named exports only. Default exports are allowed solely where React requires them (`lazy` can use the `.then` adapter instead, so default exports remain unnecessary).
- One primary component per file. Co-locate only tiny private subcomponents that are meaningless outside the file.
- Explicit props interface named `<Component>Props`.
- Destructure props in the parameter list.
- Do not use `React.FC` or `React.FunctionComponent`; they hide generics and imply implicit children.
- Type `children` explicitly as `React.ReactNode`; do not add it unless the component actually composes.
- Do not spread unknown props onto DOM elements (`{...rest}` into `div`) unless the component is a deliberate HTML primitive.

```tsx
interface MessageBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}

export function MessageBubble({ role, content, isStreaming = false }: MessageBubbleProps) {
  // ...
}
```

### 4.2 Props

- Required props are required. Avoid optional props with a default that makes "not provided" ambiguous.
- Prefer a small number of meaningful props over a `variant` + many booleans.
- Callbacks are single-purpose: `onRetry(messageId)` rather than `onAction(type, payload)`.
- Do not pass whole query/mutation objects into presentational components; pass the data and the callback it needs.
- Do not pass setters down; pass semantic handlers.
- Children-based composition is preferred when a component is a layout or container.

### 4.3 Size and complexity

- A component that mixes data fetching, form state, and presentation must be split.
- More than ~200 lines or more than ~3 levels of conditional rendering is a review flag.
- No nested component definitions inside a component body (remount bugs).
- Keep render functions pure. No side effects in render. No fetching in render.
- Use early returns for loading/error/empty states.

### 4.4 State

- Local state first. Lift only when a second component truly needs it.
- Derive what can be derived; do not store redundant state.
- Initialize expensive state lazily.
- Do not mirror props into state. That is a synchronization bug waiting to happen.
- Use `useId` for accessible label/description wiring.

### 4.5 Effects

- Effects are for synchronization with external systems, not for chaining state updates.
- Every effect has a correct dependency array and a cleanup function where needed.
- Do not use effects to compute derived values.
- Never ignore an exhaustive-deps warning without a specific comment explaining the invariant.

---

## 5. Custom Hooks

- Name starts with `use`; the file is `use-*.ts`.
- One responsibility per hook.
- Return a stable, documented shape. Prefer a named object over a 5-tuple.
- Hooks do not render UI.
- A hook that calls the API returns TanStack Query results, not raw promises, unless it is a one-shot action.
- Hooks must be usable in tests without a router unless routing is their purpose.
- Do not create a hook that only wraps a single `useState`.
- Hooks must not silently swallow errors.

```ts
export function useConversation(conversationId: string) {
  return useQuery(conversationQueryOptions(conversationId));
}
```

---

## 6. Separation of Concerns

| Layer | Owns | Must not own |
|---|---|---|
| Route/page | composition, page state, guards | transport details, endpoint strings |
| Feature hook | query/mutation orchestration, cache updates | rendering |
| Feature API module | endpoint paths, request/response mapping | JSX, toasts |
| `src/api/http-client` | headers, base URL, cancellation, envelope parsing, error normalization | feature-specific logic |
| `src/api/types` | wire DTOs | UI view models |
| Component | rendering and local interaction | `fetch`, business rules |
| `src/i18n` | user-visible strings | logic |

Additional rules:

- UI formatting (numbers, dates, file sizes) lives in `src/lib/format.ts` with tests.
- Authorization decisions are never made in the client. Permission checks only decide whether to render a hint.
- Do not reimplement backend validation as the source of truth. Client-side Zod schemas improve UX; the backend response remains authoritative.
- Error translation (status/envelope → Persian message) lives in one place.

---

## 7. Reusable Components and Abstraction Policy

Create a shared abstraction only when:

1. There are at least **three** real usages, or the abstraction represents a product concept that must stay consistent (for example, an `EmptyState` used by every list).
2. The API surface is clear without options for hypothetical future cases.
3. It has tests.

Do not:

- Create a wrapper that only forwards props.
- Build a generic `DataTable` before the second table exists.
- Add configuration flags for features nobody requested.
- Abstract over one backend quirk that affects one screen.

Prefer duplication of three similar lines over a premature helper. Move code to `components/common` only after the third use.

---

## 8. Forms

- React Hook Form for all non-trivial forms; local state is acceptable for single-field filters.
- Zod schema is the single source of validation and inferred types.
- Use `zodResolver` from `@hookform/resolvers`.
- Validate on submit by default; validate on blur where user feedback benefits.
- Show field errors next to fields and a form-level error for server failures.
- Disable submit while pending; keep the user's input on failure.
- Never log form values; never put passwords into query strings, URLs, or error reports.
- Password fields must not be prefilled from storage.
- File inputs are not controlled; handle them with a dedicated upload component.

---

## 9. Async, Cancellation, and Concurrency

- Every request accepts an `AbortSignal` and passes it to `fetch`.
- React Query supplies `signal` in `queryFn`; use it.
- User-initiated long operations (chat send, upload) create an `AbortController` and abort on unmount or on explicit cancel.
- One refresh-token request at a time. See the security doc; concurrent refresh attempts can revoke the token family.
- No floating promises. Await, return, or explicitly `void` with a comment.
- No `setTimeout`-based waiting for state. Use events, promises, or query states.
- No retry loops in components. Retry policy belongs to TanStack Query or the HTTP client.
- Do not use `Promise.all` for operations that must not partially succeed; use `Promise.allSettled` and handle each result when partial success is intended.

---

## 10. Styling

- Tailwind utilities plus theme tokens; no ad-hoc hex colors in components.
- Use the `cn()` helper (`clsx` + `tailwind-merge`) for conditional classes.
- Use logical properties: `ps-*`/`pe-*`/`ms-*`/`me-*`, `start-*`/`end-*`, `text-start`/`text-end`. Avoid `left`/`right` except for genuinely physical positioning.
- Inline `style` is allowed only for runtime-calculated values (for example, a progress width). Document unusual cases.
- Do not modify shadcn primitives to add feature-specific behavior; compose them in `components/common`.
- Dark mode uses the `.dark` class on the root element and CSS variables; no conditional color classes scattered through components where a token will do.
- Do not use arbitrary values (`w-[43.7%]`) when a scale value or layout primitive works.

---

## 11. Imports and Module Boundaries

- Use the `@/` alias for `src/`.
- Import types with `import type` (enforced by `verbatimModuleSyntax`).
- Import order: external packages, `@/api`, `@/lib`, `@/components`, feature-relative, styles. Enforce with ESLint.
- No circular dependencies.
- Feature internals are private. Only `features/<name>/index.ts` is importable from outside.
- Do not import from another feature's `api` folder directly; expose the needed query options from the feature index.
- No barrel files other than the feature public surface and `components/ui/index.ts` (if used). Deep barrel chains hurt tree-shaking and test startup.

---

## 12. Accessibility and Semantics

- Prefer semantic HTML over `div` + ARIA.
- Every interactive element is keyboard reachable and has a visible focus state.
- Icon-only buttons require an accessible name (`aria-label`) and a tooltip.
- Form inputs are associated with labels; error text is linked with `aria-describedby`.
- Streaming assistant output uses `aria-live="polite"` (not `assertive`).
- Do not remove outlines without providing an equivalent indicator.
- Color alone never conveys status; pair it with text or an icon.
- See [UI/UX guidelines](./frontend-ui-ux-guidelines.md) for the full checklist.

---

## 13. Comments and Documentation

- Default to no comments. Well-named code explains itself.
- Write a comment only for a non-obvious **why**: a backend quirk, a security constraint, a workaround with a reference.
- Never write comments that restate the code, narrate a task, or reference a ticket without context.
- Public hooks and non-obvious utilities may have a one-line JSDoc describing behavior and constraints, not implementation.
- Keep comments in English; user-facing text is Persian and lives in the message catalog.
- Do not leave commented-out code. Delete it; version control remembers.

---

## 14. Prohibited Patterns

| Pattern | Why |
|---|---|
| `any`, implicit `any` | Defeats the type system |
| `as` casts on API data | Hides contract drift |
| `dangerouslySetInnerHTML` with model/user content | XSS |
| Tokens in `localStorage` or URLs | XSS/history leakage |
| Fetching in components | Untestable, duplicated caching |
| Duplicated backend validation as authority | Divergent rules |
| `useEffect` chains for derived state | Extra renders and bugs |
| Global store for a single screen | Unnecessary complexity |
| Giant page components | Untestable, merge conflicts |
| `console.log` in committed code | Noise and data leakage |
| Hardcoded API base URLs | Environment coupling |
| Hardcoded Persian strings inside deep components | Inconsistent copy, no catalog |
| `index` as React key for dynamic lists | Incorrect reconciliation |
| Suppressing ESLint/TS rules without justification | Hidden defects |
| `window.location.href` for internal navigation | Full reload, loses state |
| Reading `document.cookie` or `localStorage` for auth | Unsupported token model |

---

## 15. Quality Gates

Every change must pass:

```bash
npm run typecheck   # tsc --noEmit (or tsc -b)
npm run lint        # ESLint, zero warnings in changed files
npm run test        # Vitest (relevant suites at minimum)
npm run build       # production build
```

Rules:

- Zero TypeScript errors. Warnings are not acceptable in new code.
- No disabled lint rules in new code without a comment and reviewer approval.
- Formatting is automated; do not debate it in review.
- A change that cannot be built or tested must state so explicitly in the final report.
- Do not report "tests pass" if they were not run.
- Add comment for every method or validation 
