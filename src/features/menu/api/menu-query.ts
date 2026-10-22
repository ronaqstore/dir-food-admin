import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appFetch } from '@/lib/api/app-fetch';
import type {
  MenuItemDTO,
  CreateMenuItemInput,
  UpdateMenuItemInput,
  ReplaceVariantsInput,
  MenuItemsFilter,
  MenuItemsResponse
} from '../types';

export const MENU_ITEMS_QUERY_KEY = ['menu-items'] as const;

export function useInfiniteMenuItems(filter?: MenuItemsFilter) {
  return useInfiniteQuery<MenuItemsResponse>({
    queryKey: [
      ...MENU_ITEMS_QUERY_KEY,
      'infinite',
      filter?.categoryId ?? 'all',
      filter?.search ?? ''
    ],
    queryFn: async ({ pageParam = 1 }) => {
      const params = new URLSearchParams();
      if (filter?.categoryId && filter.categoryId !== 'all') {
        params.set('categoryId', filter.categoryId);
      }
      if (filter?.search?.trim()) {
        params.set('search', filter.search.trim());
      }
      params.set('page', String(pageParam));
      params.set('limit', String(filter?.limit ?? 24));

      const queryStr = `?${params.toString()}`;
      const res = await appFetch<MenuItemsResponse | MenuItemDTO[]>(`/api/items${queryStr}`);

      if (Array.isArray(res)) {
        return {
          data: res,
          meta: { page: Number(pageParam), limit: 24, total: res.length }
        };
      }
      return res;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, limit, total } = lastPage.meta;
      if (page * limit < total) {
        return page + 1;
      }
      return undefined;
    }
  });
}

export function useMenuItems(filter?: MenuItemsFilter) {
  const params = new URLSearchParams();
  if (filter?.categoryId) params.set('categoryId', filter.categoryId);
  if (filter?.search) params.set('search', filter.search);
  if (filter?.page) params.set('page', String(filter.page));
  if (filter?.limit) params.set('limit', String(filter.limit));

  const queryStr = params.toString() ? `?${params.toString()}` : '';

  return useQuery({
    queryKey: [
      ...MENU_ITEMS_QUERY_KEY,
      filter?.categoryId ?? 'all',
      filter?.search ?? '',
      filter?.page ?? 1
    ],
    queryFn: async () => {
      const res = await appFetch<MenuItemsResponse | MenuItemDTO[]>(`/api/items${queryStr}`);
      return Array.isArray(res) ? res : (res?.data ?? []);
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
    mutationFn: ({ id, input }: { id: string; input: UpdateMenuItemInput }) =>
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
    mutationFn: ({ id, input }: { id: string; input: ReplaceVariantsInput }) =>
      appFetch<MenuItemDTO>(`/api/items/${id}/variants`, {
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
    mutationFn: async ({ id, file }: { id: string; file: File }) => {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`/api/items/${id}/image`, {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        const error = await res.json().catch(() => null);
        throw new Error(error?.message || 'Failed to upload photo');
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
