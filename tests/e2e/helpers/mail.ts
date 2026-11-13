import { expect } from "@playwright/test";
import { readOutbox } from "@repo/transactional/transport";
import type { OutboxMail } from "@repo/transactional/transport";

type MailMatch = {
  sinceMs: number;
  subject?: RegExp;
  to: string;
};

const delivered = async ({ sinceMs, subject, to }: MailMatch): Promise<Array<OutboxMail>> => {
  const recipient = to.toLowerCase();
  const outbox = await readOutbox(sinceMs);

  return outbox.filter(
    (mail) =>
      [mail.to].flat().some((address) => address.toLowerCase() === recipient) &&
      (subject === undefined || subject.test(mail.subject)),
  );
};

const waitForEmail = async (match: MailMatch): Promise<OutboxMail> => {
  const description = `an email to ${match.to}${match.subject === undefined ? "" : ` matching ${match.subject}`}`;

  await expect
    .poll(
      async () => {
        const mails = await delivered(match);

        return mails.length;
      },
      { message: `${description} in the outbox`, timeout: 30_000 },
    )
    .toBeGreaterThan(0);

  const [mail] = await delivered(match);

  if (mail === undefined) {
    throw new Error(`waitForEmail: ${description} left the outbox`);
  }

  return mail;
};

const extractLink = (mail: OutboxMail, pattern: RegExp): string => {
  for (const [, href] of mail.html.matchAll(/href="(?<href>[^"]+)"/gv)) {
    const link = href?.replaceAll("&amp;", "&");

    if (link !== undefined && pattern.test(link)) {
      return link;
    }
  }

  throw new Error(`extractLink: no link matching ${pattern} in the email "${mail.subject}"`);
};

export { extractLink, waitForEmail };
