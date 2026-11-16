# Frontend UI/UX Guidelines — RAG Assistant

> **Status:** Design direction for the React application, with the shell, design system, authentication, and a **chat UI preview** implemented. The responsive layout, sidebar/header navigation, light/dark/system themes, `fa`/`en` direction switching, reusable primitives, and a static `/design-system` reference page exist. The chat page implements history, messages, Markdown/code, sources, and the composer against **isolated mock data**; no other product UI exists, and no chat content is real.
> **Audience:** frontend engineers, designers, and review agents.
> **Last updated:** 2026-11-16
>
> Related: [Architecture](./frontend-architecture.md) · [Coding standards](./frontend-coding-standards.md) · [Security](./frontend-security-standards.md) · [API integration](./frontend-api-integration.md)

---

## 1. Experience Principles

1. **Persian-first, RTL-native.** The product is designed in RTL, not mirrored afterward.
2. **Answers before decoration.** Content, citations, and status are the priority.
3. **Truthful states.** Never show a success state, progress percentage, citation, or source that the backend did not provide.
4. **Recoverable failures.** Every error has a next action (retry, edit, go back) and never destroys the user's input.
5. **Calm, dense, professional.** This is a work tool, not a marketing site.
6. **Accessible by default.** Keyboard, screen reader, focus, and contrast are acceptance criteria.
7. **No dark patterns.** No fake loading, no hidden destructive actions, no disabled state without explanation.

---

## 2. Design System

### 2.1 Foundations

- **Tailwind CSS 4** with CSS variables exposed as semantic tokens. The token source is `src/styles/index.css` (`@theme inline`).
- **shadcn/ui** primitives copied into `components/ui`. Compose; do not fork them for one screen.
- **Lucide React** icons at consistent sizes (`size-4` inline, `size-5` controls).
- `/design-system` is the living reference for every primitive in both themes and directions. Update it whenever a primitive changes.
- Spacing base unit: **4 px**. Use the Tailwind scale; avoid arbitrary values.
- Radii: `--radius` (default 0.5rem); cards and inputs use the same token.
- Shadows: subtle, one level for popovers and one for modals. No decorative glow.
- Motion: 150–200 ms, ease-out; respect `prefers-reduced-motion`. No animation library is installed; Radix `data-state` drives the small keyframes.

### 2.2 Semantic tokens (provisional)

The brand palette is not finalized. Use semantic tokens so the palette can change without touching components.

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222 20% 12%;
  --muted: 210 20% 96%;
  --muted-foreground: 215 14% 42%;
  --card: 0 0% 100%;
  --border: 214 20% 88%;
  --primary: 221 83% 53%;
  --primary-foreground: 0 0% 100%;
  --accent: 210 30% 94%;
  --accent-foreground: 222 20% 18%;
  --destructive: 0 72% 48%;
  --destructive-foreground: 0 0% 100%;
  --success: 152 60% 36%;
  --warning: 38 92% 45%;
  --info: 205 80% 45%;
  --ring: 221 83% 53%;
  --sidebar: 210 20% 98%;
  --sidebar-foreground: 222 20% 12%;
  --sidebar-accent: 210 30% 94%;
  --sidebar-accent-foreground: 222 20% 18%;
  --sidebar-border: 214 20% 88%;
  --radius: 0.5rem;
}

.dark {
  --background: 222 24% 9%;
  --foreground: 210 20% 94%;
  --muted: 222 18% 16%;
  --muted-foreground: 215 14% 68%;
  --card: 222 22% 12%;
  --border: 220 16% 24%;
  --primary: 217 90% 62%;
  --primary-foreground: 222 24% 9%;
  --accent: 222 18% 20%;
  --accent-foreground: 210 20% 94%;
  --destructive: 0 65% 58%;
  --destructive-foreground: 0 0% 100%;
  --success: 152 50% 46%;
  --warning: 38 85% 55%;
  --info: 205 75% 58%;
  --ring: 217 90% 62%;
  --sidebar: 222 26% 8%;
  --sidebar-foreground: 210 20% 94%;
  --sidebar-accent: 222 18% 16%;
  --sidebar-accent-foreground: 210 20% 94%;
  --sidebar-border: 220 16% 20%;
}
```

Rules:

- Components reference `bg-background`, `text-foreground`, `border-border`, `text-muted-foreground`, `bg-primary`, etc.
- No hex colors in feature components.
- Contrast must meet WCAG AA (4.5:1 for body text, 3:1 for large text and UI boundaries).
- Status colors always pair with text or an icon.

### 2.3 Typography

- Primary font: **Vazirmatn**, self-hosted (woff2), weights 400/500/600/700. No third-party font CDN. The font files are not bundled yet; the stack currently falls back to `Segoe UI`/`Tahoma` until they are added.
- Fallback stack: `Vazirmatn, "Segoe UI", Tahoma, system-ui, sans-serif`.
- Code font: `ui-monospace, "Cascadia Code", "Consolas", monospace`.
- Code highlighting uses dedicated semantic tokens (`--code-keyword`, `--code-string`, `--code-number`, `--code-function`, `--code-type`, `--code-variable`) defined for both themes; `.hljs-*` classes map to them in `src/styles/index.css`.
- Direction: body `dir="rtl"`; code and identifiers `dir="ltr"`.

Suggested scale:

| Token | Size / line height | Usage |
|---|---|---|
| `text-xs` | 12 / 18 | metadata, timestamps |
| `text-sm` | 14 / 22 | secondary UI, table cells |
| `text-base` | 16 / 26 | body, chat content |
| `text-lg` | 18 / 28 | section titles |
| `text-xl` | 20 / 30 | page titles |
| `text-2xl` | 24 / 34 | auth headings |

- Persian body text needs slightly more line height than Latin; prefer 1.6–1.7.
- Do not use `letter-spacing` on Persian text; it breaks joins.
- Never use `text-transform: uppercase` on Persian text.
- Limit body line length to ~70 characters (max-width on prose containers).

---

## 3. Light and Dark Themes

- Theme is selected by a `.dark` class on `<html>`, driven by a small `ThemeProvider`.
- Options: **system**, **light**, **dark**. Persist the preference in `localStorage` under a non-sensitive key (`theme`). Theme is not sensitive data.
- Respect `prefers-color-scheme` when set to system; listen for changes.
- Prevent flash of incorrect theme by applying the class before first paint (inline bootstrap in `index.html`).
- Both themes must be visually reviewed for: borders, disabled states, focus rings, code blocks, citations, and error banners.
- Do not invert images; use theme-specific assets if needed.
- Implemented entry point: the theme menu in the header (light/dark/system radio items). The design-system page is the review surface for both themes.

---

## 4. RTL and Persian Support

- `<html lang="fa" dir="rtl">` globally.
- Use Tailwind logical utilities: `ps-*`, `pe-*`, `ms-*`, `me-*`, `start-*`, `end-*`, `text-start`, `text-end`, `rounded-s-*`, `rounded-e-*`.
- Avoid `left`/`right`, `ml`/`mr`, `pl`/`pr` except for physical needs (for example, a decorative layer).
- Directional icons (send, back, chevron, indent) mirror in RTL. Non-directional icons (search, trash, copy) do not.
- Chat alignment is semantic, not physical: user messages align `end`, assistant messages align `start`.
- User and model content may contain Latin text and code. Apply `dir="auto"` to message content containers so bidi runs render correctly; force `dir="ltr"` on code blocks, inline code, URLs, and identifiers.
- Mixed bidi content must not break layout; test with Persian + English + code in one message.
- ### 4.1 Language switching (Persian/English)

The shell ships two locales and switches them at runtime:

- `LanguageProvider` sets `<html lang>` and `<html dir>` (`fa` → `rtl`, `en` → `ltr`) and serves the typed catalog through `useLanguage().t`.
- Radix primitives receive direction from `DirectionProvider`, so menus, dialogs, and sheets flip correctly.
- All layout uses logical utilities; no component positions itself with physical `left`/`right`.
- Directional icons (send, back, chevrons) mirror; non-directional icons do not.
- Language options in the menu are labeled in their own language and carry `lang`/`dir`.
- Persist the choice in `localStorage` (`language`); apply it before first paint.
- The Persian catalog is the source of the `Messages` type; the English catalog must implement every key.
- Shell copy is translated now. Product copy will be added to both catalogs when features exist; do not mix languages in one screen.

Numbers:
  - Use Latin digits for identifiers, ports, versions, token counts, page numbers, and code.
  - Use `Intl.NumberFormat('fa-IR')` for user-facing counts and dates where Persian digits are desired.
  - Be consistent within a component.
- Dates: format with `Intl.DateTimeFormat('fa-IR', …)`. Keep the raw ISO value available for tooltips or copy where useful.
- File names: render with `dir="ltr"` inside an RTL layout, truncate from the middle, and preserve the extension.
- Keyboard: do not assume physical key positions. Enter-to-send must not fire during IME composition (`compositionstart`/`compositionend`) used for Persian input.

---

## 5. Responsive Design

Breakpoints follow Tailwind defaults: `sm` 640, `md` 768, `lg` 1024, `xl` 1280.

Layout:

- **Desktop (≥ lg / 1024 px, implemented):** fixed 288 px (`w-72`) start-side sidebar with brand, navigation, and environment footer; sticky 64 px header with page title and theme/language menus; content column offset by `lg:ps-72` and capped at `max-w-6xl`.
- **Tablet (md, implemented):** sidebar is hidden; the header menu button opens the navigation in a start-side sheet with focus trap; content stays single-column.
- **Mobile (< md, implemented):** single column; navigation opens as a full-height start-side sheet (4/5 width, max 288 px); header buttons and sheet controls have 44×44 px touch targets; content uses `dvh`-safe full height.
- **Future (not implemented):** icon rail and a persistent right-side sources panel. The chat composer is already pinned, and sources expand inline per message.
- Chat uses `dvh`-based heights (`h-[calc(100dvh-…)]`) so mobile browser toolbars do not clip the composer.
- Respect safe-area insets (`env(safe-area-inset-bottom)`).
- Tables become stacked definition lists or horizontally scrollable containers; never cause page-level horizontal scroll.
- Touch targets ≥ 44×44 px on mobile, ≥ 24×24 px on desktop.
- No hover-only functionality.

---

## 6. Accessibility

Target: **WCAG 2.2 AA**.

Mandatory:

- Semantic landmarks: `header`, `nav`, `main`, `aside`, and one `h1` per page.
- Skip-to-content link as the first focusable element.
- Visible focus indicator using `--ring`, never removed.
- All interactive elements reachable by keyboard in a logical order.
- Icon-only buttons have `aria-label`; tooltips supplement but do not replace the label.
- Form fields: label association, `aria-invalid`, `aria-describedby` for errors, no placeholder-as-label.
- Dialogs/sheets: focus trap, Escape closes, focus returns to the trigger.
- Live regions:
  - Streaming assistant text: `aria-live="polite"` on a stable container; do not re-announce the whole message on every token.
  - Toasts: `role="status"` (polite) for success, `role="alert"` for errors.
- Loading: use `aria-busy` on the affected region; do not move focus.
- Status is never conveyed by color alone.
- Contrast: verify both themes.
- Respect `prefers-reduced-motion`; disable non-essential animation.
- Error summary at the top of long forms, linked to fields.
- Tables have headers and captions where appropriate.
- The document title reflects the current page.
- Test with keyboard only and at least one screen reader before release.

---

## 7. Loading, Empty, and Error States

### 7.1 Loading

- Lists and pages: **skeletons** that match the final layout; avoid full-page spinners.
- Lazy route chunks: the router's `hydrateFallbackElement` renders a centered, labeled spinner (`role="status"`), not a blank screen.
- Buttons: inline spinner plus disabled state; keep the label or use an accessible "loading" label.
- Chat: implemented as a spinner row at the assistant position with a labeled Stop control in the composer while the mock reply is pending. There is no token streaming; when a real streaming contract exists, follow the stop/abort rules in §8.3.
- Never show a fake progress percentage. Use indeterminate progress unless the API reports progress.
- Skeleton count should approximate the expected content and not shift layout excessively.

### 7.2 Empty

Every list and panel needs a purposeful empty state: icon, one-sentence explanation, and one primary action.

Examples (chat empty states are implemented with these roles):

| Surface | Copy (Persian) | Action |
|---|---|---|
| No conversations | «هنوز گفتگویی ندارید. یک گفتگوی جدید شروع کنید.» | «گفتگوی جدید» |
| No messages | «سؤال خود را درباره اسناد بپرسید.» | suggestion buttons / focus composer |
| No documents | «هنوز سندی بارگذاری نشده است.» | «بارگذاری سند» |
| No sources for a message | «منبعی برای این پاسخ ثبت نشده است.» | — |
| No data sources | «منبع داده‌ای پیکربندی نشده است.» | «افزودن منبع» |
| Search with no results | «نتیجه‌ای یافت نشد.» | clear filters |

Do not use empty states to imply functionality that is not implemented.

### 7.3 Error

- Inline errors near the affected content.
- Page-level errors preserve navigation.
- Always offer a recovery action: retry, edit, back, sign in again.
- Distinguish: network, authentication (401), permission (403), not found (404), validation, server (5xx), contract mismatch.
- Do not display raw server messages, HTML, or stack traces.
- Destructive failures (delete) must state whether the operation succeeded; never assume.
- Keep user input and drafts on failure.

### 7.4 Sign-in and session (implemented 2026-11-16)

- `/login` is a standalone centered card on the page background; no sidebar or header, so an unauthenticated user sees no product navigation.
- Every product route requires a session. Unknown paths resolve inside the authenticated tree, so anonymous visitors reach sign-in first; this avoids revealing which paths exist.
- During session restore the app shows a full-page labeled spinner. Never flash the login form or a protected page while the session is unknown.
- Expired session: after a redirect to `/login`, a `role="status"` notice explains that the session ended. Do not stack one error per failed request.
- Invalid credentials: one generic `role="alert"` above the submit button. Never indicate whether the username exists, and never clear the typed username.
- Field errors appear under their field with `aria-invalid` and `aria-describedby`; the first invalid field receives focus through the form library's default behavior.
- The password field has a labeled visibility toggle (`aria-pressed`) and `autoComplete="current-password"`; it is never prefilled.
- Submit shows a spinner and is disabled while pending, carrying `aria-busy` on the form.
- The account menu in the header shows the display name and email from the token (display only) and offers sign-out. Sign-out returns to `/login` without a confirmation step because it is non-destructive and reversible.
- No registration screen exists: the backend has no endpoint. Do not add a disabled register link that implies it will work.

---

## 8. Chat Interface Guidelines

> **Implemented as a preview (2026-11-16).** §8.1–8.7 exist as UI except real backend integration: conversations, messages, replies, and sources are mock, replies are simulated after 600 ms, and a visible preview banner says so. Do not remove the banner or describe the page as a working chat.

### 8.1 Layout (implemented)

- Desktop (`lg` and up): a `Card` split into a 288 px (`w-72`) history sidebar at the start edge and the message pane.
- Below `lg`: the sidebar is hidden and the same history opens in a start-side sheet from a header button; the pane uses the full width.
- The message list scrolls independently; the composer stays mounted at the bottom of the pane, including in empty states.
- Page height uses `dvh` calculations and the list is the only scroll area, so the composer is never pushed off-screen.
- Assistant messages align start with an avatar; user messages align end in a primary-colored bubble. Role labels, timestamps, and a "mock reply" badge are always visible, not hover-only.
- Auto-scroll follows the newest message using a `ResizeObserver` on the list content. A "new content below" affordance is not implemented because nothing is streamed.

### 8.2 Message rendering (implemented)

- Markdown headings, lists, blockquotes, links, inline code, and fenced code render with `react-markdown` + `rehype-highlight`.
- **GFM tables, task lists, and strikethrough do not render**: `remark-gfm` is not installed. Do not claim table support; add the plugin only with approval and tests.
- Code blocks show a language label when present, a copy control, internal scrolling (`max-h-80`), `dir="ltr"`, and monospace text.
- Links: only `http(s)` URLs become anchors, opened with `target="_blank"` and `rel="noopener noreferrer"`. Relative and `javascript:` links render as plain text.
- Images are never loaded; a placeholder shows the alt text instead.
- Raw HTML is never rendered. `h1` from model output is demoted to `h3` so it cannot compete with page structure.
- Long words and URLs wrap; code scrolls internally and the page never scrolls horizontally.

### 8.3 Actions and generation (implemented, mock-backed)

- Assistant rows expose copy and regenerate. Copy writes only the message text and reports «کپی شد» / «کپی انجام نشد» through an `aria-live` region; a denied clipboard is shown honestly.
- Regenerate rotates the mock reply variant and is disabled while generating. It is **not** real regeneration.
- Generating shows a spinner row at the assistant position and replaces Send with a labeled Stop button. Stop cancels only the local timer.
- Streaming is not implemented; text never arrives incrementally. Do not simulate tokens.
- There is no auto-scroll opt-out yet.

### 8.4 Composer (implemented)

- Auto-growing textarea starting at one row with a max height (`max-h-40`); it scrolls internally beyond that.
- Enter sends, Shift+Enter inserts a newline, and Enter is ignored during IME composition.
- Send is disabled when the input is empty or while generating; Stop replaces it during generation.
- The attachment button is disabled with an accessible explanation that file upload has no endpoint. Do not enable it until a real upload contract exists.
- Drafts live in component state only; nothing is persisted across reloads.

### 8.5 Conversation management (implemented on mock state)

- History provides a full-width new-chat button, search, conversation rows (truncated title, short date, active state), and a delete control with a destructive confirmation dialog.
- Delete and new chat operate on in-memory mock state only; reloading restores the seeded conversations.
- Search matches title and message text case-insensitively and has its own empty state.
- Rename and overflow menus are not implemented. Do not add controls that imply a backend operation.

### 8.6 Sources (implemented on mock data)

- Source cards are labeled «منابع (نمایشی)» and expand per source to show document name, page and score when present, and the retrieved snippet.
- The UI tolerates missing values: `page`, `score`, and `snippet` may be null.
- These are mock values. Never present them as citations from a real retrieval until the API supplies them.

### 8.7 Preview honesty

- A persistent banner contains the preview badge, a notice that replies are mock and not saved, and a "mock reply" label in the conversation header.
- The only simulated delay is a short local timer used to exercise generating and stop; it is not fake progress and shows no percentage.
- Empty and no-conversation states state that preview data is not sent to a server.

---

## 9. Document Upload Interface

- Dropzone plus file picker; the whole zone is keyboard-activatable.
- Accepted type: PDF for the current backend. Show the constraint before upload.
- Show max size only when the backend documents it; otherwise state that the server validates size.
- Per-file row: name, size, progress, status (`در انتظار`, `در حال بارگذاری`, `در حال پردازش`, `آماده`, `خطا`), retry/remove.
- Upload progress requires `XMLHttpRequest` (or a streaming upload API); `fetch` does not expose upload progress. Encapsulate this in the upload module, not in the component.
- Processing status is server-driven; poll only when an endpoint exists, with backoff and a stop condition.
- Errors: show a safe message and keep the file available for retry.
- Do not allow duplicate submits for the same file while in progress.
- Do not preview file contents; show metadata only.
- After success, invalidate the document list query; do not optimistically mark "ready".
- Accessible: `aria-live` for status changes; drag-and-drop is an enhancement, not the only method.

---

## 10. Data Source Interface

- List of sources with name, type, status, and last checked time (when provided).
- Source detail: connection metadata (never secrets), schema browser, table list, column details (name, type, nullability).
- Schema tree is keyboard navigable; expand/collapse with arrow keys.
- Permissions are read-only unless a backend endpoint explicitly supports editing.
- Never display passwords or connection strings; mask anything secret-like.
- Source selection for a conversation uses a combobox with search, disabled state while loading, and a clear empty state.
- If schema browsing is unavailable, do not fabricate tables or example schemas in production.

---

## 11. Settings Interface

- Sections: حساب کاربری, مدل هوش مصنوعی, تنظیمات بازیابی, تعبیه (Embedding), ترجیحات.
- Group related fields in cards with a short description.
- Save behavior: explicit save button per section, dirty-state indication, and a leave-page warning when unsaved changes exist.
- Client-only preferences (theme, density, language) save immediately.
- Server-side settings must come from a documented endpoint; until one exists, render a clearly disabled "not available yet" state rather than fake inputs.
- Never display API keys or model secrets. If the backend returns a masked value, show the mask only.
- Destructive settings require confirmation and explain the impact.

---

## 12. Microcopy

- Language: Persian, formal but not archaic. Use «شما» consistently.
- Buttons: verb-first, specific. «ارسال», «بارگذاری سند», «تلاش دوباره», «حذف گفتگو».
- Avoid vague labels: not «تأیید» alone for destructive actions; use «حذف سند».
- Errors: what happened + what to do. «ارتباط با سرور برقرار نشد. اتصال اینترنت را بررسی کنید و دوباره تلاش کنید.»
- Loading: «در حال دریافت…», «در حال تولید پاسخ…», «در حال پردازش سند…».
- Empty: one sentence, no blame.
- Do not expose backend terminology: avoid «DTO», «Qdrant», «Ollama», «chunk» in user-facing copy. Use «منبع», «بخش», «مدل».
- Keep English for product terms with no established Persian equivalent, but be consistent (for example, «مدل» not mixing «مدل/Model»).
- All strings live in the typed catalogs `src/i18n/fa.ts` and `src/i18n/en.ts`; no inline user-facing strings in components. Components receive `t` from `useLanguage()`.

---

## 13. Motion and Feedback

- Micro-interactions: 150–200 ms, ease-out. No bounce on professional surfaces.
- Toasts auto-dismiss after ~5 s for success; errors persist until dismissed or resolved.
- Never move focus automatically on toast display.
- Streaming cursor is optional and must not distract; respect reduced motion.
- Skeleton shimmer is disabled under `prefers-reduced-motion`.
- Hover states are additive; the interface remains usable without hover.

---

## 14. UI Review Checklist

- [ ] RTL layout correct at 360 px, 768 px, 1024 px, and 1440 px.
- [ ] LTR (English) layout checked at the same widths; direction switch flips navigation, menus, and sheets.
- [ ] Light and dark themes both checked.
- [ ] Keyboard-only pass through the primary flow.
- [ ] Focus visible on every interactive element.
- [ ] Screen reader announces streaming, errors, and upload status appropriately.
- [ ] Empty, loading, and error states exist for every data surface.
- [ ] No fabricated data, citations, progress, or statuses.
- [ ] Persian copy reviewed for consistency and terminology.
- [ ] Code blocks and file names render LTR without breaking layout.
- [ ] Contrast meets AA in both themes.
- [ ] No page-level horizontal scrolling.
- [ ] Destructive actions require confirmation and are labeled specifically.
- [ ] UI clearly distinguishes "not implemented" from "failed".
