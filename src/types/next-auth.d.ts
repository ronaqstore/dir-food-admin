import type { DefaultSession } from 'next-auth';
import type { AuthAccountRole } from '@/lib/auth/accounts';
import type { RestaurantStatus } from '@/lib/api/types';

declare module 'next-auth' {
  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    phoneNumber?: string;
    role: AuthAccountRole;
    restaurantId: string | null;
    restaurantName: string | null;
    restaurantSlug?: string | null;
    restaurantStatus?: RestaurantStatus | null;
    subscriptionStatus?: 'VALID' | 'EXPIRED' | null;
    accessToken: string;
  }

  interface Session {
    accessToken: string;
    user: {
      id: string;
      role: AuthAccountRole;
      phoneNumber?: string;
      restaurantId: string | null;
      restaurantName: string | null;
      restaurantSlug?: string | null;
      restaurantStatus?: RestaurantStatus | null;
      subscriptionStatus?: 'VALID' | 'EXPIRED' | null;
      avatarUrl?: string;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: AuthAccountRole;
    phoneNumber?: string;
    email?: string;
    restaurantId?: string | null;
    restaurantName?: string | null;
    restaurantSlug?: string | null;
    restaurantStatus?: RestaurantStatus | null;
    subscriptionStatus?: 'VALID' | 'EXPIRED' | null;
    accessToken: string;
  }
}
