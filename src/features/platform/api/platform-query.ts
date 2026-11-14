import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appFetch } from '@/lib/api/app-fetch';
import type {
  CreateRestaurantInput,
  CreateRestaurantResponse,
  MasterArea,
  CreateAreaInput,
  PlatformCity,
  CreateCityInput,
  PaginatedRestaurantsResponse,
  PlatformRestaurant,
  PlatformRestaurantDetail,
  QueryRestaurantsFilter,
  QueryAreasFilter,
  PaginatedAreasResponse,
  UpdateRestaurantStatusPayload,
  ExtendSubscriptionPayload,
  IssueSetupLinkResponse,
  UpdateMasterAreaPayload,
  MutationSuccessResponse,
  ApproveMasterAreaPayload,
  MergeMasterAreaPayload,
  PlatformActivitySummary
} from '../types';

export type { PlatformActivitySummary };

export const PLATFORM_RESTAURANTS_QUERY_KEY = ['platform-restaurants'] as const;

export function usePlatformRestaurants(filter?: QueryRestaurantsFilter) {
  const params = new URLSearchParams();
  if (filter?.page) params.set('page', String(filter.page));
  if (filter?.limit) params.set('limit', String(filter.limit));
  if (filter?.q) params.set('q', filter.q);
  if (filter?.status && filter.status !== 'ALL') {
    params.set('status', filter.status);
  }
  if (filter?.subStatus && filter.subStatus !== 'ALL') {
    params.set('subStatus', filter.subStatus);
  }
  if (filter?.cityId && filter.cityId !== 'ALL') {
    params.set('cityId', filter.cityId);
  }
  if (filter?.sort) {
    params.set('sort', filter.sort);
  }
  if (filter?.sortBy) {
    params.set('sortBy', filter.sortBy);
  }
  if (filter?.sortOrder) {
    params.set('sortOrder', filter.sortOrder);
  }

  const qs = params.toString() ? `?${params.toString()}` : '';

  return useQuery({
    queryKey: [
      ...PLATFORM_RESTAURANTS_QUERY_KEY,
      filter?.page,
      filter?.limit,
      filter?.q,
      filter?.status,
      filter?.subStatus,
      filter?.cityId,
      filter?.sort,
      filter?.sortBy,
      filter?.sortOrder
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
    mutationFn: ({ id, input }: UpdateRestaurantStatusPayload) =>
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
    mutationFn: ({ id, input }: ExtendSubscriptionPayload) =>
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
      appFetch<IssueSetupLinkResponse>(`/api/admin/restaurants/${id}/setup-link`, {
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

export function usePaginatedMasterAreas(filter?: QueryAreasFilter) {
  const params = new URLSearchParams();
  if (filter?.page) params.set('page', String(filter.page));
  if (filter?.limit) params.set('limit', String(filter.limit));
  if (filter?.q) params.set('q', filter.q);
  if (filter?.cityId && filter.cityId !== 'ALL') {
    params.set('cityId', filter.cityId);
  }
  if (filter?.needsReview !== undefined) {
    params.set('needsReview', String(filter.needsReview));
  }
  if (filter?.sort) {
    params.set('sort', filter.sort);
  }
  if (filter?.sortBy) {
    params.set('sortBy', filter.sortBy);
  }
  if (filter?.sortOrder) {
    params.set('sortOrder', filter.sortOrder);
  }

  const qs = params.toString() ? `?${params.toString()}` : '';

  return useQuery({
    queryKey: [
      ...MASTER_AREAS_QUERY_KEY,
      'paginated',
      filter?.page,
      filter?.limit,
      filter?.q,
      filter?.cityId,
      filter?.needsReview,
      filter?.sort,
      filter?.sortBy,
      filter?.sortOrder
    ],
    queryFn: () => appFetch<PaginatedAreasResponse>(`/api/admin/areas${qs}`)
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
    mutationFn: ({ id, input }: UpdateMasterAreaPayload) =>
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
      appFetch<MutationSuccessResponse>(`/api/admin/areas/${id}`, {
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
    mutationFn: ({ id, input }: ApproveMasterAreaPayload) =>
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
    mutationFn: ({ sourceAreaId, targetAreaId }: MergeMasterAreaPayload) =>
      appFetch<MutationSuccessResponse>(`/api/admin/areas/${sourceAreaId}/merge`, {
        method: 'POST',
        body: JSON.stringify({ targetAreaId })
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MASTER_AREAS_QUERY_KEY });
    }
  });
}

export function usePlatformActivity(range: '7d' | '30d' = '7d') {
  return useQuery({
    queryKey: ['platform-activity', range],
    queryFn: () => appFetch<PlatformActivitySummary>(`/api/admin/activity?range=${range}`)
  });
}

