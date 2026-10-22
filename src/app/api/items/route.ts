import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api/proxy';

export async function GET(request: NextRequest) {
  return proxyToBackend(request, '/me/restaurant/items', {
    allowedParams: ['categoryId', 'search', 'page', 'limit', 'isDeal']
  });
}

export async function POST(request: NextRequest) {
  return proxyToBackend(request, '/me/restaurant/items');
}
