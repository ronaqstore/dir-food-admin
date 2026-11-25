import { API_BASE_URL } from '@/constants/api';
import type { RestaurantStatus } from '@/lib/api/types';
import type {
  BackendMeProfile,
  BackendMeRestaurant,
  CachedVerification,
  SessionVerificationResult
} from '@/types/auth';

const VERIFICATION_CACHE_TTL_MS = 2000;
const VERIFICATION_TIMEOUT_MS = 4000;
const MAX_CACHE_ENTRIES = 500;

const verificationCache = new Map<string, CachedVerification>();
const inFlightVerifications = new Map<string, Promise<SessionVerificationResult>>();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function readString(obj: Record<string, unknown>, key: string): string | undefined {
  const val = obj[key];
  return typeof val === 'string' ? val : undefined;
}

function parseRestaurant(raw: unknown): BackendMeRestaurant | null {
  if (!isRecord(raw)) return null;
  const id = readString(raw, 'id');
  const name = readString(raw, 'name');
  const slug = readString(raw, 'slug');
  const status = readString(raw, 'status');
  if (!id || !name || !slug || !status) return null;
  const subscriptionEndsAt = readString(raw, 'subscriptionEndsAt') ?? null;
  return {
    id,
    name,
    slug,
    status: status as RestaurantStatus,
    subscriptionEndsAt
  };
}

function extractBackendMeProfile(raw: unknown): BackendMeProfile | null {
  if (!isRecord(raw)) return null;
  const candidate = isRecord(raw.data) ? raw.data : raw;
  const id = readString(candidate, 'id');
  const name = readString(candidate, 'name');
  const phone = readString(candidate, 'phone');
  const role = readString(candidate, 'role');
  const status = readString(candidate, 'status') ?? 'ACTIVE';
  if (!id || !role) return null;
  if (role !== 'RESTAURANT_OWNER' && role !== 'PLATFORM_ADMIN') return null;

  return {
    id,
    name: name ?? '',
    phone: phone ?? '',
    role,
    status,
    restaurant: parseRestaurant(candidate.restaurant)
  };
}

function setCachedResult(token: string, result: SessionVerificationResult): void {
  if (verificationCache.size >= MAX_CACHE_ENTRIES) {
    verificationCache.clear();
  }
  verificationCache.set(token, {
    expiresAt: Date.now() + VERIFICATION_CACHE_TTL_MS,
    result
  });
}

export function invalidateVerificationCache(accessToken?: string): void {
  if (!accessToken) {
    verificationCache.clear();
    return;
  }
  verificationCache.delete(accessToken);
}

async function fetchBackendMe(
  accessToken: string,
  fetchFn: typeof fetch
): Promise<SessionVerificationResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), VERIFICATION_TIMEOUT_MS);

  try {
    const response = await fetchFn(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json'
      },
      cache: 'no-store',
      signal: controller.signal
    });

    if (response.status === 401 || response.status === 403) {
      return { status: 'invalid' };
    }

    if (!response.ok) {
      return { status: 'transient_error' };
    }

    const rawBody: unknown = await response.json().catch(() => null);
    const profile = extractBackendMeProfile(rawBody);
    if (!profile) {
      return { status: 'transient_error' };
    }

    return { status: 'valid', profile };
  } catch {
    return { status: 'transient_error' };
  } finally {
    clearTimeout(timeout);
  }
}

export async function verifyAccessTokenWithBackend(
  accessToken: string,
  bypassCache = false,
  fetchFn: typeof fetch = fetch
): Promise<SessionVerificationResult> {
  if (!accessToken) {
    return { status: 'invalid' };
  }

  if (bypassCache) {
    verificationCache.delete(accessToken);
  } else {
    const cached = verificationCache.get(accessToken);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.result;
    }
  }

  const existingPromise = inFlightVerifications.get(accessToken);
  if (existingPromise && !bypassCache) {
    return existingPromise;
  }

  const requestPromise = fetchBackendMe(accessToken, fetchFn).then((result) => {
    inFlightVerifications.delete(accessToken);
    if (result.status === 'valid') {
      setCachedResult(accessToken, result);
    } else if (result.status === 'invalid') {
      verificationCache.delete(accessToken);
    }
    return result;
  });

  inFlightVerifications.set(accessToken, requestPromise);
  return requestPromise;
}
