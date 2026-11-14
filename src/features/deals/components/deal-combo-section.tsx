'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { IconPlus, IconTrash, IconMinus } from '@tabler/icons-react';
import { toPaisa, fromPaisa, formatPkr } from '@/lib/money';
import { DishCombobox } from './dish-combobox';
import type { DealComboSectionProps } from '../types';
import type { MenuItemDTO } from '@/features/menu/types';

export function getDishUnitPrice(dish: MenuItemDTO): number {
  if (dish.basePrice != null && dish.basePrice > 0) {
    return fromPaisa(dish.basePrice);
  }
  if (dish.variants && dish.variants.length > 0) {
    const firstActive = dish.variants.find((v) => v.isActive !== false) || dish.variants[0];
    if (firstActive && firstActive.price > 0) {
      return fromPaisa(firstActive.price);
    }
  }
  return 0;
}

export function DealComboSection({
  comboRows,
  availableDishes,
  calculatedTotalValue,
  isPending,
  onSelectDish,
  onQtyChange,
  onRemoveRow,
  onAddDish,
  onSetOriginalPrice
}: DealComboSectionProps) {
  const t = useTranslations('deals');
  const handleSetPrice = () => {
    onSetOriginalPrice(calculatedTotalValue);
  };

  return (
    <div className='rounded-lg border border-border p-3 sm:p-3.5 space-y-3 bg-muted/20 w-full min-w-0'>
      <div className='flex flex-wrap items-center justify-between gap-2'>
        <div>
          <Label className='text-xs font-semibold'>{t('dishesInCombo')}</Label>
          <p className='text-[11px] text-muted-foreground'>
            {t('comboHelper')}
          </p>
        </div>
        {calculatedTotalValue > 0 ? (
          <span className='text-xs font-medium text-muted-foreground whitespace-nowrap'>
            {t('standardValue')} <strong className='text-foreground'>{formatPkr(toPaisa(calculatedTotalValue))}</strong>
          </span>
        ) : null}
      </div>

      {comboRows.length === 0 ? (
        <div className='rounded-md border border-dashed border-border/80 p-4 text-center text-xs text-muted-foreground'>
          {t('noItemsAdded')}
        </div>
      ) : (
        <div className='space-y-2'>
          {comboRows.map((row, idx) => (
            <div
              key={row.id}
              className='flex items-center gap-2 rounded-md border border-border bg-background p-2 text-xs w-full min-w-0'
            >
              <div className='flex-1 min-w-0'>
                <DishCombobox
                  value={row.menuItemId}
                  onSelect={(dish) => onSelectDish(idx, dish.id)}
                  dishes={availableDishes}
                  disabled={isPending}
                />
              </div>

              <div className='flex items-center gap-1 rounded-md border border-input bg-background p-0.5 shrink-0'>
                <button
                  type='button'
                  onClick={() => onQtyChange(idx, -1)}
                  disabled={row.quantity <= 1 || isPending}
                  className='flex size-6 items-center justify-center rounded hover:bg-muted disabled:opacity-40 transition-colors cursor-pointer'
                  aria-label={t('decreaseQty')}
                >
                  <IconMinus className='size-3' />
                </button>
                <span className='w-5 text-center font-semibold text-xs'>{row.quantity}</span>
                <button
                  type='button'
                  onClick={() => onQtyChange(idx, 1)}
                  disabled={isPending}
                  className='flex size-6 items-center justify-center rounded hover:bg-muted transition-colors cursor-pointer'
                  aria-label={t('increaseQty')}
                >
                  <IconPlus className='size-3' />
                </button>
              </div>

              {row.unitPrice > 0 ? (
                <span className='text-[11px] font-semibold text-muted-foreground w-14 sm:w-16 text-end shrink-0 whitespace-nowrap'>
                  {formatPkr(toPaisa(row.unitPrice * row.quantity))}
                </span>
              ) : null}

              <Button
                type='button'
                variant='ghost'
                size='icon'
                onClick={() => onRemoveRow(idx)}
                disabled={isPending}
                className='size-7 text-muted-foreground hover:text-destructive shrink-0'
                aria-label={t('removeItem')}
              >
                <IconTrash className='size-3.5' />
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className='flex flex-wrap items-center justify-between gap-2 pt-1 w-full min-w-0'>
        <div className='flex items-center gap-2'>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={onAddDish}
            disabled={isPending || availableDishes.length === 0}
            className='h-7 gap-1 text-xs'
          >
            <IconPlus className='size-3' />
            <span>{t('addDishFromMenu')}</span>
          </Button>
        </div>

        {calculatedTotalValue > 0 ? (
          <Button
            type='button'
            variant='secondary'
            size='sm'
            onClick={handleSetPrice}
            disabled={isPending}
            className='h-7 text-xs font-medium'
          >
            {t('setOriginalPriceTo')} {formatPkr(toPaisa(calculatedTotalValue))}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
