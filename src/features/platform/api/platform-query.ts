import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appFetch } from '@/lib/api/app-fetch';
import type {
  CreateRestaurantInput,
  CreateRestaurantResponse,
  ExtendSubscriptionInput,
  MasterArea,
  CreateAreaInput,
  UpdateAreaInput,
  ApproveAreaInput,
  MergeAreaInput,
  PlatformCity,
  CreateCityInput,
  PaginatedRestaurantsResponse,
  PlatformRestaurant,
  PlatformRestaurantDetail,
  QueryRestaurantsFilter,
  UpdateRestaurantStatusInput
} from '../types';

export const PLATFORM_RESTAURANTS_QUERY_KEY = ['platform-restaurants'] as const;

export function usePlatformRestaurants(filter?: QueryRestaurantsFilter) {
  const params = new URLSearchParams();
  if (filter?.page) params.set('page', String(filter.page));
  if (filter?.limit) params.set('limit', String(filter.limit));
  if (filter?.q) params.set('q', filter.q);
  if (filter?.status && filter.status !== 'ALL') {
    params.set('status', filter.status);
  }

  const qs = params.toString() ? `?${params.toString()}` : '';

  return useQuery({
    queryKey: [
      ...PLATFORM_RESTAURANTS_QUERY_KEY,
      filter?.page,
      filter?.limit,
      filter?.q,
      filter?.status
    ],
    queryFn: () => appFetch<PaginatedRestaurantsResponse>(`/api/admin/restaurants${qs}`)
  });
}

export function usePlatformRestaurantDetail(id: string | null) {
  return useQuery({
    queryKey: ['platform-restaurant-detail', id],
    queryFn: () => appFetch<PlatformRestaurantDetail>(`/api/admin/restaurants/${id}`),
    enabled: !!id
  });
}

export function useCreatePlatformRestaurant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateRestaurantInput) =>
      appFetch<CreateRestaurantResponse>('/api/admin/restaurants', {
        method: 'POST',
        body: JSON.stringify(input)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PLATFORM_RESTAURANTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['platform-overview'] });
    }
  });
}

export function useUpdatePlatformRestaurantStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateRestaurantStatusInput }) =>
      appFetch<PlatformRestaurant>(`/api/admin/restaurants/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify(input)
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: PLATFORM_RESTAURANTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['platform-restaurant-detail', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['platform-overview'] });
    }
  });
}

export function useExtendPlatformSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ExtendSubscriptionInput }) =>
      appFetch<PlatformRestaurant>(`/api/admin/restaurants/${id}/subscription/extend`, {
        method: 'POST',
        body: JSON.stringify(input)
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: PLATFORM_RESTAURANTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['platform-restaurant-detail', variables.id] });
    }
  });
}

export function useIssueSetupLink() {
  return useMutation({
    mutationFn: (id: string) =>
      appFetch<{
        setupLink?: string;
        setupUrl?: string;
        userId?: string;
        userName?: string;
        userPhone?: string;
      }>(`/api/admin/restaurants/${id}/setup-link`, {
        method: 'POST'
      })
  });
}

export const PLATFORM_CITIES_QUERY_KEY = ['platform-cities'] as const;

export function usePlatformCities() {
  return useQuery({
    queryKey: PLATFORM_CITIES_QUERY_KEY,
    queryFn: () => appFetch<PlatformCity[]>('/api/admin/cities')
  });
}

export function useCreatePlatformCity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCityInput) =>
      appFetch<PlatformCity>('/api/admin/cities', {
        method: 'POST',
        body: JSON.stringify(input)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PLATFORM_CITIES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: MASTER_AREAS_QUERY_KEY });
    }
  });
}

export const MASTER_AREAS_QUERY_KEY = ['master-areas'] as const;

export function useMasterAreas(cityId?: string) {
  return useQuery({
    queryKey: [...MASTER_AREAS_QUERY_KEY, cityId],
    queryFn: () =>
      appFetch<MasterArea[]>(`/api/admin/areas${cityId ? `?cityId=${encodeURIComponent(cityId)}` : ''}`)
  });
}

export function useCreateMasterArea() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateAreaInput) =>
      appFetch<MasterArea>('/api/admin/areas', {
        method: 'POST',
        body: JSON.stringify(input)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MASTER_AREAS_QUERY_KEY });
    }
  });
}

export function useUpdateMasterArea() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateAreaInput }) =>
      appFetch<MasterArea>(`/api/admin/areas/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(input)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MASTER_AREAS_QUERY_KEY });
    }
  });
}

export function useDeleteMasterArea() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      appFetch<{ success: boolean; message: string }>(`/api/admin/areas/${id}`, {
        method: 'DELETE'
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MASTER_AREAS_QUERY_KEY });
    }
  });
}

export function useApproveMasterArea() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input?: ApproveAreaInput }) =>
      appFetch<MasterArea>(`/api/admin/areas/${id}/approve`, {
        method: 'POST',
        body: JSON.stringify(input || {})
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MASTER_AREAS_QUERY_KEY });
    }
  });
}

export function useMergeMasterArea() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sourceAreaId, targetAreaId }: { sourceAreaId: string; targetAreaId: string }) =>
      appFetch<{ success: boolean; message: string }>(`/api/admin/areas/${sourceAreaId}/merge`, {
        method: 'POST',
        body: JSON.stringify({ targetAreaId })
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MASTER_AREAS_QUERY_KEY });
    }
  });
}
