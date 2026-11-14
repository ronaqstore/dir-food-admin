import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api/proxy';

export async function GET(request: NextRequest) {
  return proxyToBackend(request, '/admin/areas', {
    allowedParams: [
      'page',
      'limit',
      'q',
      'cityId',
      'needsReview',
      'sort',
      'sortBy',
      'sortOrder'
    ],
    rawResponse: true
  });
}

export async function POST(request: NextRequest) {
  return proxyToBackend(request, '/admin/areas');
}
