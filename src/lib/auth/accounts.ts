export type AuthAccountRole = 'OWNER' | 'STAFF' | 'SUPER_ADMIN';

export interface AuthAccount {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  role: AuthAccountRole;
  orgId: string;
  orgName: string;
  avatarUrl?: string;
  restaurantStatus?: string;
  subscriptionEndsAt?: string | null;
}