import * as React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function DashboardOverviewSkeleton() {
  return (
    <div className='flex min-h-0 min-w-0 flex-1 flex-col space-y-6 overflow-y-auto overscroll-y-contain pb-6'>
      {/* Welcome & Status Header */}
      <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
        <div className='space-y-1.5'>
          <Skeleton className='h-8 w-48 rounded-lg' />
          <Skeleton className='h-4 w-64 rounded-md' />
        </div>
        <Skeleton className='h-7 w-28 rounded-full' />
      </div>

      {/* 4 Key Metric Cards */}
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className='border-border/60 shadow-sm'>
            <CardHeader className='flex flex-row items-center justify-between pb-2 space-y-0'>
              <Skeleton className='h-4 w-24 rounded-md' />
              <Skeleton className='h-8 w-8 rounded-md' />
            </CardHeader>
            <CardContent className='space-y-2'>
              <Skeleton className='h-8 w-16 rounded-md' />
              <Skeleton className='h-3 w-32 rounded-sm' />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Action Shortcuts Card */}
      <Card className='border-border/60 shadow-sm'>
        <CardHeader className='pb-3 space-y-1.5'>
          <Skeleton className='h-5 w-32 rounded-md' />
          <Skeleton className='h-3.5 w-60 rounded-md' />
        </CardHeader>
        <CardContent className='flex flex-wrap gap-2.5'>
          <Skeleton className='h-9 w-32 rounded-md' />
          <Skeleton className='h-9 w-36 rounded-md' />
          <Skeleton className='h-9 w-40 rounded-md' />
          <Skeleton className='h-9 w-28 rounded-md' />
        </CardContent>
      </Card>

      {/* Recent Orders Preview Card */}
      <Card className='border-border/60 shadow-sm'>
        <CardHeader className='pb-3'>
          <Skeleton className='h-5 w-36 rounded-md' />
        </CardHeader>
        <CardContent className='space-y-3'>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className='flex items-center justify-between p-3 rounded-lg border border-border/40'
            >
              <div className='flex items-center gap-3'>
                <Skeleton className='h-10 w-10 rounded-full' />
                <div className='space-y-1'>
                  <Skeleton className='h-4 w-28 rounded-md' />
                  <Skeleton className='h-3 w-40 rounded-sm' />
                </div>
              </div>
              <div className='space-y-1 text-end'>
                <Skeleton className='h-4 w-16 rounded-md ms-auto' />
                <Skeleton className='h-5 w-20 rounded-full ms-auto' />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
