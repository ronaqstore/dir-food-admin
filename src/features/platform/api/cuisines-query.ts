import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appFetch } from '@/lib/api/app-fetch';
import type { MutationSuccessResponse } from '../types';
import type {
  MasterCuisine,
  MasterCuisinesEnvelope,
  PublicCuisinesResponse,
  QueryPlatformCuisinesParams,
  CreateCuisineInput,
  UpdateMasterCuisinePayload
} from '../cuisines.types';

export const MASTER_CUISINES_QUERY_KEY = ['master-cuisines'] as const;
export const PUBLIC_CUISINES_QUERY_KEY = ['public-cuisines'] as const;

export function usePublicCuisines() {
  return useQuery({
    queryKey: PUBLIC_CUISINES_QUERY_KEY,
    queryFn: () => appFetch<PublicCuisinesResponse>('/api/public/cuisines'),
    staleTime: 5 * 60 * 1000
  });
}

export function usePlatformCuisines(params?: QueryPlatformCuisinesParams) {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 50;
  const q = params?.q?.trim() || undefined;
  const isActive = params?.isActive;
  const sortBy = params?.sortBy;
  const sortOrder = params?.sortOrder;

  const query = new URLSearchParams();
  query.set('page', String(page));
  query.set('limit', String(limit));
  if (q) query.set('q', q);
  if (isActive !== undefined) query.set('isActive', String(isActive));
  if (sortBy) query.set('sortBy', sortBy);
  if (sortOrder) query.set('sortOrder', sortOrder);
  const qStr = query.toString();

  return useQuery({
    queryKey: [
      ...MASTER_CUISINES_QUERY_KEY,
      page,
      limit,
      q ?? '',
      isActive === undefined ? 'all' : String(isActive),
      sortBy ?? 'sortOrder',
      sortOrder ?? 'asc'
    ],
    queryFn: () => appFetch<MasterCuisinesEnvelope>(`/api/admin/cuisines${qStr ? `?${qStr}` : ''}`),
    staleTime: 30 * 1000
  });
}

export function useCreateMasterCuisine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCuisineInput) =>
      appFetch<MasterCuisine>('/api/admin/cuisines', {
        method: 'POST',
        body: JSON.stringify(input)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MASTER_CUISINES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: PUBLIC_CUISINES_QUERY_KEY });
    }
  });
}

export function useUpdateMasterCuisine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: UpdateMasterCuisinePayload) =>
      appFetch<MasterCuisine>(`/api/admin/cuisines/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(input)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MASTER_CUISINES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: PUBLIC_CUISINES_QUERY_KEY });
    }
  });
}

export function useDeleteMasterCuisine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      appFetch<MutationSuccessResponse>(`/api/admin/cuisines/${id}`, {
        method: 'DELETE'
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MASTER_CUISINES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: PUBLIC_CUISINES_QUERY_KEY });
    }
  });
}
