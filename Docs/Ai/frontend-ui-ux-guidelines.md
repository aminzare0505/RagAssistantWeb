# Frontend UI/UX Guidelines — RAG Assistant

> **Status:** Design direction for the React application. The app shell, design tokens, and placeholder pages exist; no product UI exists yet.
> **Audience:** frontend engineers, designers, and review agents.
> **Last updated:** 2026-11-15
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

- **Tailwind CSS 4** with CSS variables exposed as semantic tokens.
- **shadcn/ui** primitives copied into `components/ui`. Compose; do not fork them for one screen.
- **Lucide React** icons at consistent sizes (`size-4` inline, `size-5` controls).
- Spacing base unit: **4 px**. Use the Tailwind scale; avoid arbitrary values.
- Radii: `--radius` (default 0.5rem); cards and inputs use the same token.
- Shadows: subtle, one level for popovers and one for modals. No decorative glow.
- Motion: 150–200 ms, ease-out; respect `prefers-reduced-motion`.

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
}
```

Rules:

- Components reference `bg-background`, `text-foreground`, `border-border`, `text-muted-foreground`, `bg-primary`, etc.
- No hex colors in feature components.
- Contrast must meet WCAG AA (4.5:1 for body text, 3:1 for large text and UI boundaries).
- Status colors always pair with text or an icon.

### 2.3 Typography

- Primary font: **Vazirmatn**, self-hosted (woff2), weights 400/500/600/700. No third-party font CDN.
- Fallback stack: `Vazirmatn, "Segoe UI", Tahoma, system-ui, sans-serif`.
- Code font: `ui-monospace, "Cascadia Code", "Consolas", monospace`.
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
- Options: **system**, **light**, **dark**. Persist the preference in `localStorage` under a non-sensitive key (for example `theme`). Theme is not sensitive data.
- Respect `prefers-color-scheme` when set to system; listen for changes.
- Prevent flash of incorrect theme by applying the class before first paint (inline bootstrap in `index.html`).
- Both themes must be visually reviewed for: borders, disabled states, focus rings, code blocks, citations, and error banners.
- Do not invert images; use theme-specific assets if needed.

---

## 4. RTL and Persian Support

- `<html lang="fa" dir="rtl">` globally.
- Use Tailwind logical utilities: `ps-*`, `pe-*`, `ms-*`, `me-*`, `start-*`, `end-*`, `text-start`, `text-end`, `rounded-s-*`, `rounded-e-*`.
- Avoid `left`/`right`, `ml`/`mr`, `pl`/`pr` except for physical needs (for example, a decorative layer).
- Directional icons (send, back, chevron, indent) mirror in RTL. Non-directional icons (search, trash, copy) do not.
- Chat alignment is semantic, not physical: user messages align `end`, assistant messages align `start`.
- User and model content may contain Latin text and code. Apply `dir="auto"` to message content containers so bidi runs render correctly; force `dir="ltr"` on code blocks, inline code, URLs, and identifiers.
- Mixed bidi content must not break layout; test with Persian + English + code in one message.
- Numbers:
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

- **Desktop (≥ lg):** fixed sidebar (280 px) with navigation and conversation list; main content area; optional right-side sources panel (360 px) that collapses.
- **Tablet (md):** sidebar collapses to an icon rail or a sheet; sources panel becomes a drawer.
- **Mobile (< md):** single column; navigation in a sheet; chat composer pinned above the safe area; sources open as a full-height sheet.
- Use `dvh` (not `vh`) for full-height chat on mobile browsers with dynamic toolbars.
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
- Buttons: inline spinner plus disabled state; keep the label or use an accessible "loading" label.
- Chat: typing indicator at the assistant position; when streaming is unavailable, show a clear "generating" state.
- Never show a fake progress percentage. Use indeterminate progress unless the API reports progress.
- Skeleton count should approximate the expected content and not shift layout excessively.

### 7.2 Empty

Every list and panel needs a purposeful empty state: icon, one-sentence explanation, and one primary action.

Examples:

| Surface | Copy (Persian) | Action |
|---|---|---|
| No conversations | «هنوز گفتگویی ندارید. یک گفتگوی جدید شروع کنید.» | «گفتگوی جدید» |
| No messages | «سؤال خود را درباره اسناد بپرسید.» | focus composer |
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

---

## 8. Chat Interface Guidelines

### 8.1 Layout

- Conversation view: scrollable message list; sticky composer at the bottom; optional sources panel.
- Message max width ~48rem for readability; full-width code blocks inside.
- User message: aligned to the end, distinct surface, no avatar needed.
- Assistant message: aligned to the start, plain content surface, product avatar optional.
- Group consecutive messages from the same role; show timestamps on hover/focus or in a compact meta row.
- System messages are visually subdued and not styled as user content.

### 8.2 Message rendering

- Markdown: headings, lists, tables, blockquotes, links, inline code, fenced code.
- Code blocks: language label when available, copy button, horizontal scroll, `dir="ltr"`, monospace.
- Tables: scrollable container; do not break the page width.
- Links: safe protocols, external-link indication, `noopener noreferrer`.
- Long words/URLs: `overflow-wrap: anywhere` where appropriate.
- Do not render raw HTML.
- Preserve whitespace for plain text that is not markdown.

### 8.3 Streaming and generation

- While generating:
  - Show an assistant placeholder immediately.
  - Render tokens incrementally only when a streaming contract exists.
  - Keep the "stop" control reachable and clearly labeled («توقف تولید»).
  - Do not auto-scroll if the user has scrolled up; show a "new content below" affordance.
  - Auto-scroll when the user is at the bottom, with a small threshold.
- Stop:
  - Abort the client request immediately.
  - Mark the message as stopped (not failed) and keep partial content if the backend supports it.
  - Never pretend the server stopped generating if only the client disconnected.
- Regenerate:
  - Offer on assistant messages.
  - Confirm if it will discard the current answer.
  - Disable while another generation is running.
- Copy:
  - Copy the message text only; show a brief success state.
- Errors:
  - Show a retry action on the failed assistant turn.
  - Do not insert an error as an assistant message in the transcript history.

### 8.4 Composer

- Auto-growing textarea with a sensible max height; scroll inside after that.
- Enter sends; Shift+Enter inserts a newline. Handle IME composition correctly.
- Disable send when empty, when generating (unless the backend supports queueing), or when no source is selected if the API requires one.
- Preserve the draft per conversation in memory; a page reload may lose it (state that behavior).
- Show character/token limits only if the backend documents them.
- Attachment control only when an upload endpoint exists and the feature is real.

### 8.5 Conversation management

- Sidebar list: title, last-updated time, active state, overflow menu (rename, delete).
- Rename and delete require a real endpoint; until then, do not ship the controls as working features.
- Deleting the active conversation navigates to `/chat`.
- Infinite scroll or pagination only with a documented API.

### 8.6 Sources and citations

- Render citations only from API-provided fields: document name, page number, chunk index, score, and a document id if provided.
- Never invent page numbers or scores. The backend currently omits page numbers in search results, so the UI must tolerate missing values.
- Citation chip format: file name + page when present; score in the details, not the chip.
- Clicking a citation opens the sources panel with the full retrieved text and metadata; a link to the document detail page exists only when that page is implemented.
- Distinguish "no sources returned" from "sources not supported yet" in development notes, not in user-facing copy.
- If the answer is not grounded, the UI must not imply citations exist.

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
- All strings live in `src/i18n/fa.ts`; no inline Persian in deep components.

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
