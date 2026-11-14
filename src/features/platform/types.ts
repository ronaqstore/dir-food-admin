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
  cityId?: string | null;
  city?: { id: string; name: string; slug: string } | null;
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
  cityId?: string;
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
  subStatus?: string;
  cityId?: string;
  sort?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedRestaurantsResponse {
  data: PlatformRestaurant[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    subCounts?: {
      active: number;
      expiring: number;
      expired: number;
      trial: number;
    };
  };
}

export interface QueryAreasFilter {
  page?: number;
  limit?: number;
  q?: string;
  cityId?: string;
  needsReview?: boolean;
  sort?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedAreasResponse {
  data: MasterArea[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PlatformCity {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
  areasCount?: number;
  restaurantsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCityInput {
  name: string;
  slug?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface MasterArea {
  id: string;
  cityId?: string;
  cityName?: string;
  citySlug?: string;
  name: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
  isCustomCreated?: boolean;
  isVerified?: boolean;
  activeRestaurantsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApproveAreaInput {
  name?: string;
  slug?: string;
}

export interface CreateAreaInput {
  cityId?: string;
  name: string;
  slug?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateAreaInput {
  cityId?: string;
  name?: string;
  slug?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateRestaurantStatusPayload {
  id: string;
  input: UpdateRestaurantStatusInput;
}

export interface ExtendSubscriptionPayload {
  id: string;
  input: ExtendSubscriptionInput;
}

export interface IssueSetupLinkResponse {
  setupLink?: string;
  setupUrl?: string;
  userId?: string;
  userName?: string;
  userPhone?: string;
}

export interface UpdateMasterAreaPayload {
  id: string;
  input: UpdateAreaInput;
}

export interface MutationSuccessResponse {
  success: boolean;
  message: string;
}

export interface ApproveMasterAreaPayload {
  id: string;
  input?: ApproveAreaInput;
}

export interface MergeMasterAreaPayload {
  sourceAreaId: string;
  targetAreaId: string;
}

export interface PlatformActivitySummary {
  totalRestaurants: number;
  pendingCount: number;
  activeCount: number;
  suspendedCount: number;
  deactivatedCount: number;
  intentsCreated: number;
  intentsWhatsappOpened: number;
}

export interface ApproveAreaDialogProps {
  area: MasterArea | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface CreateRestaurantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface ExtendSubscriptionDialogProps {
  restaurantId: string | null;
  restaurantName: string;
  currentExpiry?: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface MasterAreaDialogProps {
  area?: MasterArea | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultCityId?: string;
}

export interface MergeAreaDialogProps {
  sourceArea: MasterArea | null;
  allAreas: MasterArea[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface ReviewApprovalDialogProps {
  restaurantId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface StatusChangeDialogProps {
  restaurantId: string | null;
  restaurantName: string;
  targetStatus: PlatformRestaurantStatus | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface AnalyzedRestaurant extends PlatformRestaurant {
  subStatus: 'NEVER' | 'ACTIVE' | 'EXPIRING' | 'EXPIRED';
  daysLeft: number;
  isTrial: boolean;
}

export interface RestaurantSubscriptionTarget {
  id: string;
  name: string;
  subscriptionEndsAt?: string | null;
}

export interface RestaurantStatusTarget {
  id: string;
  name: string;
  status: PlatformRestaurantStatus;
}

export interface IssuedSetupLinkData {
  restaurantName: string;
  setupUrl: string;
  ownerPhone?: string;
  ownerName?: string;
}

export interface AddDistrictDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (cityId: string) => void;
}

export interface PlatformDistrictsBarProps {
  cities: PlatformCity[];
  allAreas: MasterArea[];
  selectedCityId: string;
  onSelectCityId: (cityId: string) => void;
  totalAllAreas: number;
  filterNeedsReview: boolean;
  onToggleNeedsReview: () => void;
  totalNeedsReview: number;
}

export interface PlatformAreasMetricsProps {
  totalAreas: number;
  selectedCityName?: string;
  activeAreas: number;
  totalCoverageLinks: number;
  t: (key: string) => string;
}

export interface IssuedSetupLinkDialogProps {
  data: IssuedSetupLinkData | null;
  onClose: () => void;
  onCopy: () => void;
  t: (key: string) => string;
}

export interface PlatformRestaurantsMetricsProps {
  totalCount: number;
  pendingCount: number;
  activeCount: number;
  suspendedCount: number;
  t: (key: string) => string;
}

import type { useTranslations } from 'next-intl';

export type PlatformTranslator = ReturnType<typeof useTranslations>;

export interface UseRestaurantColumnsOptions {
  currentTimestamp: number | null;
  onReview: (restaurant: PlatformRestaurant) => void;
  onExtend: (restaurant: PlatformRestaurant) => void;
  onIssueLink: (restaurant: PlatformRestaurant) => void;
  onChangeStatus: (restaurant: PlatformRestaurant, status: PlatformRestaurantStatus) => void;
  isIssueLinkPending: boolean;
  t: PlatformTranslator;
}
