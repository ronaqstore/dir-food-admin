import * as React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export function DialogDetailSkeleton() {
  return (
    <div className='space-y-6 py-2'>
      {/* Header & Status Badge */}
      <div className='flex items-center justify-between gap-4'>
        <div className='space-y-1.5'>
          <Skeleton className='h-6 w-44 rounded-md' />
          <Skeleton className='h-3.5 w-60 rounded-sm' />
        </div>
        <Skeleton className='h-6 w-24 rounded-full' />
      </div>

      {/* Info Card Grid */}
      <div className='rounded-xl border border-border/60 bg-muted/20 p-4 space-y-3'>
        <div className='grid grid-cols-2 gap-4'>
          <div className='space-y-1'>
            <Skeleton className='h-3 w-20 rounded-sm' />
            <Skeleton className='h-4 w-32 rounded-md' />
          </div>
          <div className='space-y-1'>
            <Skeleton className='h-3 w-20 rounded-sm' />
            <Skeleton className='h-4 w-28 rounded-md' />
          </div>
        </div>
      </div>

      {/* Item Rows */}
      <div className='space-y-2 border-t border-border/60 pt-4'>
        {[1, 2, 3].map((i) => (
          <div key={i} className='flex items-center justify-between py-1.5'>
            <div className='space-y-1'>
              <Skeleton className='h-4 w-36 rounded-md' />
              <Skeleton className='h-3 w-20 rounded-sm' />
            </div>
            <Skeleton className='h-4 w-16 rounded-md' />
          </div>
        ))}
      </div>

      {/* Footer buttons */}
      <div className='flex justify-end gap-2 border-t border-border/60 pt-4'>
        <Skeleton className='h-9 w-24 rounded-md' />
        <Skeleton className='h-9 w-32 rounded-md' />
      </div>
    </div>
  );
}
