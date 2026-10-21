import type {
  RestaurantProfileDTO,
  PublishReadinessDTO,
  ManualAvailabilityStatus,
  DayScheduleDTO,
  TimeRangeDTO,
  DeliveryAreaItemDTO
} from '@/lib/api/types';

export type {
  RestaurantProfileDTO,
  PublishReadinessDTO,
  ManualAvailabilityStatus,
  DayScheduleDTO,
  TimeRangeDTO,
  DeliveryAreaItemDTO
};

export interface UpdateRestaurantProfileInput {
  name?: string;
  description?: string;
  cuisines?: string[];
  addressText?: string;
  contactPhone?: string;
  whatsappNumber?: string;
  minOrderAmount?: number; // in paisa
}

export interface UpdateAvailabilityInput {
  manualStatus: ManualAvailabilityStatus;
  unavailableNote?: string;
}

export interface DayHoursInput {
  dayOfWeek: number;
  ranges: Array<{
    openTime: string;
    closeTime: string;
  }>;
}

export interface UpdateHoursInput {
  days: DayHoursInput[];
}

export interface DeliveryAreaUpdateItem {
  areaId: string;
  deliveryFee?: number | null; // in paisa
  minOrderAmount?: number | null; // in paisa
}

export interface UpdateDeliveryAreasInput {
  areas: DeliveryAreaUpdateItem[];
}
