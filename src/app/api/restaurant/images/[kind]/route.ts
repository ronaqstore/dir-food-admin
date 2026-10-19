import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api/proxy';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ kind: string }> }
) {
  const { kind } = await params;
  return proxyToBackend(request, `/me/restaurant/images/${kind}`, {
    forwardFormData: true
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ kind: string }> }
) {
  const { kind } = await params;
  return proxyToBackend(request, `/me/restaurant/images/${kind}`, {
    method: 'DELETE'
  });
}
