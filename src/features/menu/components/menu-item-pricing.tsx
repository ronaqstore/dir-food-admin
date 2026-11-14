import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import type { MenuItemPricingProps, VariantField } from '../types';

export function MenuItemPricing({
  pricingMode,
  onPricingModeChange,
  basePrice,
  onBasePriceChange,
  originalPrice,
  onOriginalPriceChange,
  variants,
  onAddVariant,
  onRemoveVariant,
  onVariantChange,
  errors,
  isPending,
  t
}: MenuItemPricingProps) {
  const handleSelectFixed = () => {
    onPricingModeChange('fixed');
  };

  const handleSelectVariants = () => {
    onPricingModeChange('variants');
  };

  const discountPercent =
    originalPrice && basePrice && Number(originalPrice) > Number(basePrice)
      ? Math.round(((Number(originalPrice) - Number(basePrice)) / Number(originalPrice)) * 100)
      : 0;

  return (
    <>
      <div className='space-y-2 pt-1'>
        <Label>{t('menuItems.pricingType')}</Label>
        <div className='grid grid-cols-2 gap-2'>
          <button
            type='button'
            onClick={handleSelectFixed}
            className={`rounded-lg border p-3 text-start transition-all cursor-pointer ${
              pricingMode === 'fixed'
                ? 'border-primary bg-primary/5 ring-1 ring-primary'
                : 'border-border hover:bg-muted/50'
            }`}
          >
            <p className='text-sm font-semibold'>{t('menuItems.fixedPrice')}</p>
            <p className='text-xs text-muted-foreground mt-0.5'>
              {t('menuItems.fixedPriceDesc')}
            </p>
          </button>
          <button
            type='button'
            onClick={handleSelectVariants}
            className={`rounded-lg border p-3 text-start transition-all cursor-pointer ${
              pricingMode === 'variants'
                ? 'border-primary bg-primary/5 ring-1 ring-primary'
                : 'border-border hover:bg-muted/50'
            }`}
          >
            <p className='text-sm font-semibold'>{t('menuItems.hasVariants')}</p>
            <p className='text-xs text-muted-foreground mt-0.5'>
              {t('menuItems.hasVariantsDesc')}
            </p>
          </button>
        </div>
      </div>

      {pricingMode === 'fixed' ? (
        <div className='space-y-3'>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
            <div className='space-y-1.5'>
              <Label htmlFor='base-price'>
                {t('menuItems.price')}
                <span className='text-destructive ms-1'>*</span>
              </Label>
              <div className='relative'>
                <span className='absolute inset-s-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium'>
                  {t('common.currency')}
                </span>
                <Input
                  id='base-price'
                  type='number'
                  min='0'
                  step='1'
                  value={basePrice}
                  onChange={(e) => onBasePriceChange(e.target.value)}
                  placeholder={t('menuItems.pricePlaceholder')}
                  disabled={isPending}
                  className='ps-11'
                />
              </div>
              {errors.basePrice ? (
                <p className='text-xs text-destructive'>{errors.basePrice}</p>
              ) : null}
            </div>

            <div className='space-y-1.5'>
              <div className='flex items-center justify-between'>
                <Label htmlFor='original-price'>{t('menuItems.originalPrice')}</Label>
                <span className='text-[10px] text-muted-foreground'>{t('common.optional')}</span>
              </div>
              <div className='relative'>
                <span className='absolute inset-s-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium'>
                  {t('common.currency')}
                </span>
                <Input
                  id='original-price'
                  type='number'
                  min='0'
                  step='1'
                  value={originalPrice}
                  onChange={(e) => onOriginalPriceChange(e.target.value)}
                  placeholder={t('menuItems.originalPricePlaceholder')}
                  disabled={isPending}
                  className='ps-11'
                />
              </div>
              {errors.originalPrice ? (
                <p className='text-xs text-destructive'>{errors.originalPrice}</p>
              ) : null}
            </div>
          </div>

          {discountPercent > 0 ? (
            <div className='rounded-lg bg-muted/50 p-2.5 text-xs text-muted-foreground'>
              {t('menuItems.displayPrice')} <span className='line-through'>{t('common.currency')} {originalPrice}</span>{' '}
              <span className='font-semibold text-foreground'>{t('common.currency')} {basePrice}</span>{' '}
              ({discountPercent}{t('menuItems.percentOff')}
            </div>
          ) : null}
        </div>
      ) : (
        <div className='space-y-3'>
          <div className='flex items-center justify-between'>
            <Label>{t('menuItems.variants')}</Label>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={onAddVariant}
              disabled={isPending || variants.length >= 8}
              className='h-7 gap-1 text-xs'
            >
              <IconPlus className='size-3.5' />
              <span>{t('menuItems.addVariant')}</span>
            </Button>
          </div>

          <div className='space-y-2'>
            {variants.map((v: VariantField, index: number) => (
              <div key={index} className='flex items-center gap-2'>
                <Input
                  value={v.name}
                  onChange={(e) => onVariantChange(index, 'name', e.target.value)}
                  placeholder={t('menuItems.variantPlaceholder')}
                  disabled={isPending}
                  className='flex-1'
                />
                <div className='relative w-36'>
                  <span className='absolute inset-s-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium'>
                    {t('common.currency')}
                  </span>
                  <Input
                    type='number'
                    min='0'
                    step='1'
                    value={v.price}
                    onChange={(e) => onVariantChange(index, 'price', e.target.value)}
                    placeholder={t('menuItems.amountPlaceholder')}
                    disabled={isPending}
                    className='ps-10'
                  />
                </div>
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  onClick={() => onRemoveVariant(index)}
                  disabled={isPending || variants.length <= 1}
                  className='h-9 w-9 text-muted-foreground hover:text-destructive'
                  aria-label={t('menuItems.removeVariant')}
                >
                  <IconTrash className='size-4' />
                </Button>
              </div>
            ))}
          </div>
          {errors.variants ? (
            <p className='text-xs text-destructive'>{errors.variants}</p>
          ) : null}
        </div>
      )}
    </>
  );
}

