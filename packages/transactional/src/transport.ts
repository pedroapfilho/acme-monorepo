import { randomUUID } from "node:crypto";
import { mkdir, readdir, readFile, rename, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { Resend } from "resend";
import { z } from "zod";

type Transport = Resend["emails"]["send"];

const OUTBOX = join(tmpdir(), "acme-outbox");

const addressSchema = z.string();

const recipientsSchema = z.union([addressSchema, z.array(addressSchema)]);

const outboxMailSchema = z.object({
  bcc: recipientsSchema.optional(),
  cc: recipientsSchema.optional(),
  from: addressSchema,
  html: z.string(),
  replyTo: recipientsSchema.optional(),
  subject: z.string(),
  text: z.string(),
  to: recipientsSchema,
});

type OutboxMail = z.infer<typeof outboxMailSchema>;

const outboxTransport: Transport = async (payload) => {
  const mail = outboxMailSchema.safeParse(payload);

  if (!mail.success) {
    return {
      data: null,
      error: { message: z.prettifyError(mail.error), name: "validation_error", statusCode: 422 },
      headers: null,
    };
  }

  const id = randomUUID();
  const file = join(OUTBOX, `${Date.now()}-${id}.json`);

  await mkdir(OUTBOX, { recursive: true });
  await writeFile(`${file}.partial`, JSON.stringify(mail.data));
  await rename(`${file}.partial`, file);

  return { data: { id }, error: null, headers: null };
};

const readOutbox = async (sinceMs: number): Promise<Array<OutboxMail>> => {
  await mkdir(OUTBOX, { recursive: true });

  const names = await readdir(OUTBOX);

  const recent = names.filter(
    (name) => name.endsWith(".json") && Number(name.split("-")[0]) >= sinceMs,
  );

  return Promise.all(
    recent.map(async (name) => {
      const contents = await readFile(join(OUTBOX, name), "utf8");

      return outboxMailSchema.parse(JSON.parse(contents));
    }),
  );
};

type TransportConfig = {
  apiKey: string | undefined;
  transport: string | undefined;
};

const createTransport = ({ apiKey, transport }: TransportConfig): Transport => {
  if (transport === "outbox") {
    return outboxTransport;
  }

  if (apiKey === undefined || apiKey === "") {
    throw new Error("RESEND_API_KEY is required unless MAIL_TRANSPORT=outbox");
  }

  const resend = new Resend(apiKey);

  return (payload, options) => resend.emails.send(payload, options);
};

export { createTransport, readOutbox };

export type { OutboxMail, Transport };
