import { ApiError, extractErrorInfo, type ApiResponseBodyError } from '@/lib/api/types';
import { APP_BASE_URL } from '@/constants/api';

export async function appFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const url = path.startsWith('http') ? path : `${APP_BASE_URL}${path}`;
  const headers = new Headers(init?.headers);

  if (typeof window === 'undefined') {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const cookieHeader = cookieStore
      .getAll()
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join('; ');
    if (cookieHeader) {
      headers.set('Cookie', cookieHeader);
    }
  }

  const res = await fetch(url, { ...init, headers, cache: 'no-store' });

  const text = await res.text();
  let body: (T & ApiResponseBodyError) | null = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = null;
    }
  }

  if (!res.ok) {
    const fallback =
      text && !text.startsWith('{') && !text.startsWith('<')
        ? text
        : res.statusText || `Request failed with status ${res.status}`;
    const { code, message } = extractErrorInfo(body, fallback);
    throw new ApiError(res.status, message, body ?? undefined, code);
  }

  return (body ?? ({} as T)) as T;
}
