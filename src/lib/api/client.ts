import {
  ApiError,
  extractErrorInfo,
  type ApiErrorBody,
  type ApiSuccessResponse
} from './types';
import { API_BASE_URL } from '@/constants/api';

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

export * from './types';
