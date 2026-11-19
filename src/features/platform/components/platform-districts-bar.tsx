'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { IconMapPin } from '@tabler/icons-react';
import { SearchableSelect, type SearchableSelectOption } from '@/components/ui/searchable-select';
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
  const safeCities = Array.isArray(cities) ? cities : [];
  const safeAreas = Array.isArray(allAreas) ? allAreas : [];

  const districtOptions: SearchableSelectOption[] = React.useMemo(() => {
    const allOption: SearchableSelectOption = {
      value: 'ALL',
      label: t('allDistricts'),
      sublabel: `${totalAllAreas} areas`
    };
    const cityOptions: SearchableSelectOption[] = safeCities.map((c) => {
      const count = safeAreas.filter((a) => a.cityId === c.id).length;
      return {
        value: c.id,
        label: c.name,
        sublabel: `${c.areasCount ?? count} areas`
      };
    });
    return [allOption, ...cityOptions];
  }, [safeCities, safeAreas, totalAllAreas, t]);

  const selectedCity = React.useMemo(
    () => safeCities.find((c) => c.id === selectedCityId),
    [safeCities, selectedCityId]
  );

  return (
    <div className='flex flex-wrap items-center justify-between gap-3 shrink-0 w-full bg-card border rounded-xl p-3 shadow-2xs'>
      <div className='flex items-center gap-2.5 flex-1 min-w-[240px] max-w-sm'>
        <div className='flex items-center gap-1.5 text-xs font-semibold text-muted-foreground whitespace-nowrap shrink-0'>
          <IconMapPin className='size-3.5 text-primary' />
          <span>{t('districtLabelPlain')}:</span>
        </div>
        <div className='w-full'>
          <SearchableSelect
            value={selectedCityId}
            onChange={(val) => onSelectCityId(val || 'ALL')}
            options={districtOptions}
            placeholder={t('districtPlaceholder')}
            searchPlaceholder={t('searchDistrictPlaceholder')}
            pageSize={20}
            className='w-full'
          />
        </div>
      </div>

      <div className='flex items-center gap-2 ms-auto'>
        {selectedCityId !== 'ALL' && selectedCity && (
          <Badge variant='secondary' className='text-xs font-normal gap-1.5 h-8 px-2.5'>
            <span className='font-semibold'>{selectedCity.name}</span>
            <button
              type='button'
              onClick={() => onSelectCityId('ALL')}
              className='text-muted-foreground hover:text-foreground cursor-pointer'
              title={t('allDistricts')}
            >
              <Icons.close className='size-3' />
            </button>
          </Badge>
        )}

        <Button
          type='button'
          size='sm'
          variant={filterNeedsReview ? 'default' : 'outline'}
          className={`h-8 text-xs rounded-lg gap-1.5 ${
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
