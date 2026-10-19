import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appFetch } from '@/lib/api/app-fetch';
import type {
  RestaurantProfileDTO,
  PublishReadinessDTO,
  UpdateRestaurantProfileInput,
  UpdateAvailabilityInput,
  DayScheduleDTO,
  UpdateHoursInput,
  DeliveryAreaItemDTO,
  UpdateDeliveryAreasInput
} from '../types';

export const RESTAURANT_PROFILE_KEY = ['restaurant-profile'] as const;
export const RESTAURANT_READINESS_KEY = ['restaurant-readiness'] as const;
export const RESTAURANT_HOURS_KEY = ['restaurant-hours'] as const;
export const RESTAURANT_AREAS_KEY = ['restaurant-delivery-areas'] as const;

export function useRestaurantProfile() {
  return useQuery({
    queryKey: RESTAURANT_PROFILE_KEY,
    queryFn: () => appFetch<RestaurantProfileDTO>('/api/restaurant')
  });
}

export function usePublishReadiness() {
  return useQuery({
    queryKey: RESTAURANT_READINESS_KEY,
    queryFn: () => appFetch<PublishReadinessDTO>('/api/restaurant/readiness')
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateRestaurantProfileInput) =>
      appFetch<RestaurantProfileDTO>('/api/restaurant', {
        method: 'PATCH',
        body: JSON.stringify(input)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RESTAURANT_PROFILE_KEY });
      queryClient.invalidateQueries({ queryKey: RESTAURANT_READINESS_KEY });
    }
  });
}

export function useUpdateAvailability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateAvailabilityInput) =>
      appFetch<RestaurantProfileDTO>('/api/restaurant/availability', {
        method: 'PUT',
        body: JSON.stringify(input)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RESTAURANT_PROFILE_KEY });
    }
  });
}

export function useUploadRestaurantImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ kind, file }: { kind: 'logo' | 'cover'; file: File }) => {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`/api/restaurant/images/${kind}`, {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        const error = await res.json().catch(() => null);
        throw new Error(error?.message || `Failed to upload ${kind}`);
      }

      return res.json() as Promise<RestaurantProfileDTO>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RESTAURANT_PROFILE_KEY });
      queryClient.invalidateQueries({ queryKey: RESTAURANT_READINESS_KEY });
    }
  });
}

export function useDeleteRestaurantImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (kind: 'logo' | 'cover') =>
      appFetch<RestaurantProfileDTO>(`/api/restaurant/images/${kind}`, {
        method: 'DELETE'
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RESTAURANT_PROFILE_KEY });
    }
  });
}

export function usePublishRestaurant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      appFetch<RestaurantProfileDTO>('/api/restaurant/publish', {
        method: 'POST'
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RESTAURANT_PROFILE_KEY });
      queryClient.invalidateQueries({ queryKey: RESTAURANT_READINESS_KEY });
    }
  });
}

export function useOperatingHours() {
  return useQuery({
    queryKey: RESTAURANT_HOURS_KEY,
    queryFn: () => appFetch<DayScheduleDTO[]>('/api/restaurant/hours')
  });
}

export function useUpdateOperatingHours() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateHoursInput) =>
      appFetch<DayScheduleDTO[]>('/api/restaurant/hours', {
        method: 'PUT',
        body: JSON.stringify(input)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RESTAURANT_HOURS_KEY });
      queryClient.invalidateQueries({ queryKey: RESTAURANT_READINESS_KEY });
    }
  });
}

export function useDeliveryAreas() {
  return useQuery({
    queryKey: RESTAURANT_AREAS_KEY,
    queryFn: () => appFetch<DeliveryAreaItemDTO[]>('/api/restaurant/delivery-areas')
  });
}

export function useUpdateDeliveryAreas() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateDeliveryAreasInput) =>
      appFetch<DeliveryAreaItemDTO[]>('/api/restaurant/delivery-areas', {
        method: 'PUT',
        body: JSON.stringify(input)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RESTAURANT_AREAS_KEY });
      queryClient.invalidateQueries({ queryKey: RESTAURANT_READINESS_KEY });
    }
  });
}
