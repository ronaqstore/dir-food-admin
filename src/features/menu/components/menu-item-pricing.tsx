import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { IconPlus, IconTrash, IconCoin, IconScale, IconSquarePlus } from '@tabler/icons-react';
import type { MenuItemPricingProps, VariantField, AddonField } from '../types';

export function MenuItemPricing({
  pricingMode,
  onPricingModeChange,
  basePrice,
  onBasePriceChange,
  variants,
  onAddVariant,
  onRemoveVariant,
  onVariantChange,
  addons,
  onAddAddon,
  onRemoveAddon,
  onAddonChange,
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

  return (
    <>
      <div className='space-y-2 pt-1'>
        <Label className='text-xs font-semibold text-foreground'>
          {t('menuItems.pricingType')}
        </Label>
        <div className='grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-muted/60 border border-border/60'>
          <button
            type='button'
            onClick={handleSelectFixed}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              pricingMode === 'fixed'
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <IconCoin className={`size-4 ${pricingMode === 'fixed' ? 'text-primary' : 'text-muted-foreground'}`} />
            <span>{t('menuItems.fixedPrice')}</span>
          </button>
          <button
            type='button'
            onClick={handleSelectVariants}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              pricingMode === 'variants'
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <IconScale className={`size-4 ${pricingMode === 'variants' ? 'text-primary' : 'text-muted-foreground'}`} />
            <span>{t('menuItems.hasVariants')}</span>
          </button>
        </div>
      </div>

      {pricingMode === 'fixed' ? (
        <div className='max-w-xs space-y-1.5'>
          <Label htmlFor='base-price' className='text-xs font-semibold text-foreground'>
            {t('menuItems.price')}
            <span className='text-destructive ms-1'>*</span>
          </Label>
          <div className='relative'>
            <span className='absolute inset-s-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground select-none'>
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
              className='ps-11 h-10 rounded-xl font-semibold text-sm shadow-2xs'
            />
          </div>
          {errors.basePrice ? (
            <p className='text-xs text-destructive'>{errors.basePrice}</p>
          ) : null}
        </div>
      ) : (
        <div className='space-y-3 rounded-2xl border border-border/70 bg-muted/20 p-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <IconScale className='size-4 text-primary' />
              <Label className='text-xs font-semibold text-foreground'>{t('menuItems.variants')}</Label>
            </div>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={onAddVariant}
              disabled={isPending || variants.length >= 8}
              className='h-7.5 gap-1 rounded-lg text-xs font-medium shadow-2xs'
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
                  className='flex-1 h-9 rounded-lg bg-background'
                />
                <div className='relative w-36'>
                  <span className='absolute inset-s-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium select-none'>
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
                    className='ps-10 h-9 rounded-lg bg-background'
                  />
                </div>
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  onClick={() => onRemoveVariant(index)}
                  disabled={isPending || variants.length <= 1}
                  className='h-9 w-9 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive'
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

      <div className='space-y-3 rounded-2xl border border-border/70 bg-muted/20 p-3.5'>
        <div className='flex items-center justify-between gap-2'>
          <div className='flex items-center gap-1.5'>
            <IconSquarePlus className='size-4 text-primary' />
            <Label className='text-xs font-semibold text-foreground'>{t('menuItems.addonsTitle')}</Label>
          </div>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={onAddAddon}
            disabled={isPending || addons.length >= 12}
            className='h-7.5 gap-1 rounded-lg text-xs font-medium shrink-0 shadow-2xs'
          >
            <IconPlus className='size-3.5' />
            <span>{t('menuItems.addAddon')}</span>
          </Button>
        </div>

        {addons.length > 0 ? (
          <div className='space-y-2 pt-1'>
            {addons.map((a: AddonField, index: number) => (
              <div key={index} className='flex items-center gap-2'>
                <Input
                  value={a.name}
                  onChange={(e) => onAddonChange(index, 'name', e.target.value)}
                  placeholder={t('menuItems.addonNamePlaceholder')}
                  disabled={isPending}
                  className='flex-1 h-9 rounded-lg bg-background'
                />
                <div className='relative w-36'>
                  <span className='absolute inset-s-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium select-none'>
                    {t('common.currency')}
                  </span>
                  <Input
                    type='number'
                    min='0'
                    step='1'
                    value={a.price}
                    onChange={(e) => onAddonChange(index, 'price', e.target.value)}
                    placeholder={t('menuItems.amountPlaceholder')}
                    disabled={isPending}
                    className='ps-10 h-9 rounded-lg bg-background'
                  />
                </div>
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  onClick={() => onRemoveAddon(index)}
                  disabled={isPending}
                  className='h-9 w-9 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive'
                  aria-label={t('menuItems.removeAddon')}
                >
                  <IconTrash className='size-4' />
                </Button>
              </div>
            ))}
          </div>
        ) : null}
        {errors.addons ? <p className='text-xs text-destructive'>{errors.addons}</p> : null}
      </div>
    </>
  );
}
