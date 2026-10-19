import type { NextAuthConfig } from 'next-auth';
import type { AuthAccountRole } from '@/lib/auth/accounts';
import type { JwtTokenShape, SessionUserShape } from '@/types/auth';

function decodeJwtExp(token: string): number | undefined {
  try {
    const payload = token.split('.')[1];
    if (!payload) return undefined;
    const decoded = JSON.parse(
      Buffer.from(payload, 'base64url').toString('utf8')
    );
    return typeof decoded.exp === 'number' ? decoded.exp * 1000 : undefined;
  } catch {
    return undefined;
  }
}

export const authConfig = {
  pages: {
    signIn: '/auth/sign-in'
  },
  providers: [],
  session: {
    strategy: 'jwt'
  },
  trustHost: true,
  callbacks: {
    async jwt({ token, user }) {
      const typedToken = token as JwtTokenShape;

      if (user) {
        typedToken.sub = user.id;
        typedToken.role = user.role;
        typedToken.phoneNumber = user.phoneNumber;
        typedToken.orgId = user.orgId;
        typedToken.orgName = user.orgName;
        typedToken.shopId = user.shopId ?? user.orgId;
        typedToken.shopName = user.shopName ?? user.orgName;
        typedToken.restaurantStatus = user.restaurantStatus;
        typedToken.subscriptionEndsAt = user.subscriptionEndsAt;
        if (user.accessToken) {
          typedToken.accessToken = user.accessToken;
          typedToken.accessTokenExpiresAt = decodeJwtExp(user.accessToken);
        }
      }

      if (
        typedToken.accessTokenExpiresAt &&
        Date.now() >= typedToken.accessTokenExpiresAt
      ) {
        delete typedToken.accessToken;
      }

      return typedToken;
    },

    async session({ session, token }) {
      const typedToken = token as JwtTokenShape;

      if (session.user) {
        const sessionUser = session.user as SessionUserShape;
        sessionUser.id = typedToken.sub ?? '';
        sessionUser.role = (typedToken.role as AuthAccountRole) ?? 'OWNER';
        sessionUser.phoneNumber = typedToken.phoneNumber ?? '';
        sessionUser.orgId = typedToken.orgId ?? '';
        sessionUser.orgName = typedToken.orgName ?? '';
        sessionUser.shopId =
          (typedToken.shopId as string | null | undefined) ?? null;
        sessionUser.shopName =
          (typedToken.shopName as string | null | undefined) ?? null;
        sessionUser.avatarUrl =
          typeof typedToken.picture === 'string'
            ? typedToken.picture
            : undefined;
        sessionUser.restaurantStatus = typedToken.restaurantStatus;
        sessionUser.subscriptionEndsAt = typedToken.subscriptionEndsAt ?? null;
      }

      if (typeof typedToken.accessToken === 'string') {
        session.accessToken = typedToken.accessToken;
      }

      return session;
    },

    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isLoggedIn = !!auth?.user;
      const isDashboard =
        pathname.startsWith('/dashboard') ||
        /\/(en|ur|ps)\/dashboard/.test(pathname);
      const isAuthApi = pathname.startsWith('/api/auth');

      if (isAuthApi) return true;
      if (isDashboard) return isLoggedIn;
      return true;
    }
  }
} satisfies NextAuthConfig;

export default authConfig;