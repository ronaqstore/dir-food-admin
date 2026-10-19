import type { RestaurantStatus, UserRole } from '@/lib/api/types';

export type AuthAccountRole = UserRole; // 'RESTAURANT_OWNER' | 'PLATFORM_ADMIN'

export interface AuthAccount {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  role: AuthAccountRole;
  restaurantId: string | null;
  restaurantName: string | null;
  restaurantSlug?: string | null;
  restaurantStatus?: RestaurantStatus | null;
  subscriptionStatus?: 'VALID' | 'EXPIRED' | null;
  avatarUrl?: string;
}