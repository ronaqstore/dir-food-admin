export interface ApiPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages?: number;
}

export interface ApiSuccessResponse<T> {
  data: T;
  meta?: ApiPaginationMeta;
}

export interface ApiErrorDetail {
  code?: string;
  message?: string;
  details?: unknown;
}

export interface ApiErrorBody {
  error?: ApiErrorDetail | string;
  message?: string | string[];
  statusCode?: number;
}

export type ApiResponseBodyError = ApiErrorBody;

export class ApiError extends Error {
  status: number;
  code: string;
  details?: unknown;
  body?: ApiErrorBody;

  constructor(status: number, message: string, body?: ApiErrorBody, code = 'API_ERROR') {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.body = body;
    if (body?.error && typeof body.error === 'object' && 'details' in body.error) {
      this.details = body.error.details;
    }
  }
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export type RestaurantStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED';
export type ManualAvailabilityStatus = 'AUTO' | 'CLOSED' | 'TEMP_UNAVAILABLE';
export type UserRole = 'RESTAURANT_OWNER' | 'PLATFORM_ADMIN';

export interface RestaurantProfileDTO {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  cuisines: string[];
  logoUrl: string | null;
  coverUrl: string | null;
  contactPhone: string | null;
  whatsappNumber: string | null;
  addressText: string | null;
  minOrderAmount: number | null;
  status: RestaurantStatus;
  manualStatus: ManualAvailabilityStatus;
  unavailableNote: string | null;
  trialStartedAt: string | null;
  subscriptionEndsAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PublishReadinessDTO {
  isReadyToPublish: boolean;
  missingPrerequisites: string[];
}

export interface MenuCategoryDTO {
  id: string;
  restaurantId: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MenuItemVariantDTO {
  id: string;
  name: string;
  price: number;
  sortOrder: number;
  isActive: boolean;
}

export interface MenuItemDTO {
  id: string;
  restaurantId: string;
  categoryId: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  basePrice: number | null;
  isAvailable: boolean;
  isActive: boolean;
  sortOrder: number;
  variants: MenuItemVariantDTO[];
  category?: {
    id: string;
    name: string;
  };
}

export interface DeliveryAreaItemDTO {
  areaId: string;
  name: string;
  slug: string;
  isServed: boolean;
  deliveryFee: number | null;
}

export interface TimeRangeDTO {
  openTime: string;
  closeTime: string;
}

export interface DayScheduleDTO {
  dayOfWeek: number;
  ranges: TimeRangeDTO[];
}

export interface OrderIntentItemSnapshotDTO {
  id: string;
  menuItemId: string;
  variantId: string | null;
  itemNameSnapshot: string;
  variantNameSnapshot: string | null;
  unitPriceSnapshot: number;
  quantity: number;
  lineTotal: number;
}

export interface OrderIntentDTO {
  id: string;
  referenceCode: string;
  status: 'WHATSAPP_HANDOFF_READY' | 'WHATSAPP_OPENED';
  customerName: string | null;
  customerPhone: string | null;
  areaNameSnapshot: string;
  landmark: string;
  directions: string | null;
  mapLat: number | null;
  mapLng: number | null;
  subtotalAmount: number;
  deliveryFeeStatus: 'KNOWN' | 'TO_BE_CONFIRMED';
  deliveryFeeAmount: number | null;
  whatsappOpenedAt: string | null;
  expiresAt: string;
  isExpired?: boolean;
  notConfirmed: boolean;
  createdAt: string;
  items?: OrderIntentItemSnapshotDTO[];
}

export interface RestaurantStatsDTO {
  range: '7d' | '30d';
  requestsCreated: number;
  whatsappOpened: number;
  topItems: Array<{
    menuItemId: string;
    name: string;
    requestedQuantity: number;
  }>;
}