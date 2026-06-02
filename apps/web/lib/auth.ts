import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { prisma } from "@linkbhejo/db";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";
import { SignJWT } from "jose";

const JWT_SECRET = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? "linkbhejo-secret";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, account, trigger, session }) {
      // Call original jwt callback if exists
      let newToken = token;
      if (authConfig.callbacks?.jwt) {
        newToken = await (authConfig.callbacks.jwt as any)({ token, user, account, trigger, session });
      }

      // Generate a standard JWT for the Fastify API using jose
      if (!newToken.apiToken) {
        const secret = new TextEncoder().encode(JWT_SECRET);
        newToken.apiToken = await new SignJWT({
          sub: newToken.id as string,
          email: newToken.email as string,
          role: newToken.role as string
        })
          .setProtectedHeader({ alg: 'HS256' })
          .setIssuedAt()
          .setExpirationTime('7d')
          .sign(secret);
      }
      return newToken;
    },
    async session({ session, token, user }) {
      // Call original session callback if exists
      let newSession = session;
      if (authConfig.callbacks?.session) {
        newSession = await (authConfig.callbacks.session as any)({ session, token, user });
      }
      // Pass the standard JWT down to the client session
      (newSession as any).accessToken = token.apiToken;
      return newSession;
    }
  },
  providers: [
    // ─────────────────────────────────────
    // Google OAuth
    // ─────────────────────────────────────
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),

    // ─────────────────────────────────────
    // Instagram OAuth via Meta
    // ─────────────────────────────────────
    {
      id: "instagram",
      name: "Instagram",
      type: "oauth",
      authorization: {
        url: "https://api.instagram.com/oauth/authorize",
        params: {
          scope:
            "instagram_basic,instagram_manage_messages,instagram_manage_comments,pages_messaging",
          response_type: "code",
        },
      },
      token: "https://api.instagram.com/oauth/access_token",
      userinfo: {
        url: "https://graph.instagram.com/me",
        params: { fields: "id,username,name,profile_picture_url" },
      },
      clientId: process.env.META_APP_ID,
      clientSecret: process.env.META_APP_SECRET,
      profile(profile) {
        return {
          id: profile.id,
          name: profile.name ?? profile.username,
          email: `${profile.id}@instagram.placeholder`,
          image: profile.profile_picture_url,
          igUsername: profile.username,
        };
      },
    },

    // ─────────────────────────────────────
    // Email + Password (fallback)
    // ─────────────────────────────────────
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        });

        if (!user || !user.passwordHash) return null;

        const valid = await bcrypt.compare(
          parsed.data.password,
          user.passwordHash
        );
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        } as any;
      },
    }),
  ],
});
