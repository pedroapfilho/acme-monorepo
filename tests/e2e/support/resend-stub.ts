import { randomUUID } from "node:crypto";
import { createServer } from "node:http";
import type { IncomingMessage, ServerResponse } from "node:http";

import { z } from "zod";

const recipientsSchema = z
  .union([z.string(), z.array(z.string())])
  .nullish()
  .transform((recipients) =>
    recipients === null || recipients === undefined ? [] : [recipients].flat(),
  );

const tagSchema = z.object({ name: z.string(), value: z.string() });

const sendRequestSchema = z.object({
  bcc: recipientsSchema,
  cc: recipientsSchema,
  from: z.string(),
  html: z.string().optional(),
  reply_to: recipientsSchema,
  subject: z.string(),
  tags: z.array(tagSchema).optional(),
  text: z.string().optional(),
  to: recipientsSchema,
});

type SendRequest = z.infer<typeof sendRequestSchema>;

type StoredEmail = {
  bcc: Array<string>;
  cc: Array<string>;
  created_at: string;
  from: string;
  html: string | null;
  id: string;
  last_event: "delivered";
  object: "email";
  reply_to: Array<string>;
  scheduled_at: null;
  subject: string;
  tags: Array<{ name: string; value: string }> | null;
  text: string | null;
  to: Array<string>;
};

type EmailSummary = Omit<StoredEmail, "html" | "tags" | "text">;

type StubResponse =
  | StoredEmail
  | { data: Array<EmailSummary>; has_more: false; object: "list" }
  | { id: string }
  | { message: string; name: string };

const PORT = Number(process.env.RESEND_STUB_PORT ?? 3999);

const emails: Array<StoredEmail> = [];

const store = (request: SendRequest): StoredEmail => {
  const email: StoredEmail = {
    bcc: request.bcc,
    cc: request.cc,
    created_at: new Date().toISOString(),
    from: request.from,
    html: request.html ?? null,
    id: randomUUID(),
    last_event: "delivered",
    object: "email",
    reply_to: request.reply_to,
    scheduled_at: null,
    subject: request.subject,
    tags: request.tags ?? null,
    text: request.text ?? null,
    to: request.to,
  };
  emails.unshift(email);
  return email;
};

const summarize = ({
  html: _html,
  tags: _tags,
  text: _text,
  ...summary
}: StoredEmail): EmailSummary => summary;

const readBody = async (request: IncomingMessage): Promise<string> => {
  const chunks: Array<Buffer> = [];
  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk)));
  }
  return Buffer.concat(chunks).toString("utf8");
};

const respond = (response: ServerResponse, status: number, payload: StubResponse) => {
  response.writeHead(status, { "content-type": "application/json" });
  response.end(JSON.stringify(payload));
};

const handle = async (request: IncomingMessage, response: ServerResponse) => {
  const url = new URL(request.url ?? "/", `http://localhost:${PORT}`);
  const emailId = /^\/emails\/(?<id>[^\/]+)$/v.exec(url.pathname)?.groups?.id;

  if (request.method === "POST" && url.pathname === "/emails") {
    const sendRequest = sendRequestSchema.parse(JSON.parse(await readBody(request)));
    respond(response, 200, { id: store(sendRequest).id });
    return;
  }

  if (request.method === "GET" && url.pathname === "/emails") {
    const limit = Number(url.searchParams.get("limit") ?? 100);
    respond(response, 200, {
      data: emails.slice(0, limit).map((email) => summarize(email)),
      has_more: false,
      object: "list",
    });
    return;
  }

  if (request.method === "GET" && emailId !== undefined) {
    const email = emails.find((candidate) => candidate.id === emailId);
    if (email === undefined) {
      respond(response, 404, { message: "Email not found", name: "not_found" });
      return;
    }
    respond(response, 200, email);
    return;
  }

  respond(response, 404, { message: `${request.method} ${url.pathname}`, name: "not_found" });
};

const serve = async (request: IncomingMessage, response: ServerResponse) => {
  try {
    await handle(request, response);
  } catch (error) {
    respond(response, 422, {
      message: error instanceof Error ? error.message : "Invalid request",
      name: "validation_error",
    });
  }
};

createServer((request, response) => {
  void serve(request, response);
}).listen(PORT);
