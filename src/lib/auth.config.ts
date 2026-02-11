import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";

/**
 * Edge-compatible auth configuration.
 * This file must NOT import Prisma or any Node.js-only modules.
 * Used by middleware for session checks.
 */
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    // Credentials provider needs authorize() which uses Prisma,
    // so it's only fully configured in auth.ts (server-side).
    // Here we just declare it so the middleware knows it exists.
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as Record<string, unknown>).role;
        token.vendorProfileId = (user as Record<string, unknown>).vendorProfileId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        (session.user as unknown as Record<string, unknown>).role = token.role;
        (session.user as unknown as Record<string, unknown>).vendorProfileId = token.vendorProfileId;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");

      if (isOnDashboard) {
        return isLoggedIn; // Redirect to login if not authenticated
      }
      return true;
    },
  },
  session: { strategy: "jwt" },
} satisfies NextAuthConfig;
