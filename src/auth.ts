import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { z } from 'zod';
import { authConfig } from './auth.config';
import { normalizePhone, isValidPkMobile } from '@/lib/auth/phone';
import type { LoginResult } from '@/types/auth';
import { apiRequest } from '@/lib/api/client';
import type {
  AuthLoginResponse,
  PlatformAdminLoginResponse
} from '@/lib/api/types';

async function tryOwnerLogin(
  phone: string,
  password: string
): Promise<LoginResult | null> {
  try {
    const data = await apiRequest<AuthLoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ phone, password })
    });

    if (!data?.accessToken || !data.user) {
      return null;
    }

    return {
      id: data.user.id,
      name: data.user.name,
      phoneNumber: data.user.phone,
      role: 'OWNER',
      orgId: data.restaurantId ?? '',
      orgName: data.restaurant?.name ?? '',
      shopId: data.restaurantId ?? null,
      shopName: data.restaurant?.name ?? null,
      restaurantStatus: data.restaurant?.status,
      accessToken: data.accessToken,
      subscriptionEndsAt: data.restaurant?.subscriptionEndsAt ?? null
    };
  } catch {
    return null;
  }
}

async function tryPlatformAdminLogin(
  phone: string,
  password: string
): Promise<LoginResult | null> {
  try {
    const data = await apiRequest<PlatformAdminLoginResponse>(
      '/auth/platform-admin/login',
      {
        method: 'POST',
        body: JSON.stringify({ phone, password })
      }
    );

    if (!data?.accessToken || !data.admin) {
      return null;
    }

    return {
      id: data.admin.id,
      name: data.admin.name,
      phoneNumber: data.admin.phone,
      role: 'SUPER_ADMIN',
      orgId: 'platform',
      orgName: 'Dir Food Platform',
      shopId: null,
      shopName: null,
      restaurantStatus: undefined,
      accessToken: data.accessToken,
      subscriptionEndsAt: null
    };
  } catch {
    return null;
  }
}

const credentialsSchema = z.object({
  phone: z.string().optional(),
  identifier: z.string().optional(),
  password: z.string().min(1),
  isPlatformAdmin: z
    .union([z.boolean(), z.enum(['true', 'false'])])
    .optional(),
  loginType: z.string().optional()
});

export const {
  handlers,
  auth,
  signIn,
  signOut
} = NextAuth({
  ...authConfig,
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        phone: { label: 'Phone', type: 'tel' },
        identifier: { label: 'Phone', type: 'tel' },
        password: { label: 'Password', type: 'password' },
        isPlatformAdmin: { label: 'Is Platform Admin', type: 'hidden' },
        loginType: { label: 'Login Type', type: 'hidden' }
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) {
          return null;
        }

        const rawPhone = parsed.data.phone || parsed.data.identifier || '';
        if (!rawPhone) {
          return null;
        }

        const normalizedPhone = normalizePhone(rawPhone);
        if (!isValidPkMobile(normalizedPhone)) {
          return null;
        }

        const { password } = parsed.data;
        const isPlatformAdmin =
          parsed.data.isPlatformAdmin === true ||
          parsed.data.isPlatformAdmin === 'true' ||
          parsed.data.loginType === 'platform-admin';

        // 1. If explicit platform admin request
        if (isPlatformAdmin) {
          return await tryPlatformAdminLogin(normalizedPhone, password);
        }

        // 2. Try owner login first
        const ownerResult = await tryOwnerLogin(normalizedPhone, password);
        if (ownerResult) {
          return ownerResult;
        }

        // 3. Fallback: Try platform admin login
        return await tryPlatformAdminLogin(normalizedPhone, password);
      }
    })
  ]
});

export default auth;