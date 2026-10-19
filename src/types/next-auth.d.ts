import type { DefaultSession } from 'next-auth';
import type { AuthAccountRole } from '@/lib/auth/accounts';

declare module 'next-auth' {
  interface User {
    id: string;
    name?: string | null;
    role: AuthAccountRole;
    phoneNumber?: string;
    orgId?: string;
    orgName?: string;
    shopId?: string | null;
    shopName?: string | null;
    restaurantStatus?: string;
    accessToken: string;
    subscriptionEndsAt?: string | null;
  }

  interface Session {
    accessToken: string;
    user: {
      id: string;
      role: AuthAccountRole;
      phoneNumber?: string;
      orgId: string;
      orgName: string;
      shopId?: string | null;
      shopName?: string | null;
      avatarUrl?: string;
      restaurantStatus?: string;
      subscriptionEndsAt?: string | null;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: AuthAccountRole;
    phoneNumber?: string;
    orgId: string;
    orgName: string;
    shopId?: string | null;
    shopName?: string | null;
    restaurantStatus?: string;
    accessToken: string;
    subscriptionEndsAt?: string | null;
  }
}