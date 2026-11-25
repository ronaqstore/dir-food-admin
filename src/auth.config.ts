import { NextAuthConfig } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { normalizePhone, isValidPkMobile } from '@/lib/auth/phone';
import type {
  AuthorizeCredentials,
  AuthenticatedUser,
  BackendMeProfile,
  JwtTokenShape,
  SessionUserShape
} from '@/types/auth';
import { apiRequest } from '@/lib/api/client';
import {
  invalidateVerificationCache,
  verifyAccessTokenWithBackend
} from '@/lib/auth/verify-session';
import type { AuthLoginResponse, PlatformAdminLoginResponse } from '@/lib/api/types';

function computeSubscriptionStatus(
  subscriptionEndsAt?: string | null
): 'VALID' | 'EXPIRED' | null {
  if (!subscriptionEndsAt) return 'EXPIRED';
  const endsAtMs = new Date(subscriptionEndsAt).getTime();
  if (!Number.isFinite(endsAtMs)) return 'EXPIRED';
  return endsAtMs > Date.now() ? 'VALID' : 'EXPIRED';
}

function applyProfileToToken(typedToken: JwtTokenShape, profile: BackendMeProfile): void {
  typedToken.sub = profile.id;
  typedToken.name = profile.name;
  typedToken.phoneNumber = profile.phone;
  typedToken.role = profile.role;

  if (profile.role === 'PLATFORM_ADMIN') {
    typedToken.restaurantId = null;
    typedToken.restaurantName = 'Dir Food Platform';
    typedToken.restaurantSlug = null;
    typedToken.restaurantStatus = null;
    typedToken.subscriptionStatus = null;
    typedToken.subscriptionEndsAt = null;
    return;
  }

  if (profile.restaurant) {
    typedToken.restaurantId = profile.restaurant.id;
    typedToken.restaurantName = profile.restaurant.name;
    typedToken.restaurantSlug = profile.restaurant.slug;
    typedToken.restaurantStatus = profile.restaurant.status;
    typedToken.subscriptionEndsAt = profile.restaurant.subscriptionEndsAt ?? null;
    typedToken.subscriptionStatus = computeSubscriptionStatus(
      profile.restaurant.subscriptionEndsAt
    );
  }
}

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
        },
        rememberMe: {
          label: 'Remember Me',
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
        const rememberMe = credentials?.rememberMe === 'true' || credentials?.rememberMe === true;

        if (!rawIdentifier || !password) {
          return null;
        }

        try {
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
                  password,
                  rememberMe
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

          const normalized = normalizePhone(rawIdentifier);
          if (!isValidPkMobile(normalized)) {
            return null;
          }

          const response = await apiRequest<AuthLoginResponse>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({
              phone: normalized,
              password,
              rememberMe
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
            subscriptionEndsAt: response.restaurant.subscriptionEndsAt ?? null,
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
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      const typedToken = token as JwtTokenShape;

      if (user) {
        const authenticatedUser = user as (AuthenticatedUser & {
          accessToken?: string;
        });
        typedToken.sub = authenticatedUser.id;
        typedToken.role = authenticatedUser.role;
        typedToken.phoneNumber = authenticatedUser.phoneNumber;
        typedToken.email = authenticatedUser.email;
        typedToken.restaurantId = authenticatedUser.restaurantId;
        typedToken.restaurantName = authenticatedUser.restaurantName;
        typedToken.restaurantSlug = authenticatedUser.restaurantSlug;
        typedToken.restaurantStatus = authenticatedUser.restaurantStatus;
        typedToken.subscriptionStatus = authenticatedUser.subscriptionStatus;
        typedToken.subscriptionEndsAt = authenticatedUser.subscriptionEndsAt;
        typedToken.picture = authenticatedUser.avatarUrl;
        if (authenticatedUser.accessToken) {
          typedToken.accessToken = authenticatedUser.accessToken;
          typedToken.accessTokenExpiresAt = decodeJwtExp(authenticatedUser.accessToken);
          invalidateVerificationCache(authenticatedUser.accessToken);
        }
        return typedToken;
      }

      if (
        !typedToken.accessToken ||
        !typedToken.sub ||
        (typedToken.accessTokenExpiresAt && Date.now() >= typedToken.accessTokenExpiresAt)
      ) {
        if (typedToken.accessToken) {
          invalidateVerificationCache(typedToken.accessToken);
        }
        return null;
      }

      const verification = await verifyAccessTokenWithBackend(
        typedToken.accessToken,
        trigger === 'update'
      );

      if (verification.status === 'invalid') {
        return null;
      }

      if (verification.status === 'valid') {
        applyProfileToToken(typedToken, verification.profile);
      }

      return typedToken;
    },
    async session({ session, token }) {
      const typedToken = token as JwtTokenShape;

      if (
        !typedToken.accessToken ||
        (typedToken.accessTokenExpiresAt && Date.now() >= typedToken.accessTokenExpiresAt)
      ) {
        return {
          ...session,
          user: undefined,
          accessToken: undefined,
          expires: new Date(0).toISOString()
        };
      }

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
        sessionUser.subscriptionEndsAt = typedToken.subscriptionEndsAt ?? null;
        sessionUser.avatarUrl =
          typeof typedToken.picture === 'string' ? typedToken.picture : undefined;
      }

      session.accessToken = typedToken.accessToken;

      return session;
    }
  }
} satisfies NextAuthConfig;
