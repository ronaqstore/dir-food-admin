import { auth } from '@/auth';
import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/constants/api';
import type { ProxyOptions } from './types';

const NO_CACHE_HEADERS: Record<string, string> = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, private',
  Pragma: 'no-cache'
};

export async function proxyToBackend(
  request: NextRequest,
  backendPath: string,
  options?: ProxyOptions
): Promise<NextResponse> {
  const session = await auth();
  const token = session?.accessToken;

  if (!token && !options?.isPublic) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401, headers: NO_CACHE_HEADERS }
    );
  }

  let qs = '';
  if (options?.allowedParams) {
    const searchParams = request.nextUrl.searchParams;
    const params = new URLSearchParams();
    const aliases = {
      ...(options.allowedParams.includes('pageSize')
        ? { limit: 'pageSize', perPage: 'pageSize' }
        : {}),
      ...options?.paramAliases
    };

    for (const key of options.allowedParams) {
      let val = searchParams.get(key);
      if (val == null) {
        for (const [alias, target] of Object.entries(aliases)) {
          if (target === key) {
            val = searchParams.get(alias);
            if (val != null) break;
          }
        }
      }
      if (val != null) params.set(key, val);
    }
    const str = params.toString();
    if (str) qs = `?${str}`;
  } else if (request.nextUrl.search) {
    qs = request.nextUrl.search;
  }

  const method = options?.method ?? request.method;
  const headers: Record<string, string> = {
    Accept: 'application/json'
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let reqBody: BodyInit | undefined;
  if (options?.forwardFormData) {
    reqBody = await request.formData();
  } else if (method !== 'GET' && method !== 'HEAD') {
    headers['Content-Type'] = 'application/json';
    if (options?.body !== undefined) {
      reqBody = JSON.stringify(options.body);
    } else {
      const json = await request.json().catch(() => null);
      if (json !== null) {
        reqBody = JSON.stringify(json);
      }
    }
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${backendPath}${qs}`, {
      method,
      headers,
      body: reqBody,
      cache: 'no-store'
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Backend unreachable' },
      { status: 502, headers: NO_CACHE_HEADERS }
    );
  }

  if (response.status === 204) {
    return new NextResponse(null, { status: 204, headers: NO_CACHE_HEADERS });
  }

  const responseBody = await response.json().catch(() => null);

  if (!response.ok) {
    if (options?.transformError) {
      const transformed = options.transformError(responseBody, response.status);
      if (transformed?.handled) {
        return NextResponse.json(transformed.data, {
          status: transformed.status ?? 200,
          headers: NO_CACHE_HEADERS
        });
      }
    }
    return NextResponse.json(responseBody ?? { error: 'Upstream error' }, {
      status: response.status,
      headers: NO_CACHE_HEADERS
    });
  }

  const defaultStatus = method === 'POST' ? 201 : 200;
  const status = options?.statusOnSuccess ?? defaultStatus;
  if (status === 204) {
    return new NextResponse(null, { status: 204, headers: NO_CACHE_HEADERS });
  }

  const unwrapped =
    !options?.rawResponse &&
    responseBody &&
    typeof responseBody === 'object' &&
    'data' in responseBody &&
    !('meta' in responseBody)
      ? responseBody.data
      : responseBody;

  const finalPayload = options?.transformResponse
    ? options.transformResponse(unwrapped)
    : unwrapped;

  return NextResponse.json(finalPayload, { status, headers: NO_CACHE_HEADERS });
}
