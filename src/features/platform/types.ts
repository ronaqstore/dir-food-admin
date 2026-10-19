export type PlatformRestaurantStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED';

export interface PlatformOwnerUser {
  id: string;
  name: string;
  phone: string;
  role: string;
  status: string;
}

export interface PlatformRestaurantCounts {
  items: number;
  deliveryAreas: number;
  hours: number;
}

export interface PlatformRestaurant {
  id: string;
  name: string;
  slug: string;
  contactPhone: string;
  whatsappNumber: string | null;
  addressText: string | null;
  cuisines: string[];
  minOrderAmount: number | string | null;
  status: PlatformRestaurantStatus;
  statusReason: string | null;
  statusChangedAt: string | null;
  trialStartedAt: string | null;
  subscriptionEndsAt: string | null;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
  users?: PlatformOwnerUser[];
  _count?: PlatformRestaurantCounts;
}

export interface PlatformRestaurantOperatingHour {
  id?: string;
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

export interface PlatformRestaurantDeliveryArea {
  id: string;
  areaId: string;
  deliveryFee: number | string;
  isActive: boolean;
  area: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface PlatformRestaurantDetail extends PlatformRestaurant {
  hours: PlatformRestaurantOperatingHour[];
  deliveryAreas: PlatformRestaurantDeliveryArea[];
  completeness: {
    isReadyForApproval: boolean;
    missingPrerequisites: string[];
  };
}

export interface CreateRestaurantOwnerInput {
  name: string;
  phone: string;
}

export interface CreateRestaurantInput {
  name: string;
  contactPhone: string;
  whatsappNumber?: string;
  addressText?: string;
  cuisines?: string[];
  minOrderAmount?: number;
  owner: CreateRestaurantOwnerInput;
}

export interface CreateRestaurantResponse {
  restaurant: PlatformRestaurant;
  user: PlatformOwnerUser;
  setupLink: string;
}

export interface UpdateRestaurantStatusInput {
  status: PlatformRestaurantStatus;
  reason?: string;
}

export interface ExtendSubscriptionInput {
  addDays?: number;
  subscriptionEndsAt?: string;
}

export interface QueryRestaurantsFilter {
  page?: number;
  limit?: number;
  q?: string;
  status?: PlatformRestaurantStatus | 'ALL';
}

export interface PaginatedRestaurantsResponse {
  data: PlatformRestaurant[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
