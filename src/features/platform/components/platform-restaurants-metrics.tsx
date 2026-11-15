'use client';

import { Card } from '@/components/ui/card';
import { Icons } from '@/components/icons';
import type { PlatformRestaurantsMetricsProps } from '../types';

export function PlatformRestaurantsMetrics({
  totalCount,
  pendingCount,
  activeCount,
  suspendedCount,
  expiringCount = 0,
  expiredCount = 0,
  trialCount = 0,
  t
}: PlatformRestaurantsMetricsProps) {
  const renewalsAttentionCount = expiringCount + expiredCount;

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
        <p className='text-[11px] text-muted-foreground truncate'>
          {t('metricActiveBreakdown', { active: activeCount, pending: pendingCount })}
        </p>
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
        <p className='text-[11px] text-muted-foreground truncate'>
          {trialCount > 0
            ? t('metricTrialBreakdown', { count: trialCount })
            : t('metricActiveDesc')}
        </p>
      </Card>

      <Card className='p-3 sm:p-4'>
        <div className='flex items-center justify-between'>
          <span
            className={`text-xs sm:text-sm font-medium ${renewalsAttentionCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground'}`}
          >
            {renewalsAttentionCount > 0 ? t('metricRenewalAlerts') : t('metricSuspended')}
          </span>
          {renewalsAttentionCount > 0 ? (
            <Icons.creditCard className='size-4 text-amber-600 dark:text-amber-400' />
          ) : (
            <Icons.ban className='size-4 text-muted-foreground' />
          )}
        </div>
        <div
          className={`text-xl sm:text-2xl font-bold font-mono mt-1 ${renewalsAttentionCount > 0 ? 'text-amber-600 dark:text-amber-400' : ''}`}
        >
          {renewalsAttentionCount > 0 ? renewalsAttentionCount : suspendedCount}
        </div>
        <p className='text-[11px] text-muted-foreground truncate'>
          {renewalsAttentionCount > 0
            ? t('metricRenewalBreakdown', { expiring: expiringCount, expired: expiredCount })
            : t('metricSuspendedDesc')}
        </p>
      </Card>
    </div>
  );
}
