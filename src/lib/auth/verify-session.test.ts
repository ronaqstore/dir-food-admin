import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  invalidateVerificationCache,
  verifyAccessTokenWithBackend
} from './verify-session.ts';

function buildJsonResponse(status: number, payload: object) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

describe('verifyAccessTokenWithBackend', () => {
  beforeEach(() => {
    invalidateVerificationCache();
  });

  it('returns invalid when accessToken is empty', async () => {
    const result = await verifyAccessTokenWithBackend('');
    assert.deepEqual(result, { status: 'invalid' });
  });

  it('returns invalid on 401 response without caching validity', async () => {
    let calls = 0;
    const mockFetch: typeof fetch = async () => {
      calls++;
      return buildJsonResponse(401, { message: 'User not found' });
    };

    const first = await verifyAccessTokenWithBackend('tok-401', false, mockFetch);
    const second = await verifyAccessTokenWithBackend('tok-401', false, mockFetch);
    assert.deepEqual(first, { status: 'invalid' });
    assert.deepEqual(second, { status: 'invalid' });
    assert.equal(calls, 2);
  });

  it('returns invalid on 403 response', async () => {
    const mockFetch: typeof fetch = async () =>
      buildJsonResponse(403, { message: 'Account disabled' });

    const result = await verifyAccessTokenWithBackend('tok-403', false, mockFetch);
    assert.deepEqual(result, { status: 'invalid' });
  });

  it('returns valid profile and caches briefly across concurrent or immediate calls', async () => {
    let calls = 0;
    const mockFetch: typeof fetch = async () => {
      calls++;
      return buildJsonResponse(200, {
        data: {
          id: 'u-1',
          name: 'Jawad',
          phone: '923001234567',
          role: 'RESTAURANT_OWNER',
          status: 'ACTIVE',
          restaurant: {
            id: 'r-1',
            name: 'Dir Cafe',
            slug: 'dir-cafe',
            status: 'ACTIVE',
            subscriptionEndsAt: '2026-12-31T00:00:00.000Z'
          }
        }
      });
    };

    const [a, b] = await Promise.all([
      verifyAccessTokenWithBackend('tok-valid', false, mockFetch),
      verifyAccessTokenWithBackend('tok-valid', false, mockFetch)
    ]);
    assert.equal(a.status, 'valid');
    assert.equal(b.status, 'valid');
    assert.equal(calls, 1);

    invalidateVerificationCache('tok-valid');
    const c = await verifyAccessTokenWithBackend('tok-valid', false, mockFetch);
    assert.equal(c.status, 'valid');
    assert.equal(calls, 2);
  });

  it('returns transient_error on network failure or 5xx', async () => {
    const networkFail: typeof fetch = async () => {
      return Promise.reject(new TypeError('fetch failed'));
    };
    const resNet = await verifyAccessTokenWithBackend('tok-net', false, networkFail);
    assert.deepEqual(resNet, { status: 'transient_error' });

    const serverErr: typeof fetch = async () => buildJsonResponse(503, { error: 'Unavailable' });
    const res503 = await verifyAccessTokenWithBackend('tok-503', false, serverErr);
    assert.deepEqual(res503, { status: 'transient_error' });
  });
});
