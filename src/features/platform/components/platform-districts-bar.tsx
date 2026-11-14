'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import type { PlatformDistrictsBarProps } from '../types';

export function PlatformDistrictsBar({
  cities,
  allAreas,
  selectedCityId,
  onSelectCityId,
  totalAllAreas,
  filterNeedsReview,
  onToggleNeedsReview,
  totalNeedsReview
}: PlatformDistrictsBarProps) {
  const t = useTranslations('platformAreas');
  const handleSelectAll = () => {
    onSelectCityId('ALL');
  };

  return (
    <div className='flex flex-wrap items-center justify-between gap-2 shrink-0'>
      {cities.length > 0 && (
        <div className='flex items-center gap-2 overflow-x-auto pb-1'>
          <span className='text-xs font-medium text-muted-foreground whitespace-nowrap'>{t('districtLabelPlain')}</span>
          <Button
            type='button'
            size='sm'
            variant={selectedCityId === 'ALL' ? 'default' : 'outline'}
            className='h-7 text-xs rounded-full'
            onClick={handleSelectAll}
          >
            <span>{t('allDistricts')}</span>
            <span
              className={`ms-1.5 rounded-full px-1.5 py-0.2 text-[10px] ${
                selectedCityId === 'ALL'
                  ? 'bg-primary-foreground/20 text-primary-foreground font-bold'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {totalAllAreas}
            </span>
          </Button>
          {cities.map((c) => {
            const count = allAreas.filter((a) => a.cityId === c.id).length;
            const isSelected = selectedCityId === c.id;
            return (
              <Button
                type='button'
                key={c.id}
                size='sm'
                variant={isSelected ? 'default' : 'outline'}
                className='h-7 text-xs rounded-full'
                onClick={() => onSelectCityId(c.id)}
              >
                <span>{c.name}</span>
                <span
                  className={`ms-1.5 rounded-full px-1.5 py-0.2 text-[10px] ${
                    isSelected
                      ? 'bg-primary-foreground/20 text-primary-foreground font-bold'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {count}
                </span>
              </Button>
            );
          })}
        </div>
      )}

      <div className='flex items-center gap-2 ms-auto'>
        <Button
          type='button'
          size='sm'
          variant={filterNeedsReview ? 'default' : 'outline'}
          className={`h-7 text-xs rounded-full gap-1.5 ${
            filterNeedsReview
              ? 'bg-amber-600 hover:bg-amber-700 text-white'
              : totalNeedsReview > 0
              ? 'border-amber-400 text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/40'
              : ''
          }`}
          onClick={onToggleNeedsReview}
        >
          <Icons.alertCircle className='size-3.5' />
          <span>{t('needsReview')}</span>
          <span
            className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
              filterNeedsReview
                ? 'bg-white/20 text-white'
                : totalNeedsReview > 0
                ? 'bg-amber-200 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {totalNeedsReview}
          </span>
        </Button>
      </div>
    </div>
  );
}
