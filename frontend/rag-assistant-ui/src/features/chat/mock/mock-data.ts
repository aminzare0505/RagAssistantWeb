import type { Language } from '@/i18n/messages';

import type { ChatConversation, ChatMessage, ChatSource } from '../types';

/**
 * Mock data for UI development only. It is imported exclusively by the chat
 * page and never sent to or received from the backend. Delete this folder when
 * the chat contract is verified.
 */

/** Artificial delay so the mock reply exercises the generating/stop UI. */
export const MOCK_REPLY_DELAY_MS = 600;

interface MockReply {
  content: string;
  sources: ChatSource[];
}

function source(
  id: string,
  documentName: string,
  page: number | null,
  score: number | null,
  snippet: string | null,
): ChatSource {
  return { id, documentName, page, score, snippet };
}

function replyFa(turn: number): MockReply {
  if (turn % 3 === 1) {
    return {
      content: `برای فراخوانی نقطهٔ پایانی، ابتدا نشانهٔ دسترسی را در حافظه نگه دارید و سپس درخواست را با سرآیند \`Authorization\` بفرستید.

\`\`\`ts
const response = await fetch('/api/documents', {
  headers: { Authorization: \`Bearer \${accessToken}\` },
});

if (!response.ok) {
  throw new Error('Request failed');
}
\`\`\`

- پاسخ موفق همیشه \`isSuccess\` را بررسی کنید.
- کد وضعیت داخل بدنه را مبنای تصمیم نگیرید.

> این پاسخ نمایشی است و از سرور نیامده است.`,
      sources: [
        source('src-2a', 'مستندات API.pdf', 8, 0.82, 'همهٔ درخواست‌های محافظت‌شده به سرآیند Bearer نیاز دارند.'),
        source('src-2b', 'راهنمای یکپارچه‌سازی.pdf', 21, 0.69, 'کد وضعیت HTTP و مقدار isSuccess را با هم بررسی کنید.'),
      ],
    };
  }

  if (turn % 3 === 2) {
    return {
      content: `### جمع‌بندی سند

سند «راهنمای استقرار» سه مرحله را توضیح می‌دهد:

1. آماده‌سازی پیکربندی محیط
2. اجرای مهاجرت‌های پایگاه داده
3. راه‌اندازی واسط معکوس روی همان مبدأ

جزئیات هر مرحله در بخش‌های بعدی آمده است.`,
      sources: [
        source('src-3a', 'راهنمای استقرار.pdf', 4, 0.91, 'پیکربندی محیط پیش از اجرای سرویس انجام می‌شود.'),
      ],
    };
  }

  return {
    content: `بر اساس بخش بازیابی‌شده، **سه نکتهٔ کلیدی** وجود دارد:

- پردازش سند به‌صورت قطعه‌قطعه انجام می‌شود.
- هر پاسخ باید به منبع خود ارجاع بدهد.
- خطاها باید پیام قابل‌فهم و بدون افشای جزئیات سرور باشند.

برای مشاهدهٔ متن کامل، بخش «${'منابع'}» را باز کنید.`,
    sources: [
      source('src-1a', 'راهنمای استقرار.pdf', 12, 0.87, 'پردازش اسناد در قطعه‌های کوچک انجام می‌شود تا بازیابی دقیق‌تر باشد.'),
      source('src-1b', 'سیاست‌های امنیتی.pdf', 3, 0.74, 'پیام خطا نباید مسیر فایل یا متن استثنا را نشان دهد.'),
    ],
  };
}

function replyEn(turn: number): MockReply {
  if (turn % 3 === 1) {
    return {
      content: `To call the endpoint, keep the access token in memory and send the request with an \`Authorization\` header.

\`\`\`ts
const response = await fetch('/api/documents', {
  headers: { Authorization: \`Bearer \${accessToken}\` },
});

if (!response.ok) {
  throw new Error('Request failed');
}
\`\`\`

- Always check \`isSuccess\` on a successful response.
- Do not trust the status code inside the body.

> This reply is mock content and did not come from the server.`,
      sources: [
        source('src-2a', 'API reference.pdf', 8, 0.82, 'Protected requests require a Bearer header.'),
        source('src-2b', 'Integration guide.pdf', 21, 0.69, 'Check the HTTP status together with isSuccess.'),
      ],
    };
  }

  if (turn % 3 === 2) {
    return {
      content: `### Document summary

The deployment guide describes three steps:

1. Prepare the environment configuration
2. Run database migrations
3. Put the reverse proxy on the same origin

Later sections cover each step in detail.`,
      sources: [
        source('src-3a', 'Deployment guide.pdf', 4, 0.91, 'Configure the environment before starting the service.'),
      ],
    };
  }

  return {
    content: `The retrieved section makes **three key points**:

- Documents are processed in chunks.
- Every answer must reference its source.
- Errors should stay readable and never expose server details.

Open the sources section to read the full excerpt.`,
    sources: [
      source('src-1a', 'Deployment guide.pdf', 12, 0.87, 'Documents are processed in small chunks to improve retrieval accuracy.'),
      source('src-1b', 'Security policy.pdf', 3, 0.74, 'Error messages must not reveal file paths or exception text.'),
    ],
  };
}

export function createMockReply(language: Language, turn: number): MockReply {
  return language === 'fa' ? replyFa(turn) : replyEn(turn);
}

let sequence = 0;

function nextId(prefix: string): string {
  sequence += 1;
  return `${prefix}-${sequence}`;
}

function message(
  role: ChatMessage['role'],
  content: string,
  createdAt: string,
  sources: ChatSource[] = [],
): ChatMessage {
  return { id: nextId('msg'), role, content, createdAt, sources };
}

function conversation(
  title: string,
  updatedAt: string,
  messages: ChatMessage[],
): ChatConversation {
  return { id: nextId('conv'), title, updatedAt, messages };
}

const FIRST = '2026-11-16T09:12:00.000Z';
const SECOND = '2026-11-16T08:40:00.000Z';
const THIRD = '2026-11-15T16:05:00.000Z';

export function createMockConversations(language: Language): ChatConversation[] {
  const first = createMockReply(language, 0);
  const second = createMockReply(language, 1);
  const third = createMockReply(language, 2);

  return [
    conversation(
      language === 'fa' ? 'پرسش دربارهٔ راهنمای استقرار' : 'Question about the deployment guide',
      FIRST,
      [
        message(
          'user',
          language === 'fa'
            ? 'مهم‌ترین نکات راهنمای استقرار چیست؟'
            : 'What are the key points of the deployment guide?',
          FIRST,
        ),
        message('assistant', first.content, FIRST, first.sources),
      ],
    ),
    conversation(
      language === 'fa' ? 'فراخوانی API' : 'Calling the API',
      SECOND,
      [
        message(
          'user',
          language === 'fa'
            ? 'یک نمونه کد برای فراخوانی API نشان بده.'
            : 'Show a sample API call in code.',
          SECOND,
        ),
        message('assistant', second.content, SECOND, second.sources),
      ],
    ),
    conversation(
      language === 'fa' ? 'خلاصهٔ سند' : 'Document summary',
      THIRD,
      [
        message(
          'user',
          language === 'fa' ? 'این سند را خلاصه کن.' : 'Summarize this document.',
          THIRD,
        ),
        message('assistant', third.content, THIRD, third.sources),
      ],
    ),
  ];
}

export function createEmptyConversation(language: Language): ChatConversation {
  const now = new Date().toISOString();
  return {
    id: nextId('conv'),
    title: language === 'fa' ? 'گفتگوی جدید' : 'New chat',
    updatedAt: now,
    messages: [],
  };
}

export function createUserMessage(content: string): ChatMessage {
  return message('user', content, new Date().toISOString());
}

export function createAssistantMessage(language: Language, turn: number): ChatMessage {
  const reply = createMockReply(language, turn);
  return message('assistant', reply.content, new Date().toISOString(), reply.sources);
}
