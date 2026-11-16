import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api/proxy';
import type { RouteIdContext } from '@/types/routes';

export async function PATCH(request: NextRequest, context: RouteIdContext) {
  const { id } = await context.params;
  return proxyToBackend(request, `/admin/cuisines/${id}`);
}

export async function DELETE(request: NextRequest, context: RouteIdContext) {
  const { id } = await context.params;
  return proxyToBackend(request, `/admin/cuisines/${id}`);
}
