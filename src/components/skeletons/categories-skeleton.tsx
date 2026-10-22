import * as React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export function CategoryListSkeleton() {
  return (
    <div className='flex min-h-0 min-w-0 flex-1 flex-col space-y-6 overflow-y-auto overscroll-y-contain pb-12'>
      {/* Header */}
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div className='space-y-1.5'>
          <Skeleton className='h-8 w-44 rounded-lg' />
          <Skeleton className='h-4 w-60 rounded-md' />
        </div>
        <Skeleton className='h-9 w-32 rounded-md' />
      </div>

      {/* Categories Card List */}
      <div className='overflow-hidden rounded-xl border border-border/60 bg-card shadow-xs'>
        <div className='divide-y divide-border/60'>
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className='flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between'
            >
              <div className='flex items-center gap-3 min-w-0'>
                {/* Move buttons */}
                <div className='flex flex-col gap-1'>
                  <Skeleton className='size-5 rounded-sm' />
                  <Skeleton className='size-5 rounded-sm' />
                </div>

                {/* Category title & items count */}
                <div className='space-y-1.5'>
                  <div className='flex items-center gap-2'>
                    <Skeleton className='h-5 w-32 rounded-md' />
                    <Skeleton className='h-5 w-16 rounded-full' />
                  </div>
                  <Skeleton className='h-3 w-40 rounded-sm' />
                </div>
              </div>

              {/* Status switch & Edit button */}
              <div className='flex items-center gap-3 sm:gap-4'>
                <div className='flex items-center gap-2'>
                  <Skeleton className='h-4 w-12 rounded-sm' />
                  <Skeleton className='h-5 w-9 rounded-full' />
                </div>
                <Skeleton className='h-8 w-16 rounded-md' />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
