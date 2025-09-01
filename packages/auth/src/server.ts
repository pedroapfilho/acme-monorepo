import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { bearer, username } from "better-auth/plugins";
import type { PrismaClient } from "@repo/db";

export const createAuth = (prisma: PrismaClient) => {
  return betterAuth({
    database: prismaAdapter(prisma, {
      provider: "postgresql",
    }),
    
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: process.env.NODE_ENV === "production",
      minPasswordLength: 8,
      maxPasswordLength: 128,
    },
    
    plugins: [
      username(),      // Enables username login
      bearer(),        // Enables bearer token auth
    ],
    
    session: {
      expiresIn: 60 * 60 * 24 * 7, // 7 days
      updateAge: 60 * 60 * 24,     // Update if older than 1 day
      cookieName: "acme-session",
      cookieOptions: {
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
      },
    },
    
    // Custom user fields
    user: {
      additionalFields: {
        displayName: { 
          type: "string", 
          required: false,
          defaultValue: null
        },
      },
    },
    
    rateLimit: {
      enabled: true,
      window: 60,  // 1 minute
      max: 10,     // 10 requests per minute
    },
    
    secret: process.env.BETTER_AUTH_SECRET!,
    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3001",
    trustedOrigins: process.env.TRUSTED_ORIGINS?.split(",") || [
      "http://localhost:3000", // Web app
      "http://localhost:3001", // API
    ],
  });
};

export type Auth = ReturnType<typeof createAuth>;