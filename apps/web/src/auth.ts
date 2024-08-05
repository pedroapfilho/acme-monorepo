import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";

const credentialsSchema = z.object({
  id: z.string(),
  password: z.string(),
});

const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
});

const MAX_AGE = 4 * 60 * 60; // 4 hours

const { handlers, signIn, signOut, auth } = NextAuth({
  debug: true,
  session: {
    strategy: "jwt",
    maxAge: MAX_AGE,
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        id: { label: "Identifier" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsedCredentials = credentialsSchema.parse(credentials);

        const tokenResponse = await fetch(`${process.env.API_URL}/auth/login`, {
          method: "POST",
          body: JSON.stringify(parsedCredentials),
          headers: { "Content-Type": "application/json" },
        });

        if (!tokenResponse.ok) {
          throw new Error("Failed to log in");
        }

        const token = await tokenResponse.text();

        const userResponse = await fetch(`${process.env.API_URL}/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!userResponse.ok) {
          throw new Error("Failed to retrieve user information");
        }

        const user = await userResponse.json();

        const parsedUser = userSchema.parse(user);

        return { ...parsedUser, accessToken: token };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, user, trigger, session }) {
      if (account) token.accessToken = account.access_token;

      if (trigger === "update") {
        return { ...token, ...session.user };
      }

      return { ...token, ...user, ...account };
    },
    async session({ session, token }) {
      if (token.accessToken) session.accessToken = token.accessToken;

      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});

export { handlers, signIn, signOut, auth };
