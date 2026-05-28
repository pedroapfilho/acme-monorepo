// Resend test-inbox client used by the auth-email specs to assert that
// transactional emails were actually sent (and not silently dropped by a
// regressed sender, missing API key, schema-validation rejection, etc.).
//
// Why poll the live API instead of reconstructing JWTs locally:
// reconstruction proves the token format is correct, but says NOTHING about
// whether the email left our infrastructure. We've been bitten by that —
// "the JWT was valid but the email never sent" is the bug class this helper
// catches. The JWT/DB-poll path in `verification.fixture.ts` remains useful
// for tests where delivery isn't under test (e.g. seeding a verified user
// before a different scenario).
//
// All sends in e2e use `delivered+<label>@resend.dev` (see helpers/test-email.ts).
// Resend short-circuits delivery for these addresses but still records the
// send in the API, so `GET /emails` lists them in test-mode runs.

const RESEND_API = "https://api.resend.com";

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

const resendFetch = async (path: string): Promise<Response> => {
  const response = await fetch(`${RESEND_API}${path}`, {
    headers: { Authorization: `Bearer ${requireApiKey()}` },
  });
  if (!response.ok) {
    const body = await response.text().catch(() => "<unreadable>");
    throw new Error(`Resend ${path} → ${response.status}: ${body}`);
  }
  return response;
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
  // Only match emails created at or after this Unix-ms timestamp. Pin to
  // `Date.now()` at the start of a test so prior runs' mails don't match.
  sinceMs: number;
  subject?: RegExp;
  // Address that must appear in `to[]`. Case-insensitive.
  to: string;
};

type WaitForOptions = {
  // ms — Resend's index is eventually consistent; in practice mails
  // become listable within a few seconds, but CI cold starts can stretch.
  pollMs?: number;
  timeoutMs?: number;
};

const sleep = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

// Polls `GET /emails` until a matching message appears, then fetches its
// HTML body via `GET /emails/:id`. Throws if the deadline elapses with no
// match — the caller's spec should fail loudly so the email regression
// surfaces, rather than time out into a misleading downstream error.
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
    `waitForEmail: no email to ${match.to}${subjectClause} within ${timeoutMs}ms — check the auth send-hook actually executed.`,
  );
};

// Pulls the first href matching `pattern` out of the email's HTML body.
// Falls back to the text body if HTML is empty (some templates render text-only).
const extractLink = (email: ResendEmail, pattern: RegExp): string => {
  const haystack = email.html ?? email.text ?? "";
  // Match an href="..." attribute whose URL satisfies the pattern.
  const hrefMatches = haystack.matchAll(/href="([^"]+)"/gv);
  for (const [, href] of hrefMatches) {
    const decoded = href.replaceAll("&amp;", "&");
    if (pattern.test(decoded)) {
      return decoded;
    }
  }
  // Plain-text fallback — look for the bare URL.
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
