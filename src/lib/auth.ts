import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { hashPasswordFunction, verifyPasswordFunction } from "./argon2";
import prisma from "./database/dbClient";
import { serverEnv } from "./env/serverEnv";

export const auth = betterAuth({
  secret: serverEnv.BETTER_AUTH_SECRET,
  baseURL: serverEnv.BETTER_AUTH_URL,
  trustedOrigins:
    serverEnv.BETTER_AUTH_ALLOWED_ORIGINS?.split(",").filter(Boolean) ??
    undefined,

  database: prismaAdapter(prisma, {
    provider: "sqlite",
  }),

  plugins: [nextCookies()],

  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: false,
    sendResetPassword: async ({ user, url }) => {
      console.log("Password reset email", { user, url });
    },
    password: {
      hash: hashPasswordFunction,
      verify: verifyPasswordFunction,
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },

  advanced: {
    cookiePrefix: "cit",
    useSecureCookies: process.env.NODE_ENV === "production",
    database: {
      generateId: false,
    },
  },

  rateLimit: {
    window: 60,
    max: 25,
    customRules: {
      "/sign-in/*": {
        window: 300,
        max: 10,
      },
      "/sign-up/*": {
        window: 600,
        max: 5,
      },
      "/reset-password/*": {
        window: 900,
        max: 3,
      },
      "/get-session": {
        window: 60,
        max: 60,
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session;
