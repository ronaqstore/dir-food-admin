import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api/proxy';
import type { RouteIdContext } from '@/types/routes';

export async function POST(request: NextRequest, context: RouteIdContext) {
  const { id } = await context.params;
  return proxyToBackend(request, `/me/restaurant/items/${id}/image`, {
    forwardFormData: true
  });
}

export async function DELETE(request: NextRequest, context: RouteIdContext) {
  const { id } = await context.params;
  return proxyToBackend(request, `/me/restaurant/items/${id}/image`, {
    method: 'DELETE'
  });
}
