import * as React from 'react';
import { OrdersListSkeleton } from '@/components/skeletons/orders-skeleton';
import { Skeleton } from '@/components/ui/skeleton';

export default function OrdersLoading() {
  return (
    <div className='flex min-h-0 min-w-0 flex-1 flex-col space-y-4 overflow-y-auto overscroll-y-contain pb-12'>
      {/* Title & filter chips placeholder */}
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div className='space-y-1.5'>
          <Skeleton className='h-7 w-32 rounded-md' />
          <Skeleton className='h-4 w-56 rounded-md' />
        </div>
        <div className='flex gap-2'>
          <Skeleton className='h-8 w-24 rounded-md' />
          <Skeleton className='h-8 w-24 rounded-md' />
        </div>
      </div>

      <OrdersListSkeleton />
    </div>
  );
}
