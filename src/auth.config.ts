import { NextAuthConfig } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { normalizePhone, isValidPkMobile } from '@/lib/auth/phone';
import type {
  AuthorizeCredentials,
  AuthenticatedUser,
  JwtTokenShape,
  SessionUserShape
} from '@/types/auth';
import { apiRequest } from '@/lib/api/client';
import type { AuthLoginResponse, PlatformAdminLoginResponse } from '@/lib/api/types';

function decodeJwtExp(token: string): number | undefined {
  try {
    const payload = token.split('.')[1];
    if (!payload) return undefined;
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return typeof decoded.exp === 'number' ? decoded.exp * 1000 : undefined;
  } catch {
    return undefined;
  }
}

export const authConfig = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        identifier: {
          label: 'Mobile Number or Email',
          type: 'text',
          placeholder: '03001234567'
        },
        password: {
          label: 'Password',
          type: 'password'
        },
        loginType: {
          label: 'Login Type',
          type: 'text'
        }
      },
      async authorize(rawCredentials) {
        const credentials = rawCredentials as AuthorizeCredentials | undefined;
        const rawIdentifier =
          typeof credentials?.identifier === 'string' ? credentials.identifier.trim() : '';
        const password = typeof credentials?.password === 'string' ? credentials.password : '';
        const loginType =
          typeof credentials?.loginType === 'string' ? credentials.loginType : 'owner';

        if (!rawIdentifier || !password) {
          return null;
        }

        try {
          // 1. Platform Admin Login (Pakistani Mobile Number + Password)
          if (loginType === 'platform-admin') {
            const normalized = normalizePhone(rawIdentifier);
            if (!isValidPkMobile(normalized)) {
              return null;
            }

            const response = await apiRequest<PlatformAdminLoginResponse>(
              '/auth/platform-admin/login',
              {
                method: 'POST',
                body: JSON.stringify({
                  phone: normalized,
                  password
                })
              }
            );

            return {
              id: response.admin.id,
              name: response.admin.name,
              email: '',
              phoneNumber: response.admin.phone,
              role: 'PLATFORM_ADMIN' as const,
              restaurantId: null,
              restaurantName: 'Dir Food Platform',
              restaurantSlug: null,
              restaurantStatus: null,
              subscriptionStatus: null,
              accessToken: response.accessToken
            };
          }

          // 2. Restaurant Owner Login (Pakistani Mobile Number + Password)
          const normalized = normalizePhone(rawIdentifier);
          if (!isValidPkMobile(normalized)) {
            return null;
          }

          const response = await apiRequest<AuthLoginResponse>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({
              phone: normalized,
              password
            })
          });

          return {
            id: response.user.id,
            name: response.user.name,
            email: '',
            phoneNumber: response.user.phone,
            role: 'RESTAURANT_OWNER' as const,
            restaurantId: response.restaurantId,
            restaurantName: response.restaurant.name,
            restaurantSlug: response.restaurant.slug,
            restaurantStatus: response.restaurant.status,
            subscriptionStatus: response.restaurant.subscriptionStatus,
            accessToken: response.accessToken
          };
        } catch {
          return null;
        }
      }
    })
  ],
  pages: {
    signIn: '/login'
  },
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }) {
      const typedToken = token as JwtTokenShape;

      if (user) {
        const authenticatedUser = user as unknown as AuthenticatedUser & {
          accessToken?: string;
        };
        typedToken.sub = authenticatedUser.id;
        typedToken.role = authenticatedUser.role;
        typedToken.phoneNumber = authenticatedUser.phoneNumber;
        typedToken.email = authenticatedUser.email;
        typedToken.restaurantId = authenticatedUser.restaurantId;
        typedToken.restaurantName = authenticatedUser.restaurantName;
        typedToken.restaurantSlug = authenticatedUser.restaurantSlug;
        typedToken.restaurantStatus = authenticatedUser.restaurantStatus;
        typedToken.subscriptionStatus = authenticatedUser.subscriptionStatus;
        typedToken.picture = authenticatedUser.avatarUrl;
        if (authenticatedUser.accessToken) {
          typedToken.accessToken = authenticatedUser.accessToken;
          typedToken.accessTokenExpiresAt = decodeJwtExp(authenticatedUser.accessToken);
        }
      }

      if (typedToken.accessTokenExpiresAt && Date.now() >= typedToken.accessTokenExpiresAt) {
        delete typedToken.accessToken;
      }

      return typedToken;
    },
    async session({ session, token }) {
      const typedToken = token as JwtTokenShape;

      if (session.user) {
        const sessionUser = session.user as SessionUserShape;
        sessionUser.id = typedToken.sub ?? '';
        sessionUser.role = typedToken.role ?? 'RESTAURANT_OWNER';
        sessionUser.phoneNumber = typedToken.phoneNumber ?? '';
        sessionUser.restaurantId = typedToken.restaurantId ?? null;
        sessionUser.restaurantName = typedToken.restaurantName ?? null;
        sessionUser.restaurantSlug = typedToken.restaurantSlug ?? null;
        sessionUser.restaurantStatus = typedToken.restaurantStatus ?? null;
        sessionUser.subscriptionStatus = typedToken.subscriptionStatus ?? null;
        sessionUser.avatarUrl =
          typeof typedToken.picture === 'string' ? typedToken.picture : undefined;
      }

      if (typeof typedToken.accessToken === 'string') {
        session.accessToken = typedToken.accessToken;
      }

      return session;
    }
  }
} satisfies NextAuthConfig;

export default authConfig;
