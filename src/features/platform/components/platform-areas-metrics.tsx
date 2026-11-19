'use client';

import { Card } from '@/components/ui/card';
import { Icons } from '@/components/icons';
import { IconMapPin } from '@tabler/icons-react';
import type { PlatformAreasMetricsProps } from '../types';

export function PlatformAreasMetrics({
  totalDistricts,
  totalAreas,
  selectedCityName,
  activeAreas,
  totalCoverageLinks,
  t
}: PlatformAreasMetricsProps) {
  return (
    <div className='grid shrink-0 grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3'>
      <Card className='p-3 sm:p-4'>
        <div className='flex items-center justify-between'>
          <span className='text-xs sm:text-sm font-medium text-muted-foreground'>
            {t('metricDistricts')}
          </span>
          <IconMapPin className='size-4 text-primary' />
        </div>
        <div className='text-xl sm:text-2xl font-bold font-mono mt-1'>{totalDistricts}</div>
        <p className='text-[11px] text-muted-foreground truncate'>{t('metricDistrictsDesc')}</p>
      </Card>

      <Card className='p-3 sm:p-4'>
        <div className='flex items-center justify-between'>
          <span className='text-xs sm:text-sm font-medium text-emerald-600 dark:text-emerald-400'>
            {t('metricTotal')}
          </span>
          <Icons.building className='size-4 text-emerald-600 dark:text-emerald-400' />
        </div>
        <div className='text-xl sm:text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1'>
          {totalAreas}
        </div>
        <p className='text-[11px] text-muted-foreground truncate'>
          {selectedCityName ? `Standard zones in ${selectedCityName}` : t('metricTotalDesc')}
        </p>
      </Card>

      <Card className='p-3 sm:p-4'>
        <div className='flex items-center justify-between'>
          <span className='text-xs sm:text-sm font-medium text-primary'>
            {t('metricCoverage')}
          </span>
          <Icons.trendingUp className='size-4 text-primary' />
        </div>
        <div className='text-xl sm:text-2xl font-bold font-mono text-primary mt-1'>
          {totalCoverageLinks}
        </div>
        <p className='text-[11px] text-muted-foreground truncate'>{t('metricCoverageDesc')}</p>
      </Card>
    </div>
  );
}
