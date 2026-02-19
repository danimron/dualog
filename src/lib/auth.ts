import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { db } from "./db"
import * as schema from "../db/schema"

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    minPasswordLength: 8,
    sendResetPassword: async ({ user, url }: { user: any; url: string }) => {
      // TODO: Implement email sending for password reset
    },
    sendVerificationEmail: async ({ user, url }: { user: any; url: string }) => {
      // TODO: Implement email sending for verification
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  advanced: {
    cookiePrefix: "dualog",
    crossSubDomainCookies: {
      enabled: false,
    },
    useSecureCookies: false, // Allow non-HTTPS cookies for development
  },
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3002",
  trustedOrigins: ["http://localhost:3002", "http://localhost:3000"],
})
