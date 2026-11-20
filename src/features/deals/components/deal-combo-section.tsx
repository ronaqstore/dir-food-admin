'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { IconPlus, IconTrash, IconMinus, IconToolsKitchen2, IconReceipt } from '@tabler/icons-react';
import { toPaisa, formatPkr } from '@/lib/money';
import { DishCombobox } from './dish-combobox';
import type { DealComboSectionProps } from '../types';

export function DealComboSection({
  comboRows,
  availableDishes,
  calculatedTotalValue,
  isPending,
  onSelectDish,
  onVariantChange,
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
    <div className='rounded-2xl border border-border/80 bg-muted/20 p-4 space-y-3.5 w-full min-w-0'>
      <div className='flex flex-wrap items-center justify-between gap-2'>
        <div className='flex items-center gap-1.5'>
          <IconToolsKitchen2 className='size-4 text-primary' />
          <Label className='text-xs font-semibold text-foreground'>{t('dishesInCombo')}</Label>
        </div>
        {calculatedTotalValue > 0 ? (
          <div className='flex items-center gap-1.5 rounded-full border border-border/80 bg-background px-3 py-1 shadow-2xs'>
            <span className='text-[11px] text-muted-foreground'>{t('standardValue')}</span>
            <strong className='text-xs font-bold text-foreground'>{formatPkr(toPaisa(calculatedTotalValue))}</strong>
          </div>
        ) : null}
      </div>

      {comboRows.length === 0 ? (
        <button
          type='button'
          onClick={onAddDish}
          className='flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border/80 p-5 text-center text-xs text-muted-foreground hover:border-primary/50 hover:text-foreground hover:bg-muted/30 transition-all cursor-pointer'
        >
          <IconPlus className='size-4 text-primary' />
          <span className='font-medium'>{t('addDishFromMenu')}</span>
        </button>
      ) : (
        <div className='space-y-2'>
          {comboRows.map((row, idx) => {
            const selectedDish = availableDishes.find((d) => d.id === row.menuItemId);
            const activeVariants =
              selectedDish?.variants?.filter((v) => v.isActive !== false) ||
              selectedDish?.variants ||
              [];
            const hasVariants = activeVariants.length > 0;

            return (
              <div
                key={row.id}
                className='flex flex-col sm:flex-row items-stretch sm:items-center gap-2 rounded-xl border border-border/80 bg-background p-2.5 text-xs w-full min-w-0 shadow-2xs transition-colors hover:border-border'
              >
                <div className='flex flex-1 items-center gap-2 min-w-0'>
                  <div className='flex-1 min-w-0'>
                    <DishCombobox
                      value={row.menuItemId}
                      onSelect={(dish) => onSelectDish(idx, dish.id)}
                      dishes={availableDishes}
                      disabled={isPending}
                    />
                  </div>

                  {hasVariants && selectedDish ? (
                    <div className='w-36 sm:w-44 shrink-0'>
                      <select
                        value={row.variantId || activeVariants[0]?.id || ''}
                        onChange={(e) => onVariantChange?.(idx, e.target.value)}
                        disabled={isPending}
                        aria-label={t('selectVariant')}
                        className='h-9 w-full rounded-xl border border-border/80 bg-background px-2.5 text-xs font-medium text-foreground transition-colors focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50 cursor-pointer shadow-2xs'
                      >
                        {activeVariants.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.name} ({formatPkr(v.price)})
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : null}
                </div>

                <div className='flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-1 sm:pt-0 border-t border-border/40 sm:border-0'>
                  <div className='flex items-center rounded-lg border border-border/70 bg-muted/30 p-0.5 shrink-0'>
                    <button
                      type='button'
                      onClick={() => onQtyChange(idx, -1)}
                      disabled={row.quantity <= 1 || isPending}
                      className='flex size-7 items-center justify-center rounded-md hover:bg-background text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors cursor-pointer'
                      aria-label={t('decreaseQty')}
                    >
                      <IconMinus className='size-3.5' />
                    </button>
                    <span className='w-6 text-center text-xs font-bold text-foreground select-none'>{row.quantity}</span>
                    <button
                      type='button'
                      onClick={() => onQtyChange(idx, 1)}
                      disabled={isPending}
                      className='flex size-7 items-center justify-center rounded-md hover:bg-background text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors cursor-pointer'
                      aria-label={t('increaseQty')}
                    >
                      <IconPlus className='size-3.5' />
                    </button>
                  </div>

                  {row.unitPrice > 0 ? (
                    <span className='w-16 sm:w-20 text-end text-xs font-bold text-foreground shrink-0 tabular-nums'>
                      {formatPkr(toPaisa(row.unitPrice * row.quantity))}
                    </span>
                  ) : null}

                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    onClick={() => onRemoveRow(idx)}
                    disabled={isPending}
                    className='size-8 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive shrink-0'
                    aria-label={t('removeItem')}
                  >
                    <IconTrash className='size-4' />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className='flex flex-wrap items-center justify-between gap-2 pt-1 w-full min-w-0'>
        <Button
          type='button'
          variant='outline'
          onClick={onAddDish}
          disabled={isPending || availableDishes.length === 0}
          className='h-9 gap-1.5 rounded-lg border-dashed text-xs font-semibold hover:border-primary hover:text-primary shadow-2xs'
        >
          <IconPlus className='size-3.5' />
          <span>{t('addDishFromMenu')}</span>
        </Button>

        {calculatedTotalValue > 0 ? (
          <Button
            type='button'
            variant='secondary'
            onClick={handleSetPrice}
            disabled={isPending}
            className='h-9 gap-1.5 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-500/20 shadow-2xs'
          >
            <IconReceipt className='size-3.5' />
            <span>{t('setOriginalPriceTo')} {formatPkr(toPaisa(calculatedTotalValue))}</span>
          </Button>
        ) : null}
      </div>
    </div>
  );
}
