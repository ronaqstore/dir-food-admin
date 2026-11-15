import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appFetch } from '@/lib/api/app-fetch';
import { AppError } from '@/lib/errors';
import type {
  MenuItemDTO,
  CreateMenuItemInput,
  MenuItemsFilter,
  MenuItemsResponse,
  UpdateMenuItemPayload,
  ReplaceVariantsPayload,
  ReplaceAddonsPayload,
  UploadItemImagePayload
} from '../types';

export const MENU_ITEMS_QUERY_KEY = ['menu-items'] as const;

export function useMenuItems(filter?: MenuItemsFilter) {
  const params = new URLSearchParams();
  if (filter?.categoryId) params.set('categoryId', filter.categoryId);
  if (filter?.search) params.set('search', filter.search);
  if (typeof filter?.isDeal === 'boolean') params.set('isDeal', String(filter.isDeal));
  if (typeof filter?.isAvailable === 'boolean') params.set('isAvailable', String(filter.isAvailable));
  if (filter?.page) params.set('page', String(filter.page));
  if (filter?.limit) params.set('limit', String(filter.limit));

  const queryStr = params.toString() ? `?${params.toString()}` : '';

  return useQuery({
    queryKey: [
      ...MENU_ITEMS_QUERY_KEY,
      filter?.categoryId ?? 'all',
      filter?.search ?? '',
      filter?.isDeal === undefined ? 'all' : String(filter.isDeal),
      filter?.isAvailable === undefined ? 'all' : String(filter.isAvailable),
      filter?.page ?? 1
    ],
    queryFn: async () => {
      const res = await appFetch<MenuItemsResponse | MenuItemDTO[]>(`/api/items${queryStr}`);
      return Array.isArray(res) ? res : (res?.data ?? []);
    }
  });
}

export function usePaginatedMenuItems(filter?: MenuItemsFilter) {
  const params = new URLSearchParams();
  if (filter?.categoryId) params.set('categoryId', filter.categoryId);
  if (filter?.search) params.set('search', filter.search);
  if (typeof filter?.isDeal === 'boolean') params.set('isDeal', String(filter.isDeal));
  if (typeof filter?.isAvailable === 'boolean') params.set('isAvailable', String(filter.isAvailable));
  if (filter?.page) params.set('page', String(filter.page));
  if (filter?.limit) params.set('limit', String(filter.limit));
  if (filter?.sortBy) params.set('sortBy', filter.sortBy);
  if (filter?.sortOrder) params.set('sortOrder', filter.sortOrder);

  const queryStr = params.toString() ? `?${params.toString()}` : '';

  return useQuery<MenuItemsResponse>({
    queryKey: [
      ...MENU_ITEMS_QUERY_KEY,
      'paginated',
      filter?.categoryId ?? 'all',
      filter?.search ?? '',
      filter?.isDeal === undefined ? 'all' : String(filter.isDeal),
      filter?.isAvailable === undefined ? 'all' : String(filter.isAvailable),
      filter?.page ?? 1,
      filter?.limit ?? 12,
      filter?.sortBy ?? 'default',
      filter?.sortOrder ?? 'asc'
    ],
    queryFn: async () => {
      const res = await appFetch<MenuItemsResponse | MenuItemDTO[]>(`/api/items${queryStr}`);
      if (Array.isArray(res)) {
        return {
          data: res,
          meta: { page: filter?.page ?? 1, limit: filter?.limit ?? res.length, total: res.length, totalPages: 1 }
        };
      }
      return res;
    }
  });
}

export function useCreateMenuItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateMenuItemInput) =>
      appFetch<MenuItemDTO>('/api/items', {
        method: 'POST',
        body: JSON.stringify(input)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MENU_ITEMS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['menu-categories'] });
    }
  });
}

export function useUpdateMenuItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: UpdateMenuItemPayload) =>
      appFetch<MenuItemDTO>(`/api/items/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(input)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MENU_ITEMS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['menu-categories'] });
    }
  });
}

export function useReplaceVariants() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: ReplaceVariantsPayload) =>
      appFetch<MenuItemDTO>(`/api/items/${id}/variants`, {
        method: 'PUT',
        body: JSON.stringify(input)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MENU_ITEMS_QUERY_KEY });
    }
  });
}

export function useReplaceAddons() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: ReplaceAddonsPayload) =>
      appFetch<MenuItemDTO>(`/api/items/${id}/addons`, {
        method: 'PUT',
        body: JSON.stringify(input)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MENU_ITEMS_QUERY_KEY });
    }
  });
}

export function useUploadItemImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, file }: UploadItemImagePayload) => {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`/api/items/${id}/image`, {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        const error = await res.json().catch(() => null);
        throw new AppError(error?.message || 'Failed to upload photo');
      }

      return res.json() as Promise<MenuItemDTO>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MENU_ITEMS_QUERY_KEY });
    }
  });
}

export function useDeleteItemImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      appFetch<MenuItemDTO>(`/api/items/${id}/image`, {
        method: 'DELETE'
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MENU_ITEMS_QUERY_KEY });
    }
  });
}
