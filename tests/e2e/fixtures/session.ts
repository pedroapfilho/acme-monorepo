import { test as base, expect } from "@playwright/test";
import type { APIRequestContext } from "@playwright/test";
import { COOKIE_PREFIX } from "@repo/auth/server";
import { prisma } from "@repo/db";
import { getCookies } from "better-auth/cookies";

import { makeTestEmail } from "../helpers/test-email";
import { apiUrl, webUrl } from "../urls";

import { verificationLink } from "./verification.fixture";

type Credentials = { email: string; name: string; password: string };

type OwnedAccount = Credentials & { id: string };
type CreateAccount = (
  register?: (credentials: Credentials) => Promise<void>,
) => Promise<OwnedAccount>;

type SessionOptions = { emailDelivery: boolean };

const sessionCookieName = getCookies({
  advanced: {
    cookiePrefix: COOKIE_PREFIX,
    useSecureCookies: new URL(webUrl).protocol === "https:",
  },
}).sessionToken.name;

// Better Auth checks the Origin of every cookie-carrying POST.
const authPost = (request: APIRequestContext, endpoint: string, data: Record<string, string>) =>
  request.post(`${webUrl}/api/auth/${endpoint}`, { data, headers: { origin: webUrl } });

const signUp = (request: APIRequestContext, credentials: Credentials) =>
  authPost(request, "sign-up/email", credentials);

const signIn = (request: APIRequestContext, { email, password }: Omit<Credentials, "name">) =>
  authPost(request, "sign-in/email", { email, password });

const signOut = (request: APIRequestContext) => authPost(request, "sign-out", {});

const test = base.extend<
  { account: OwnedAccount; api: APIRequestContext; createAccount: CreateAccount },
  SessionOptions
>({
  account: async ({ context, createAccount, emailDelivery }, use) => {
    const sinceMs = Date.now();
    await context.clearCookies();
    const account = await createAccount();
    if (emailDelivery) {
      const link = await verificationLink({ sinceMs, subject: /verify/iv, to: account.email });
      await expect(await context.request.get(link)).toBeOK();
    }
    await use(account);
  },
  createAccount: async ({ context }, use, testInfo) => {
    const ownedUserIds = new Set<string>();
    try {
      await use(
        async (
          register = async (credentials) => {
            await expect(await signUp(context.request, credentials)).toBeOK();
          },
        ) => {
          const credentials = {
            email: makeTestEmail(testInfo),
            name: "E2E Account",
            password: "E2eAccountPassword1!",
          };
          let user: { id: string } | null;
          try {
            await register(credentials);
          } finally {
            user = await prisma.user.findUnique({
              select: { id: true },
              where: { email: credentials.email },
            });
            if (user !== null) {
              ownedUserIds.add(user.id);
            }
          }
          if (user === null) {
            throw new Error("The account registration did not create its allocated identity.");
          }
          return { ...credentials, id: user.id };
        },
      );
    } finally {
      await prisma.user.deleteMany({ where: { id: { in: [...ownedUserIds] } } });
    }
  },
  // Session cookies are host-only, so the api on its own host receives the session as a bearer token.
  api: async ({ account, context, playwright }, use) => {
    const cookies = await context.cookies(webUrl);
    const session = cookies.find(({ name }) => name === sessionCookieName);
    if (session === undefined) {
      throw new Error(`The api fixture needs a web session for account ${account.id}.`);
    }
    const api = await playwright.request.newContext({
      baseURL: apiUrl,
      extraHTTPHeaders: { authorization: `Bearer ${decodeURIComponent(session.value)}` },
    });
    await use(api);
    await api.dispose();
  },
  emailDelivery: [false, { option: true, scope: "worker" }],
});

export { sessionCookieName, signIn, signOut, signUp, test };
export type { SessionOptions };
