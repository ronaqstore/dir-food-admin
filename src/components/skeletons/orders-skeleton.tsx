import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function OrdersListSkeleton() {
  return (
    <div className='flex flex-1 flex-col space-y-4'>
      {/* Desktop / Tablet Table Skeleton */}
      <div className='hidden md:flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-border/60 bg-card shadow-xs'>
        <div className='border-b border-border/60 bg-muted/40 p-3'>
          <div className='flex items-center justify-between'>
            <Skeleton className='h-4 w-16 rounded-md' />
            <Skeleton className='h-4 w-28 rounded-md' />
            <Skeleton className='h-4 w-24 rounded-md' />
            <Skeleton className='h-4 w-36 rounded-md' />
            <Skeleton className='h-4 w-20 rounded-md' />
            <Skeleton className='h-4 w-24 rounded-md' />
            <Skeleton className='h-4 w-16 rounded-md' />
            <Skeleton className='h-4 w-16 rounded-md' />
          </div>
        </div>
        <div className='divide-y divide-border/60 p-1'>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className='flex items-center justify-between p-3.5'>
              <Skeleton className='h-5 w-20 rounded-md' />
              <div className='space-y-1'>
                <Skeleton className='h-4 w-28 rounded-md' />
                <Skeleton className='h-3 w-20 rounded-sm' />
              </div>
              <Skeleton className='h-4 w-24 rounded-md' />
              <Skeleton className='h-4 w-40 rounded-md' />
              <Skeleton className='h-4 w-16 rounded-md' />
              <Skeleton className='h-6 w-24 rounded-full' />
              <Skeleton className='h-3 w-16 rounded-sm' />
              <div className='flex gap-1.5'>
                <Skeleton className='size-8 rounded-md' />
                <Skeleton className='size-8 rounded-md' />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Card List Skeleton */}
      <div className='grid gap-3 md:hidden min-h-0 flex-1 overflow-y-auto overscroll-y-contain'>
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className='p-4 shadow-xs border-border/60 space-y-3'>
            <div className='flex items-start justify-between gap-2'>
              <div className='space-y-1.5'>
                <Skeleton className='h-5 w-24 rounded-md' />
                <Skeleton className='h-4 w-32 rounded-md' />
                <Skeleton className='h-3 w-24 rounded-sm' />
              </div>
              <Skeleton className='h-6 w-24 rounded-full' />
            </div>
            <div className='space-y-1.5 border-t border-border/50 pt-2'>
              <Skeleton className='h-3.5 w-48 rounded-md' />
              <Skeleton className='h-3.5 w-36 rounded-md' />
            </div>
            <div className='flex items-center justify-between border-t border-border/50 pt-2'>
              <Skeleton className='h-5 w-20 rounded-md' />
              <div className='flex gap-1.5'>
                <Skeleton className='size-8 rounded-md' />
                <Skeleton className='size-8 rounded-md' />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
