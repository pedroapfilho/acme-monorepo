import CredentialsProvider from "next-auth/providers/credentials";
import NextAuth from "next-auth";
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

const handler = NextAuth({
  debug: true,
  session: {
    strategy: "jwt",
    maxAge: 4 * 60 * 60,
  },
  providers: [
    CredentialsProvider({
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
          return null;
        }

        const token = await tokenResponse.text();

        const userResponse = await fetch(`${process.env.API_URL}/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!userResponse.ok) {
          return null;
        }

        const user = await userResponse.json();

        const parsedUser = userSchema.parse(user);

        return { ...parsedUser, accessToken: token };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) token.accessToken = account.access_token;

      return token;
    },
    async session({ session }) {
      return { ...session };
    },
  },
  pages: {
    signIn: "/login",
  },
});

export { handler as GET, handler as POST };
