import { Skeleton } from '@/components/ui/skeleton';

export function DealCardSkeleton() {
  return (
    <div className='rounded-xl border bg-card overflow-hidden shadow-xs flex flex-col justify-between min-w-0'>
      <div className='min-w-0'>
        <div className='relative h-36 w-full bg-muted/60 overflow-hidden'>
          <Skeleton className='h-full w-full rounded-none' />
          <div className='absolute top-2.5 inset-s-2.5'>
            <Skeleton className='h-5 w-16 rounded-full' />
          </div>
        </div>

        <div className='p-3.5 space-y-2.5 min-w-0'>
          <div className='space-y-1 min-w-0'>
            <Skeleton className='h-4 w-3/4 rounded-md' />
            <Skeleton className='h-3 w-1/3 rounded-sm' />
          </div>

          <div className='flex flex-wrap gap-1'>
            <Skeleton className='h-5 w-16 rounded-md' />
            <Skeleton className='h-5 w-20 rounded-md' />
          </div>

          <div className='flex items-baseline gap-2 pt-0.5'>
            <Skeleton className='h-5 w-20 rounded-md' />
            <Skeleton className='h-3.5 w-14 rounded-md' />
          </div>
        </div>
      </div>

      <div className='border-t p-3 flex items-center justify-between gap-2 bg-muted/20'>
        <div className='flex items-center gap-2 shrink-0'>
          <Skeleton className='h-5 w-9 rounded-full' />
          <Skeleton className='h-3 w-12 rounded-sm' />
        </div>

        <div className='flex items-center gap-1 shrink-0'>
          <Skeleton className='size-7 rounded-md' />
          <Skeleton className='size-7 rounded-md' />
        </div>
      </div>
    </div>
  );
}

export function DealListRowSkeleton() {
  return (
    <div className='p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0'>
      <div className='flex items-center gap-3 min-w-0 flex-1'>
        <Skeleton className='size-12 rounded-md shrink-0' />
        <div className='space-y-1.5 min-w-0 flex-1'>
          <div className='flex items-center gap-2'>
            <Skeleton className='h-4 w-36 rounded-md' />
            <Skeleton className='h-4 w-12 rounded-full' />
          </div>
          <Skeleton className='h-3 w-48 rounded-md' />
        </div>
      </div>

      <div className='flex items-center justify-between sm:justify-end gap-4 shrink-0'>
        <div className='space-y-1 text-end'>
          <Skeleton className='h-4 w-16 rounded-md' />
        </div>
        <div className='flex items-center gap-2'>
          <Skeleton className='h-5 w-9 rounded-full' />
          <Skeleton className='h-3 w-12 rounded-sm' />
        </div>
        <div className='flex items-center gap-1'>
          <Skeleton className='size-7 rounded-md' />
          <Skeleton className='size-7 rounded-md' />
        </div>
      </div>
    </div>
  );
}

export function DealsListSkeleton() {
  return (
    <div className='flex min-h-0 min-w-0 flex-1 flex-col space-y-6 overflow-y-auto overscroll-y-contain pb-12'>
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 min-w-0'>
        <div className='space-y-1.5 min-w-0'>
          <Skeleton className='h-7 w-36 rounded-md' />
          <Skeleton className='h-4 w-64 rounded-md' />
        </div>
        <Skeleton className='h-9 w-28 rounded-md shrink-0 self-start sm:self-auto' />
      </div>

      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border bg-card p-3 min-w-0'>
        <Skeleton className='h-4 w-28 rounded-md' />
        <div className='flex items-center gap-2 min-w-0 w-full sm:w-auto'>
          <Skeleton className='h-8 w-full sm:w-64 rounded-md' />
          <Skeleton className='h-8 w-16 rounded-md shrink-0' />
        </div>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 min-w-0'>
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <DealCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

