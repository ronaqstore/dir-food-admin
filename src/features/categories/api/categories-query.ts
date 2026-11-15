import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appFetch } from '@/lib/api/app-fetch';
import type {
  CategoryWithCount,
  CreateCategoryInput,
  UpdateCategoryMutationPayload,
  ReorderCategoriesInput,
  CategoriesFilter,
  CategoriesResponse
} from '../types';

export const CATEGORIES_QUERY_KEY = ['menu-categories'] as const;

export function useCategories() {
  return useQuery({
    queryKey: CATEGORIES_QUERY_KEY,
    queryFn: () => appFetch<CategoryWithCount[]>('/api/categories')
  });
}

export function usePaginatedCategories(filter?: CategoriesFilter) {
  const params = new URLSearchParams();
  if (filter?.search) params.set('search', filter.search);
  if (typeof filter?.isActive === 'boolean') params.set('isActive', String(filter.isActive));
  if (filter?.page) params.set('page', String(filter.page));
  if (filter?.limit) params.set('limit', String(filter.limit));
  if (filter?.sortBy) params.set('sortBy', filter.sortBy);
  if (filter?.sortOrder) params.set('sortOrder', filter.sortOrder);

  const queryStr = params.toString() ? `?${params.toString()}` : '';

  return useQuery<CategoriesResponse>({
    queryKey: [
      ...CATEGORIES_QUERY_KEY,
      'paginated',
      filter?.search ?? '',
      filter?.isActive === undefined ? 'all' : String(filter.isActive),
      filter?.page ?? 1,
      filter?.limit ?? 20,
      filter?.sortBy ?? 'default',
      filter?.sortOrder ?? 'asc'
    ],
    queryFn: async () => {
      const res = await appFetch<CategoriesResponse | CategoryWithCount[]>(`/api/categories${queryStr}`);
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

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCategoryInput) =>
      appFetch<CategoryWithCount>('/api/categories', {
        method: 'POST',
        body: JSON.stringify(input)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
    }
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: UpdateCategoryMutationPayload) =>
      appFetch<CategoryWithCount>(`/api/categories/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(input)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
    }
  });
}

export function useReorderCategories() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ReorderCategoriesInput) =>
      appFetch<CategoryWithCount[]>('/api/categories/order', {
        method: 'PUT',
        body: JSON.stringify(input)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
    }
  });
}
