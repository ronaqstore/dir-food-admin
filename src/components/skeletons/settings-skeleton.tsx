import * as React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function ProfileTabSkeleton() {
  return (
    <div className='space-y-8'>
      {/* Banner Skeleton */}
      <div className='rounded-xl border border-border/60 bg-muted/20 p-5 space-y-3'>
        <div className='flex items-center justify-between'>
          <div className='space-y-1.5'>
            <Skeleton className='h-5 w-44 rounded-md' />
            <Skeleton className='h-3.5 w-72 rounded-sm' />
          </div>
          <Skeleton className='h-9 w-32 rounded-md' />
        </div>
      </div>

      {/* Brand Images Card Skeleton */}
      <Card className='border-border/60 shadow-xs'>
        <CardHeader className='space-y-1.5'>
          <Skeleton className='h-5 w-36 rounded-md' />
          <Skeleton className='h-3.5 w-60 rounded-sm' />
        </CardHeader>
        <CardContent className='space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* Logo */}
            <div className='space-y-2'>
              <Skeleton className='h-4 w-28 rounded-md' />
              <Skeleton className='h-36 w-36 rounded-2xl' />
            </div>
            {/* Cover */}
            <div className='space-y-2'>
              <Skeleton className='h-4 w-32 rounded-md' />
              <Skeleton className='h-36 w-full rounded-2xl' />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Store Info Form Card Skeleton */}
      <Card className='border-border/60 shadow-xs'>
        <CardHeader className='space-y-1.5'>
          <Skeleton className='h-5 w-40 rounded-md' />
          <Skeleton className='h-3.5 w-64 rounded-sm' />
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <div className='space-y-1.5'>
              <Skeleton className='h-4 w-24 rounded-md' />
              <Skeleton className='h-10 w-full rounded-md' />
            </div>
            <div className='space-y-1.5'>
              <Skeleton className='h-4 w-32 rounded-md' />
              <Skeleton className='h-10 w-full rounded-md' />
            </div>
          </div>
          <div className='space-y-1.5'>
            <Skeleton className='h-4 w-28 rounded-md' />
            <Skeleton className='h-20 w-full rounded-md' />
          </div>
          <Skeleton className='h-9 w-28 rounded-md' />
        </CardContent>
      </Card>
    </div>
  );
}

export function DeliveryAreasTabSkeleton() {
  return (
    <div className='space-y-6'>
      <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
        <div className='space-y-1.5'>
          <Skeleton className='h-6 w-40 rounded-md' />
          <Skeleton className='h-3.5 w-64 rounded-sm' />
        </div>
        <Skeleton className='h-9 w-32 rounded-md' />
      </div>

      <div className='divide-y divide-border/60 rounded-xl border border-border/60 bg-card overflow-hidden'>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className='flex items-center justify-between p-4'>
            <div className='space-y-1.5'>
              <Skeleton className='h-5 w-32 rounded-md' />
              <Skeleton className='h-3.5 w-44 rounded-sm' />
            </div>
            <div className='flex items-center gap-4'>
              <Skeleton className='h-9 w-24 rounded-md' />
              <Skeleton className='h-9 w-24 rounded-md' />
              <Skeleton className='h-5 w-9 rounded-full' />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function HoursTabSkeleton() {
  return (
    <div className='space-y-6'>
      <div className='space-y-1.5'>
        <Skeleton className='h-6 w-36 rounded-md' />
        <Skeleton className='h-3.5 w-60 rounded-sm' />
      </div>

      <Card className='border-border/60 shadow-xs'>
        <CardContent className='divide-y divide-border/60 p-0'>
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className='flex items-center justify-between p-4'>
              <Skeleton className='h-5 w-24 rounded-md' />
              <div className='flex items-center gap-3'>
                <Skeleton className='h-9 w-28 rounded-md' />
                <Skeleton className='h-4 w-4 rounded-sm' />
                <Skeleton className='h-9 w-28 rounded-md' />
              </div>
              <Skeleton className='h-5 w-9 rounded-full' />
            </div>
          ))}
        </CardContent>
      </Card>

      <Skeleton className='h-10 w-32 rounded-md' />
    </div>
  );
}

export function QrCodeTabSkeleton() {
  return (
    <div className='space-y-6'>
      <div className='space-y-1.5'>
        <Skeleton className='h-6 w-36 rounded-md' />
        <Skeleton className='h-3.5 w-64 rounded-sm' />
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <Card className='border-border/60 shadow-xs flex flex-col items-center justify-center p-8 space-y-4'>
          <Skeleton className='size-56 rounded-2xl' />
          <Skeleton className='h-4 w-40 rounded-md' />
          <div className='flex gap-2 pt-2'>
            <Skeleton className='h-9 w-28 rounded-md' />
            <Skeleton className='h-9 w-28 rounded-md' />
          </div>
        </Card>

        <Card className='border-border/60 shadow-xs p-6 space-y-4'>
          <Skeleton className='h-5 w-40 rounded-md' />
          <Skeleton className='h-3.5 w-full rounded-sm' />
          <Skeleton className='h-3.5 w-3/4 rounded-sm' />
          <div className='pt-4 space-y-2'>
            <Skeleton className='h-9 w-full rounded-md' />
            <Skeleton className='h-9 w-full rounded-md' />
          </div>
        </Card>
      </div>
    </div>
  );
}
