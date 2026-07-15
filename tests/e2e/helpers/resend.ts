// Poll Resend GET /emails to catch "JWT valid but send never happened" regressions.

const RESEND_API = "https://api.resend.com";

const sleep = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

type ResendListItem = {
  bcc: string | null;
  cc: string | null;
  created_at: string;
  from: string;
  id: string;
  last_event: string;
  reply_to: string | null;
  scheduled_at: string | null;
  subject: string;
  to: Array<string>;
};

type ResendEmail = ResendListItem & {
  html: string | null;
  object: "email";
  tags: Array<{ name: string; value: string }> | null;
  text: string | null;
};

const requireApiKey = (): string => {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    throw new Error(
      "RESEND_API_KEY is required for the Resend e2e helper. " +
        "Specs that depend on delivery assertions should `test.skip` themselves " +
        "with `test.skip(!process.env.RESEND_API_KEY, ...)`.",
    );
  }
  return key;
};

// Resend caps the team at 5 req/s; parallel specs polling at 1Hz trip 429s.
// Defaults mirror vercel/fetch-retry (factor 6, 5 retries, retry-after cap 20s).
const RETRY_MAX_ATTEMPTS = 5;
const RETRY_MAX_RETRY_AFTER_SECONDS = 20;
const RETRY_BASE_MS = 200;
const RETRY_FACTOR = 6;
const RETRY_JITTER_MS = 100;

const computeBackoffMs = (attempt: number): number => {
  // Exponential backoff with jitter so parallel clients don't re-synchronize after 429s.
  const base = Math.min(
    RETRY_BASE_MS * RETRY_FACTOR ** attempt,
    RETRY_MAX_RETRY_AFTER_SECONDS * 1000,
  );
  return base + Math.floor(Math.random() * RETRY_JITTER_MS);
};

const isRetryableStatus = (status: number): boolean =>
  status === 429 || (status >= 500 && status < 600);

const resendFetch = async (path: string): Promise<Response> => {
  const url = `${RESEND_API}${path}`;
  const headers = { Authorization: `Bearer ${requireApiKey()}` };

  let attempt = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    // eslint-disable-next-line no-await-in-loop
    const response = await fetch(url, { headers });

    if (!isRetryableStatus(response.status) || attempt >= RETRY_MAX_ATTEMPTS) {
      if (!response.ok) {
        // eslint-disable-next-line no-await-in-loop
        const body = await response.text().catch(() => "<unreadable>");
        throw new Error(`Resend ${path} → ${response.status}: ${body}`);
      }
      return response;
    }

    // Resend sends retry-after in seconds (not HTTP-date); fall back to exponential backoff.
    const retryAfterHeader = response.headers.get("retry-after");
    // `Number("")` is 0, which would skip the backoff; keep NaN when the header is missing.
    const retryAfter = retryAfterHeader ? Math.trunc(Number(retryAfterHeader)) : Number.NaN;
    const delayMs = Number.isFinite(retryAfter)
      ? Math.min(retryAfter, RETRY_MAX_RETRY_AFTER_SECONDS) * 1000 +
        Math.floor(Math.random() * RETRY_JITTER_MS)
      : computeBackoffMs(attempt);

    // eslint-disable-next-line no-await-in-loop
    await sleep(delayMs);
    attempt += 1;
  }
};

const listEmails = async (limit = 100): Promise<Array<ResendListItem>> => {
  const response = await resendFetch(`/emails?limit=${limit}`);
  const body = (await response.json()) as { data?: Array<ResendListItem> };
  return body.data ?? [];
};

const getEmail = async (id: string): Promise<ResendEmail> => {
  const response = await resendFetch(`/emails/${id}`);
  return (await response.json()) as ResendEmail;
};

type WaitForEmailOptions = {
  sinceMs: number;
  subject?: RegExp;
  to: string;
};

type WaitForOptions = {
  // Resend's email index is eventually consistent; CI cold starts can stretch list latency.
  pollMs?: number;
  timeoutMs?: number;
};

const waitForEmail = async (
  match: WaitForEmailOptions,
  options: WaitForOptions = {},
): Promise<ResendEmail> => {
  const timeoutMs = options.timeoutMs ?? 30_000;
  const pollMs = options.pollMs ?? 1000;
  const target = match.to.toLowerCase();
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    // eslint-disable-next-line no-await-in-loop
    const recent = await listEmails(100);

    const candidate = recent.find((mail) => {
      const created = Date.parse(mail.created_at);
      if (Number.isNaN(created) || created < match.sinceMs) {
        return false;
      }
      if (!mail.to.some((addr) => addr.toLowerCase() === target)) {
        return false;
      }
      if (match.subject && !match.subject.test(mail.subject)) {
        return false;
      }
      return true;
    });

    if (candidate) {
      // eslint-disable-next-line no-await-in-loop
      return await getEmail(candidate.id);
    }

    // eslint-disable-next-line no-await-in-loop
    await sleep(pollMs);
  }

  const subjectClause = match.subject ? ` matching ${match.subject}` : "";
  throw new Error(
    `waitForEmail: no email to ${match.to}${subjectClause} within ${timeoutMs}ms; check the auth send-hook actually executed.`,
  );
};

// HTML href first; fall back to bare URL in the text body when templates are text-only.
const extractLink = (email: ResendEmail, pattern: RegExp): string => {
  const haystack = email.html ?? email.text ?? "";
  const hrefMatches = haystack.matchAll(/href="(?<href>[^"]+)"/gv);
  for (const [, href] of hrefMatches) {
    const decoded = href.replaceAll("&amp;", "&");
    if (pattern.test(decoded)) {
      return decoded;
    }
  }
  const direct = haystack.match(pattern);
  if (direct) {
    return direct[0];
  }
  throw new Error(
    `extractLink: no URL matching ${pattern} in email ${email.id} ` +
      `(subject: "${email.subject}"). Body length: ${haystack.length}.`,
  );
};

export { extractLink, getEmail, listEmails, waitForEmail };
export type { ResendEmail, ResendListItem };
