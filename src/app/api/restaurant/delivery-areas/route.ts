import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api/proxy';

export async function GET(request: NextRequest) {
  return proxyToBackend(request, '/me/restaurant/delivery-areas');
}

export async function PUT(request: NextRequest) {
  return proxyToBackend(request, '/me/restaurant/delivery-areas');
}
