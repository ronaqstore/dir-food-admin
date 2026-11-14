import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api/proxy';
import type { RouteKindContext } from '@/types/routes';

export async function POST(request: NextRequest, context: RouteKindContext) {
  const { kind } = await context.params;
  return proxyToBackend(request, `/me/restaurant/images/${kind}`, {
    forwardFormData: true
  });
}

export async function DELETE(request: NextRequest, context: RouteKindContext) {
  const { kind } = await context.params;
  return proxyToBackend(request, `/me/restaurant/images/${kind}`, {
    method: 'DELETE'
  });
}
