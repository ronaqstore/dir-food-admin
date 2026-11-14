'use client';

import { Card } from '@/components/ui/card';
import { Icons } from '@/components/icons';
import type { PlatformRestaurantsMetricsProps } from '../types';

export function PlatformRestaurantsMetrics({
  totalCount,
  pendingCount,
  activeCount,
  suspendedCount,
  t
}: PlatformRestaurantsMetricsProps) {
  return (
    <div className='grid shrink-0 grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4'>
      <Card className='p-3 sm:p-4'>
        <div className='flex items-center justify-between'>
          <span className='text-xs sm:text-sm font-medium text-muted-foreground'>
            {t('metricTotal')}
          </span>
          <Icons.building className='size-4 text-muted-foreground' />
        </div>
        <div className='text-xl sm:text-2xl font-bold font-mono mt-1'>{totalCount}</div>
        <p className='text-[11px] text-muted-foreground truncate'>{t('metricTotalDesc')}</p>
      </Card>

      <Card className='p-3 sm:p-4'>
        <div className='flex items-center justify-between'>
          <span className='text-xs sm:text-sm font-medium text-amber-600 dark:text-amber-400'>
            {t('metricPending')}
          </span>
          <Icons.clock className='size-4 text-amber-600 dark:text-amber-400' />
        </div>
        <div className='text-xl sm:text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1'>
          {pendingCount}
        </div>
        <p className='text-[11px] text-muted-foreground truncate'>{t('metricPendingDesc')}</p>
      </Card>

      <Card className='p-3 sm:p-4'>
        <div className='flex items-center justify-between'>
          <span className='text-xs sm:text-sm font-medium text-emerald-600 dark:text-emerald-400'>
            {t('metricActive')}
          </span>
          <Icons.circleCheck className='size-4 text-emerald-600 dark:text-emerald-400' />
        </div>
        <div className='text-xl sm:text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1'>
          {activeCount}
        </div>
        <p className='text-[11px] text-muted-foreground truncate'>{t('metricActiveDesc')}</p>
      </Card>

      <Card className='p-3 sm:p-4'>
        <div className='flex items-center justify-between'>
          <span className='text-xs sm:text-sm font-medium text-muted-foreground'>
            {t('metricSuspended')}
          </span>
          <Icons.ban className='size-4 text-muted-foreground' />
        </div>
        <div className='text-xl sm:text-2xl font-bold font-mono mt-1'>{suspendedCount}</div>
        <p className='text-[11px] text-muted-foreground truncate'>{t('metricSuspendedDesc')}</p>
      </Card>
    </div>
  );
}
