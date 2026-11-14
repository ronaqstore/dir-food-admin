import type {
  RestaurantProfileDTO,
  PublishReadinessDTO,
  ManualAvailabilityStatus,
  DayScheduleDTO,
  DeliveryAreaItemDTO
} from '@/lib/api/types';

export type {
  RestaurantProfileDTO,
  PublishReadinessDTO,
  ManualAvailabilityStatus,
  DayScheduleDTO,
  DeliveryAreaItemDTO
};

export interface UpdateRestaurantProfileInput {
  name?: string;
  description?: string;
  cuisines?: string[];
  addressText?: string;
  contactPhone?: string;
  whatsappNumber?: string;
  minOrderAmount?: number;
  cityId?: string;
}

export interface UpdateAvailabilityInput {
  manualStatus: ManualAvailabilityStatus;
  unavailableNote?: string;
}

export interface TimeRangeInput {
  openTime: string;
  closeTime: string;
}

export interface DayHoursInput {
  dayOfWeek: number;
  ranges: TimeRangeInput[];
}

export interface UpdateHoursInput {
  days: DayHoursInput[];
}

export interface DeliveryAreaUpdateItem {
  areaId: string;
  deliveryFee?: number | null;
  minOrderAmount?: number | null;
}

export interface UpdateDeliveryAreasInput {
  areas: DeliveryAreaUpdateItem[];
}

export interface RestaurantProfileQueryOptions {
  enabled?: boolean;
}

export type RestaurantImageKind = 'logo' | 'cover';

export interface UploadRestaurantImagePayload {
  kind: RestaurantImageKind;
  file: File;
}

export interface QuickAddAreaInput {
  name: string;
  deliveryFee?: number | null;
  minOrderAmount?: number | null;
}

export interface MasterCityOption {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
}

export interface AreaRowState {
  areaId: string;
  name: string;
  slug: string;
  isServed: boolean;
  feeInput: string;
  minOrderInput: string;
  isVerified?: boolean;
}

export interface ProfileMediaSectionProps {
  logoUrl?: string | null;
  coverUrl?: string | null;
  isPending: boolean;
  onUploadImage: (e: React.ChangeEvent<HTMLInputElement>, kind: RestaurantImageKind) => void;
  onDeleteImage: (kind: RestaurantImageKind) => void;
  t: (key: string) => string;
}

export interface DayScheduleRow {
  dayOfWeek: number;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}
