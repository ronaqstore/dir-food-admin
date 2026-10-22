import * as React from 'react';
import { ProfileTabSkeleton } from '@/components/skeletons/settings-skeleton';
import { Skeleton } from '@/components/ui/skeleton';

export default function SettingsLoading() {
  return (
    <div className='flex min-h-0 min-w-0 flex-1 flex-col space-y-6 overflow-y-auto overscroll-y-contain pb-12'>
      {/* Title & tabs bar */}
      <div className='space-y-4'>
        <div className='space-y-1.5'>
          <Skeleton className='h-8 w-44 rounded-lg' />
          <Skeleton className='h-4 w-72 rounded-md' />
        </div>
        <div className='flex items-center gap-2 border-b border-border/60 pb-2'>
          <Skeleton className='h-9 w-24 rounded-lg' />
          <Skeleton className='h-9 w-28 rounded-lg' />
          <Skeleton className='h-9 w-32 rounded-lg' />
          <Skeleton className='h-9 w-24 rounded-lg' />
        </div>
      </div>

      <ProfileTabSkeleton />
    </div>
  );
}
