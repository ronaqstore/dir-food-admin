import {
  ApiError,
  type ApiErrorBody,
  type ApiSuccessResponse,
  type PaginatedResponse
} from './types';
import { API_BASE_URL } from '@/constants/api';

function extractErrorInfo(
  body: ApiErrorBody | null,
  fallbackStatusText: string
): { code: string; message: string } {
  if (body?.error && typeof body.error === 'object') {
    const errObj = body.error;
    const detailList = Array.isArray(errObj.details)
      ? errObj.details.filter((d): d is string => typeof d === 'string')
      : [];
    const baseMessage = errObj.message || fallbackStatusText || 'An error occurred';
    const message =
      detailList.length > 0 && baseMessage === 'Validation failed'
        ? detailList.join(', ')
        : baseMessage;
    return {
      code: errObj.code || 'API_ERROR',
      message
    };
  }

  const rawMessage = body?.message;
  const message = Array.isArray(rawMessage)
    ? rawMessage.join(', ')
    : typeof rawMessage === 'string'
      ? rawMessage
      : fallbackStatusText || 'An error occurred';

  return { code: 'API_ERROR', message };
}

export async function apiRequest<T>(
  path: string,
  options?: RequestInit,
  token?: string
): Promise<T> {
  const url = path.startsWith('http') ? path : `${API_BASE_URL}/${path.replace(/^\/+/, '')}`;
  const headers = new Headers(options?.headers);

  if (!headers.has('Content-Type') && !(options?.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include'
  });

  const body = (await response.json().catch(() => null)) as
    | (ApiSuccessResponse<T> & ApiErrorBody)
    | null;

  if (!response.ok) {
    const { code, message } = extractErrorInfo(body, response.statusText);
    throw new ApiError(response.status, message, body ?? undefined, code);
  }

  if (body && typeof body === 'object' && 'data' in body) {
    return body.data as T;
  }

  return (body as T) ?? ({} as T);
}

export async function apiRequestPaginated<T>(
  path: string,
  options?: RequestInit,
  token?: string
): Promise<PaginatedResponse<T>> {
  const url = path.startsWith('http') ? path : `${API_BASE_URL}/${path.replace(/^\/+/, '')}`;
  const headers = new Headers(options?.headers);

  if (!headers.has('Content-Type') && !(options?.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include'
  });

  const body = (await response.json().catch(() => null)) as
    | (ApiSuccessResponse<T[]> & ApiErrorBody)
    | null;

  if (!response.ok) {
    const { code, message } = extractErrorInfo(body, response.statusText);
    throw new ApiError(response.status, message, body ?? undefined, code);
  }

  if (body && typeof body === 'object' && 'data' in body) {
    const rawData = body.data;
    if (Array.isArray(rawData)) {
      return {
        items: rawData,
        total: body.meta?.total ?? rawData.length,
        page: body.meta?.page ?? 1,
        pageSize: body.meta?.limit ?? 20
      };
    }
    if (rawData && typeof rawData === 'object' && 'items' in rawData) {
      return rawData as unknown as PaginatedResponse<T>;
    }
  }

  return { items: [], total: 0, page: 1, pageSize: 20 };
}

export * from './types';
