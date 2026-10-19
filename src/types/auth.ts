import type { AuthAccount, AuthAccountRole } from '@/lib/auth/accounts';
import type { Session } from 'next-auth';
import type { NextRequest } from 'next/server';

export interface AuthorizeCredentials {
  phone?: string;
  identifier?: string;
  password?: string;
  isPlatformAdmin?: string | boolean;
  loginType?: string;
}

export interface LoginResult {
  id: string;
  name: string;
  phoneNumber: string;
  role: AuthAccountRole;
  orgId: string;
  orgName: string;
  shopId: string | null;
  shopName: string | null;
  restaurantStatus?: string;
  accessToken: string;
  subscriptionEndsAt: string | null;
}

export type AuthenticatedUser = AuthAccount;

export interface JwtTokenShape {
  sub?: string;
  role?: AuthAccountRole;
  phoneNumber?: string;
  orgId?: string;
  orgName?: string;
  picture?: string;
  accessToken?: string;
  accessTokenExpiresAt?: number;
  restaurantStatus?: string;
  subscriptionEndsAt?: string | null;
  [key: string]: unknown;
}

export type SessionUserShape = NonNullable<Session['user']> & {
  id?: string;
  role?: AuthAccountRole;
  phoneNumber?: string;
  orgId?: string;
  orgName?: string;
  avatarUrl?: string;
  restaurantStatus?: string;
  subscriptionEndsAt?: string | null;
};

export type AuthenticatedNextRequest = NextRequest & {
  auth?: Session | null;
};

export interface SignInFormValues {
  identifier: string;
  password: string;
}

export interface SignInSearchParams {
  callbackUrl?: string;
  error?: string;
}