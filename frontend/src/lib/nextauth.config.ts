import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getAccessTokenExpiry } from "@/lib/jwt-utils";
import { loginAPI, refreshAccessToken } from "@/services/auth/mutation";

/**
 * NextAuth configuration.
 *
 * Email login: authorize() → Nest POST /auth/login
 */
export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/auth/login",
  },

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const data = await loginAPI({
            email: credentials.email,
            password: credentials.password,
          });

          return {
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
          };
        } catch {
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.accessTokenExpires = getAccessTokenExpiry(user.accessToken);
        return token;
      }

      if (token.error === "RefreshAccessTokenError") {
        return token;
      }

      if (Date.now() < (token.accessTokenExpires ?? 0)) {
        return token;
      }

      return refreshAccessToken(token);
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }

      session.accessToken = token.accessToken as string;
      session.error = token.error;

      return session;
    },
  },
};
