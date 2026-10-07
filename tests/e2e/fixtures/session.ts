import { test as base, expect } from "@playwright/test";
import type { APIRequestContext, TestInfo } from "@playwright/test";
import { COOKIE_PREFIX } from "@repo/auth/server";
import { getCookies } from "better-auth/cookies";

import { makeTestEmail } from "../helpers/test-email";
import { apiUrl, webUrl } from "../urls";

import { verificationLink } from "./verification.fixture";

type Credentials = { email: string; name: string; password: string };

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

const signedInUserId = async (request: APIRequestContext): Promise<string | undefined> => {
  const response = await request.get(`${webUrl}/api/auth/get-session`);
  await expect(response).toBeOK();
  const session = (await response.json()) as { user: { id: string } } | null;
  return session?.user.id;
};

const newCredentials = (testInfo: TestInfo): Credentials => ({
  email: makeTestEmail(testInfo),
  name: "E2E Account",
  password: "E2eAccountPassword1!",
});

const test = base.extend<{ account: Credentials; api: APIRequestContext }, SessionOptions>({
  account: async ({ context, emailDelivery }, use, testInfo) => {
    const credentials = newCredentials(testInfo);
    const sinceMs = Date.now();
    await context.clearCookies();
    const signUpResponse = await signUp(context.request, credentials);
    await expect(signUpResponse).toBeOK();
    const { user } = (await signUpResponse.json()) as { user: { id: string } };
    if (emailDelivery) {
      const link = await verificationLink({ sinceMs, subject: /verify/iv, to: credentials.email });
      await expect(await context.request.get(link)).toBeOK();
    }

    await use(credentials);

    // A test that ends signed out of the account has deleted it.
    if ((await signedInUserId(context.request)) === user.id) {
      await expect(await authPost(context.request, "delete-user", {})).toBeOK();
    }
  },
  // Session cookies are host-only, so the api on its own host receives the session as a bearer token.
  api: async ({ context, playwright }, use) => {
    const cookies = await context.cookies(webUrl);
    const session = cookies.find(({ name }) => name === sessionCookieName);
    if (session === undefined) {
      throw new Error("The api fixture needs a context signed in to the web app.");
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

export { newCredentials, sessionCookieName, signIn, signOut, signUp, test };
export type { SessionOptions };
