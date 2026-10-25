import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function MenuItemCardSkeleton() {
  return (
    <Card className='border-border/60 shadow-xs overflow-hidden'>
      <CardContent className='p-3.5 sm:p-4'>
        <div className='flex items-start gap-3 sm:gap-3.5'>
          {/* Dish image thumbnail */}
          <Skeleton className='size-16 sm:size-20 shrink-0 rounded-xl' />

          {/* Info */}
          <div className='flex min-w-0 flex-1 flex-col justify-between self-stretch space-y-2'>
            <div className='space-y-1.5'>
              <div className='flex items-center justify-between gap-2'>
                <Skeleton className='h-4 w-32 rounded-md' />
                <Skeleton className='h-5 w-9 rounded-full' />
              </div>
              <Skeleton className='h-3 w-48 max-w-full rounded-sm' />
            </div>

            <div className='flex items-center justify-between pt-1'>
              <Skeleton className='h-4 w-16 rounded-md' />
              <div className='flex items-center gap-1.5'>
                <Skeleton className='size-7 rounded-md' />
                <Skeleton className='size-7 rounded-md' />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function MenuItemListRowSkeleton() {
  return (
    <div className='flex items-center justify-between gap-4 p-3 sm:px-4'>
      <div className='flex items-center gap-3 min-w-0 flex-1'>
        <Skeleton className='size-12 shrink-0 rounded-lg' />
        <div className='space-y-2 flex-1'>
          <Skeleton className='h-4 w-36 rounded-md' />
          <Skeleton className='h-3 w-24 rounded-md' />
        </div>
      </div>
      <div className='flex items-center gap-3 shrink-0'>
        <Skeleton className='h-5 w-16 rounded-full' />
        <Skeleton className='h-7 w-14 rounded-md' />
      </div>
    </div>
  );
}

export function MenuManagementSkeleton() {
  return (
    <div className='flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto overscroll-y-contain pb-28 sm:pb-12'>
      <div className='space-y-4'>
        {/* Page Header */}
        <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
          <div className='space-y-1.5'>
            <div className='flex items-center gap-2.5'>
              <Skeleton className='h-7 w-36 rounded-md' />
              <Skeleton className='h-5 w-8 rounded-full' />
            </div>
            <Skeleton className='h-4 w-52 rounded-md' />
          </div>
          <Skeleton className='h-9 w-28 rounded-md' />
        </div>

        {/* Filter bar */}
        <div className='border-b pb-3 pt-1 space-y-3'>
          <div className='flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between'>
            <Skeleton className='h-9 w-full sm:max-w-md rounded-md' />
            <div className='flex items-center gap-2'>
              <Skeleton className='h-8 w-24 rounded-md' />
              <Skeleton className='h-8 w-20 rounded-md' />
            </div>
          </div>

          {/* Category Chips Bar */}
          <div className='flex items-center gap-1.5 overflow-x-hidden pt-1'>
            <Skeleton className='h-7 w-16 shrink-0 rounded-full' />
            <Skeleton className='h-7 w-24 shrink-0 rounded-full' />
            <Skeleton className='h-7 w-20 shrink-0 rounded-full' />
            <Skeleton className='h-7 w-28 shrink-0 rounded-full' />
            <Skeleton className='h-7 w-20 shrink-0 rounded-full' />
          </div>
        </div>

        {/* Section 1 */}
        <div className='space-y-3 pt-2'>
          <div className='flex items-center justify-between border-b pb-2'>
            <Skeleton className='h-5 w-32 rounded-md' />
            <Skeleton className='h-4 w-12 rounded-md' />
          </div>
          <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3'>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <MenuItemCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
