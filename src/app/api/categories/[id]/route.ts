import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api/proxy';
import type { RouteIdContext } from '@/types/routes';

export async function PATCH(request: NextRequest, context: RouteIdContext) {
  const { id } = await context.params;
  return proxyToBackend(request, `/me/restaurant/categories/${id}`);
}
