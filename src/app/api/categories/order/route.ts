import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api/proxy';

export async function PUT(request: NextRequest) {
  return proxyToBackend(request, '/me/restaurant/categories/order');
}
