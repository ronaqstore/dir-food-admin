'use client';

import { ErrorView } from '@/components/common/error-view';
import type { LocaleDashboardErrorProps } from '@/types/pages';

export default function DashboardError({ error, reset }: LocaleDashboardErrorProps) {
  return <ErrorView error={error} reset={reset} />;
}
