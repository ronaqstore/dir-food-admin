'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { IconFlame } from '@tabler/icons-react';
import { formatPkr, toPaisa } from '@/lib/money';
import type { DealPricingSectionProps } from '../types';

export function DealPricingSection({
  basePrice,
  onBasePriceChange,
  originalPrice,
  onOriginalPriceChange,
  discountPercent,
  calculatedSavings,
  errors,
  isPending,
  t
}: DealPricingSectionProps) {
  return (
    <div className='space-y-3'>
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
        <div className='space-y-1.5'>
          <Label htmlFor='deal-price' className='text-xs font-semibold text-foreground'>
            {t('deals.dealPriceLabel')}
          </Label>
          <div className='relative'>
            <span className='absolute inset-s-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground select-none'>
              {t('common.currency')}
            </span>
            <Input
              id='deal-price'
              type='number'
              min='1'
              step='1'
              value={basePrice}
              onChange={(e) => onBasePriceChange(e.target.value)}
              placeholder={t('deals.dealPricePlaceholder')}
              disabled={isPending}
              className='ps-10 h-10 rounded-xl bg-background font-semibold text-sm'
            />
          </div>
          {errors.basePrice ? (
            <p className='text-xs text-destructive'>{errors.basePrice}</p>
          ) : null}
        </div>

        <div className='space-y-1.5'>
          <div className='flex items-center justify-between'>
            <Label htmlFor='deal-original-price' className='text-xs font-semibold text-foreground'>
              {t('deals.regularPriceLabel')}
            </Label>
            <span className='text-[10px] text-muted-foreground'>{t('common.optional')}</span>
          </div>
          <div className='relative'>
            <span className='absolute inset-s-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground select-none'>
              {t('common.currency')}
            </span>
            <Input
              id='deal-original-price'
              type='number'
              min='1'
              step='1'
              value={originalPrice}
              onChange={(e) => onOriginalPriceChange(e.target.value)}
              placeholder={t('deals.regularPricePlaceholder')}
              disabled={isPending}
              className='ps-10 h-10 rounded-xl bg-background font-semibold text-sm'
            />
          </div>
          {errors.originalPrice ? (
            <p className='text-xs text-destructive'>{errors.originalPrice}</p>
          ) : null}
        </div>
      </div>

      {discountPercent > 0 ? (
        <div className='flex items-center justify-between rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-3 text-xs text-emerald-800 dark:text-emerald-300 shadow-2xs'>
          <div className='flex items-center gap-2'>
            <span className='inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2 py-0.5 text-[11px] font-bold text-white shadow-2xs'>
              <IconFlame className='size-3.5' />
              {discountPercent}{t('deals.percentOffBadge')}
            </span>
            <span className='font-semibold'>
              {t('deals.customerSaves')} {formatPkr(toPaisa(calculatedSavings))}
            </span>
          </div>
          <span className='text-[11px] text-emerald-700 dark:text-emerald-400 font-medium hidden sm:inline'>
            {t('deals.offRegularPrice')}
          </span>
        </div>
      ) : null}
    </div>
  );
}
