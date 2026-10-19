import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appFetch } from '@/lib/api/app-fetch';
import type {
  CategoryWithCount,
  CreateCategoryInput,
  UpdateCategoryInput,
  ReorderCategoriesInput
} from '../types';

export const CATEGORIES_QUERY_KEY = ['menu-categories'] as const;

export function useCategories() {
  return useQuery({
    queryKey: CATEGORIES_QUERY_KEY,
    queryFn: () => appFetch<CategoryWithCount[]>('/api/categories')
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
    mutationFn: ({ id, input }: { id: string; input: UpdateCategoryInput }) =>
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
