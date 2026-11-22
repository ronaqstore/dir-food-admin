import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function ProfileTabSkeleton() {
  return (
    <div className='space-y-8'>
      <div className='rounded-xl border border-border/60 bg-muted/20 p-5 space-y-3'>
        <div className='flex items-center justify-between'>
          <div className='space-y-1.5'>
            <Skeleton className='h-5 w-44 rounded-md' />
            <Skeleton className='h-3.5 w-72 rounded-sm' />
          </div>
        </div>
      </div>

      <Card className='border-border/60 shadow-xs'>
        <CardHeader className='space-y-1.5'>
          <Skeleton className='h-5 w-36 rounded-md' />
          <Skeleton className='h-3.5 w-60 rounded-sm' />
        </CardHeader>
        <CardContent className='space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='space-y-2'>
              <Skeleton className='h-4 w-28 rounded-md' />
              <Skeleton className='h-36 w-36 rounded-2xl' />
            </div>
            <div className='space-y-2'>
              <Skeleton className='h-4 w-32 rounded-md' />
              <Skeleton className='h-36 w-full rounded-2xl' />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className='border-border/60 shadow-xs'>
        <CardHeader className='space-y-1.5'>
          <Skeleton className='h-5 w-40 rounded-md' />
          <Skeleton className='h-3.5 w-64 rounded-sm' />
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <div className='space-y-1.5'>
              <Skeleton className='h-4 w-28 rounded-md' />
              <Skeleton className='h-9 w-full rounded-md' />
            </div>
            <div className='space-y-1.5'>
              <Skeleton className='h-4 w-24 rounded-md' />
              <Skeleton className='h-9 w-full rounded-md' />
            </div>
          </div>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <div className='space-y-1.5'>
              <Skeleton className='h-4 w-36 rounded-md' />
              <Skeleton className='h-9 w-full rounded-md' />
            </div>
            <div className='space-y-1.5'>
              <Skeleton className='h-4 w-32 rounded-md' />
              <Skeleton className='h-9 w-full rounded-md' />
            </div>
          </div>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <div className='space-y-1.5'>
              <Skeleton className='h-4 w-24 rounded-md' />
              <Skeleton className='h-9 w-full rounded-md' />
            </div>
            <div className='space-y-1.5'>
              <Skeleton className='h-4 w-32 rounded-md' />
              <Skeleton className='h-9 w-full rounded-md' />
            </div>
          </div>
          <div className='space-y-1.5'>
            <div className='flex items-center justify-between'>
              <Skeleton className='h-4 w-28 rounded-md' />
              <Skeleton className='h-3.5 w-44 rounded-sm' />
            </div>
            <Skeleton className='h-9 w-full rounded-md' />
          </div>
          <div className='space-y-1.5'>
            <Skeleton className='h-4 w-28 rounded-md' />
            <Skeleton className='h-20 w-full rounded-md' />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function DeliveryAreasListSkeleton() {
  return (
    <div className='divide-y divide-border/60 rounded-lg border border-border/70 bg-card/40 px-3 py-1'>
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <div
          key={i}
          className='flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between px-2.5'
        >
          <div className='flex items-center gap-3'>
            <Skeleton className='h-5 w-9 rounded-full' />
            <div className='flex items-center gap-2'>
              <Skeleton className='size-4 rounded-full' />
              <Skeleton className='h-4 w-28 sm:w-36 rounded-md' />
              <Skeleton className='h-4 w-12 rounded-full' />
            </div>
          </div>
          <div className='flex items-center gap-3 ps-11 sm:ps-0'>
            <div className='flex items-center gap-1.5'>
              <Skeleton className='h-3 w-16 hidden sm:block' />
              <Skeleton className='h-9 w-24 sm:w-28 rounded-md' />
            </div>
            <div className='flex items-center gap-1.5'>
              <Skeleton className='h-3 w-16 hidden sm:block' />
              <Skeleton className='h-9 w-24 sm:w-28 rounded-md' />
            </div>
          </div>
        </div>
      ))}
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
        </Card>

        <Card className='border-border/60 shadow-xs p-6 space-y-4'>
          <Skeleton className='h-5 w-40 rounded-md' />
          <Skeleton className='h-3.5 w-full rounded-sm' />
          <Skeleton className='h-3.5 w-3/4 rounded-sm' />
        </Card>
      </div>
    </div>
  );
}
