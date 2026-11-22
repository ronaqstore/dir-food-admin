import { cn } from '@/lib/utils';
import type { TablePageBodyProps } from '@/types';
export type { TablePageBodyProps };

export function TablePageBody({ children, className }: TablePageBodyProps) {
  return <div className={cn('flex h-full max-h-full min-h-0 min-w-0 flex-1 flex-col', className)}>{children}</div>;
}
