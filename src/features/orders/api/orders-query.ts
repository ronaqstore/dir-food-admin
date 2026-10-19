import { useQuery } from '@tanstack/react-query';
import { appFetch } from '@/lib/api/app-fetch';
import type { OrderFilters, OrderIntentsResponse, OwnerOrderIntent, OwnerStats } from '../types';

export const ORDERS_QUERY_KEY = ['orders'] as const;
export const ORDER_STATS_QUERY_KEY = ['order-stats'] as const;

export function useOrders(filters?: OrderFilters) {
  const params = new URLSearchParams();
  if (filters?.page) params.set('page', String(filters.page));
  if (filters?.limit) params.set('limit', String(filters.limit));
  if (filters?.q) params.set('q', filters.q);
  if (filters?.status && filters.status !== 'ALL') {
    params.set('status', filters.status);
  }

  const queryStr = params.toString() ? `?${params.toString()}` : '';

  return useQuery({
    queryKey: [...ORDERS_QUERY_KEY, filters?.page, filters?.limit, filters?.q, filters?.status],
    queryFn: () => appFetch<OrderIntentsResponse>(`/api/orders${queryStr}`),
    refetchInterval: 15000 // Poll every 15 seconds for incoming WhatsApp orders
  });
}

export function useOrderDetail(id: string | null) {
  return useQuery({
    queryKey: ['order-detail', id],
    queryFn: () => appFetch<OwnerOrderIntent>(`/api/orders/${id}`),
    enabled: !!id
  });
}

export function useOrderStats(range: '7d' | '30d' = '30d') {
  return useQuery({
    queryKey: [...ORDER_STATS_QUERY_KEY, range],
    queryFn: () => appFetch<OwnerStats>(`/api/orders/stats?range=${range}`),
    staleTime: 60 * 1000
  });
}
