import type { AuthAccount, AuthAccountRole } from '@/lib/auth/accounts';
import type { RestaurantStatus } from '@/lib/api/types';
import type { Session } from 'next-auth';
import type { NextRequest } from 'next/server';

export type SessionRole = AuthAccountRole;

export interface AuthorizeCredentials {
  identifier?: string;
  password?: string;
  loginType?: 'owner' | 'platform-admin';
}

export type AuthenticatedUser = AuthAccount;

export interface JwtTokenShape {
  sub?: string;
  role?: AuthAccountRole;
  phoneNumber?: string;
  email?: string;
  restaurantId?: string | null;
  restaurantName?: string | null;
  restaurantSlug?: string | null;
  restaurantStatus?: RestaurantStatus | null;
  subscriptionStatus?: 'VALID' | 'EXPIRED' | null;
  picture?: string;
  accessToken?: string;
  accessTokenExpiresAt?: number;
  [key: string]: unknown;
}

export type SessionUserShape = NonNullable<Session['user']> & {
  id: string;
  name: string;
  role: AuthAccountRole;
  phoneNumber?: string;
  email?: string;
  restaurantId: string | null;
  restaurantName: string | null;
  restaurantSlug?: string | null;
  restaurantStatus?: RestaurantStatus | null;
  subscriptionStatus?: 'VALID' | 'EXPIRED' | null;
  avatarUrl?: string;
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

export interface LoginValues {
  phone: string;
  password: string;
}

export interface BaseLoginFormProps {
  title: string;
  description: string;
  minPasswordLength?: number;
  onSubmit: (values: LoginValues) => Promise<string | null>;
  footer?: React.ReactNode;
}

export interface SetupPasswordValues {
  password: string;
  confirmPassword: string;
}