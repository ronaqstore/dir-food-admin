import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { IconPencil, IconPhoto, IconToolsKitchen2 } from '@tabler/icons-react';
import { formatPkr } from '@/lib/money';
import type { FoodCardProps } from '../types';

export function FoodCard({
  item,
  categories,
  onEdit,
  onToggleAvailability,
  isPending,
  t
}: FoodCardProps) {
  const hasVariants = item.variants && item.variants.length > 0;
  const categoryName = item.category?.name || categories?.find((c) => c.id === item.categoryId)?.name;

  return (
    <div
      className={`group relative flex flex-col justify-between rounded-xl border bg-card p-3.5 shadow-xs transition-all duration-150 hover:border-primary/40 hover:shadow-md ${
        !item.isAvailable ? 'bg-muted/20 border-dashed opacity-80' : ''
      }`}
    >
      <div>
        <div className='flex gap-3 items-start mb-2.5'>
          <div className='relative size-20 shrink-0 overflow-hidden rounded-xl border bg-gradient-to-br from-muted/50 to-muted/80 shadow-2xs'>
            {item.imageUrl ? (
              <Image
                src={item.imageUrl}
                alt={item.name}
                fill
                unoptimized
                className={`object-cover transition-transform duration-300 group-hover:scale-105 ${
                  !item.isAvailable ? 'grayscale-50' : ''
                }`}
              />
            ) : (
              <div className='flex size-full flex-col items-center justify-center text-muted-foreground/40 bg-primary/5'>
                <IconToolsKitchen2 className='size-6 text-primary/40' />
              </div>
            )}

            {!item.isAvailable && (
              <div className='absolute inset-0 bg-background/70 backdrop-blur-[1px] flex items-center justify-center p-1 text-center'>
                <span className='text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-500/10 px-1 py-0.5 rounded'>
                  {t('menuItems.soldOut')}
                </span>
              </div>
            )}
          </div>

          <div className='min-w-0 flex-1'>
            <div className='flex items-center gap-1.5 flex-wrap mb-1'>
              {categoryName ? (
                <Badge variant='outline' className='text-[10px] font-normal px-1.5 py-0 border-muted-foreground/20 text-muted-foreground'>
                  {categoryName}
                </Badge>
              ) : null}
              {item.isDeal ? (
                <Badge className='bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30 text-[10px] font-bold px-1.5 py-0'>
                  🔥 {t('menuItems.dealBadge')}
                </Badge>
              ) : null}
            </div>

            <h3 className='font-semibold text-foreground text-sm leading-snug line-clamp-1 group-hover:text-primary transition-colors'>
              {item.name}
            </h3>

            {item.description ? (
              <p className='text-xs text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed'>
                {item.description}
              </p>
            ) : null}
          </div>
        </div>

        <div className='mb-3'>
          {hasVariants ? (
            <div className='flex flex-wrap gap-1.5'>
              {item.variants.map((v) => (
                <span
                  key={v.id}
                  className='inline-flex items-center rounded-md bg-muted/60 px-2 py-0.5 text-[11px] font-medium text-foreground'
                >
                  <span className='font-semibold text-primary me-1'>{v.name}:</span>
                  {formatPkr(v.price)}
                </span>
              ))}
            </div>
          ) : item.originalPrice != null && item.basePrice != null && item.originalPrice > item.basePrice ? (
            <div className='flex items-baseline gap-1.5 flex-wrap'>
              <span className='text-sm font-bold text-rose-600 dark:text-rose-400'>
                {formatPkr(item.basePrice)}
              </span>
              <span className='text-xs text-muted-foreground line-through'>
                {formatPkr(item.originalPrice)}
              </span>
              <span className='text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1 py-0.2 rounded'>
                {Math.round(((item.originalPrice - item.basePrice) / item.originalPrice) * 100)}{t('menuItems.percentOffBadge')}
              </span>
            </div>
          ) : (
            <div className='flex items-baseline gap-1'>
              <span className='text-sm font-bold text-foreground'>
                {item.basePrice != null ? formatPkr(item.basePrice) : formatPkr(0)}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className='flex items-center justify-between border-t pt-2.5 mt-auto'>
        <div className='flex items-center gap-2'>
          <Switch
            checked={item.isAvailable}
            onCheckedChange={() => onToggleAvailability(item)}
            disabled={isPending}
            aria-label={item.name}
          />
          <span
            className={`text-xs font-medium flex items-center gap-1 ${
              item.isAvailable
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-amber-600 dark:text-amber-400 font-normal'
            }`}
          >
            <span
              className={`size-1.5 rounded-full ${
                item.isAvailable ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
            {item.isAvailable ? t('menuItems.available') : t('menuItems.soldOut')}
          </span>
        </div>

        <Button
          type='button'
          variant='ghost'
          size='sm'
          onClick={() => onEdit(item)}
          className='h-7 px-2.5 gap-1 text-xs hover:bg-muted text-muted-foreground hover:text-foreground'
        >
          <IconPencil className='size-3.5' />
          <span>{t('common.edit')}</span>
        </Button>
      </div>
    </div>
  );
}

export function FoodListItem({
  item,
  categories,
  onEdit,
  onToggleAvailability,
  isPending,
  t
}: FoodCardProps) {
  const hasVariants = item.variants && item.variants.length > 0;
  const categoryName = item.category?.name || categories?.find((c) => c.id === item.categoryId)?.name;

  return (
    <div
      className={`flex items-center justify-between gap-3 p-3 transition-colors hover:bg-muted/40 ${
        !item.isAvailable ? 'opacity-70 bg-muted/20' : ''
      }`}
    >
      <div className='flex items-center gap-3 min-w-0 flex-1'>
        <div className='relative size-12 shrink-0 overflow-hidden rounded-lg border bg-muted'>
          {item.imageUrl ? (
            <Image
              src={item.imageUrl}
              alt={item.name}
              fill
              unoptimized
              className='object-cover'
            />
          ) : (
            <div className='flex size-full items-center justify-center text-muted-foreground/40'>
              <IconPhoto className='size-5' />
            </div>
          )}
        </div>

        <div className='min-w-0 flex-1'>
          <div className='flex items-center gap-2'>
            <h4 className='font-semibold text-sm text-foreground truncate'>
              {item.name}
            </h4>
            {item.isDeal ? (
              <Badge className='bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30 text-[10px] font-bold px-1.5 py-0 shrink-0'>
                🔥 {t('menuItems.dealBadge')}
              </Badge>
            ) : null}
            {categoryName ? (
              <Badge variant='outline' className='text-[10px] font-normal px-1.5 py-0 border-muted-foreground/20 text-muted-foreground shrink-0 hidden sm:inline-flex'>
                {categoryName}
              </Badge>
            ) : null}
          </div>

          <div className='flex items-center gap-2 mt-0.5 text-xs text-muted-foreground'>
            {hasVariants ? (
              <span className='font-medium text-foreground'>
                {item.variants.map((v) => `${v.name}: ${formatPkr(v.price)}`).join(' • ')}
              </span>
            ) : item.originalPrice != null && item.basePrice != null && item.originalPrice > item.basePrice ? (
              <div className='flex items-baseline gap-1.5'>
                <span className='font-bold text-rose-600 dark:text-rose-400'>
                  {formatPkr(item.basePrice)}
                </span>
                <span className='line-through text-muted-foreground text-[11px]'>
                  {formatPkr(item.originalPrice)}
                </span>
                <span className='text-[10px] font-bold text-emerald-600 dark:text-emerald-400'>
                  {Math.round(((item.originalPrice - item.basePrice) / item.originalPrice) * 100)}{t('menuItems.percentOffBadge')}
                </span>
              </div>
            ) : (
              <span className='font-bold text-foreground'>
                {item.basePrice != null ? formatPkr(item.basePrice) : formatPkr(0)}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className='flex items-center gap-3 shrink-0'>
        <div className='flex items-center gap-1.5'>
          <Switch
            checked={item.isAvailable}
            onCheckedChange={() => onToggleAvailability(item)}
            disabled={isPending}
            aria-label={item.name}
          />
          <span className='text-xs font-medium hidden md:inline-block'>
            {item.isAvailable ? (
              <span className='text-emerald-600 dark:text-emerald-400'>{t('menuItems.available')}</span>
            ) : (
              <span className='text-amber-600 dark:text-amber-400'>{t('menuItems.soldOut')}</span>
            )}
          </span>
        </div>

        <Button
          type='button'
          variant='outline'
          size='sm'
          onClick={() => onEdit(item)}
          className='h-7 px-2 text-xs gap-1'
        >
          <IconPencil className='size-3.5' />
          <span className='hidden sm:inline'>{t('common.edit')}</span>
        </Button>
      </div>
    </div>
  );
}

