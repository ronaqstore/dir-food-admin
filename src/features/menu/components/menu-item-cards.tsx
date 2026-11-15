import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell
} from '@/components/ui/table';
import { IconPencil, IconPhoto, IconToolsKitchen2 } from '@tabler/icons-react';
import { formatPkr } from '@/lib/money';
import { calcDiscountPct } from '../lib/sort-utils';
import type { FoodCardProps, FoodTableViewProps } from '../types';

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
  const discountPct = calcDiscountPct(item.basePrice, item.originalPrice);

  return (
    <div
      className={`group relative flex flex-col justify-between rounded-xl border bg-card overflow-hidden shadow-xs transition-all duration-200 hover:border-primary/40 hover:shadow-md min-w-0 ${
        !item.isAvailable ? 'bg-muted/20 border-dashed opacity-85' : ''
      }`}
    >
      <div className='min-w-0'>
        <div className='relative h-44 w-full bg-muted/60 overflow-hidden'>
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
              <IconToolsKitchen2 className='size-10 text-primary/30' />
            </div>
          )}

          <div className='absolute top-2.5 inset-s-2.5 flex items-center gap-1.5 flex-wrap'>
            {categoryName ? (
              <Badge className='bg-background/90 text-foreground backdrop-blur-xs text-[11px] font-medium shadow-xs border-0 px-2 py-0.5'>
                {categoryName}
              </Badge>
            ) : null}
            {item.isDeal ? (
              <Badge className='bg-rose-500 text-white text-[11px] font-bold px-2 py-0.5 shadow-xs border-0'>
                🔥 {t('menuItems.dealBadge')}
              </Badge>
            ) : null}
          </div>

          {discountPct > 0 ? (
            <div className='absolute top-2.5 inset-e-2.5'>
              <Badge className='bg-rose-600 text-white font-bold text-[10px] px-2 py-0.5 shadow-xs border-0'>
                {discountPct}{t('menuItems.percentOffBadge')}
              </Badge>
            </div>
          ) : null}

          {!item.isAvailable && (
            <div className='absolute inset-0 bg-background/80 backdrop-blur-[2px] flex items-center justify-center p-2 text-center'>
              <span className='text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2.5 py-1 rounded-full'>
                {t('menuItems.soldOut')}
              </span>
            </div>
          )}
        </div>

        <div className='p-4 space-y-2.5 min-w-0'>
          <div className='space-y-1 min-w-0'>
            <h3 className='font-semibold text-foreground text-base leading-snug truncate group-hover:text-primary transition-colors' title={item.name}>
              {item.name}
            </h3>
            {item.description ? (
              <p className='text-xs text-muted-foreground line-clamp-2 leading-relaxed min-h-[2rem]'>
                {item.description}
              </p>
            ) : (
              <div className='min-h-[2rem]' />
            )}
          </div>

          <div className='pt-1'>
            {hasVariants ? (
              <div className='flex flex-wrap gap-1.5'>
                {item.variants.map((v) => (
                  <span
                    key={v.id}
                    className='inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-foreground'
                  >
                    <span className='font-semibold text-primary me-1'>{v.name}:</span>
                    {formatPkr(v.price)}
                  </span>
                ))}
              </div>
            ) : discountPct > 0 ? (
              <div className='flex items-baseline gap-2 flex-wrap'>
                <span className='text-base font-bold text-rose-600 dark:text-rose-400 font-mono'>
                  {formatPkr(item.basePrice ?? 0)}
                </span>
                <span className='text-xs text-muted-foreground line-through font-mono'>
                  {formatPkr(item.originalPrice ?? 0)}
                </span>
              </div>
            ) : (
              <div className='flex items-baseline gap-1'>
                <span className='text-base font-bold text-foreground font-mono'>
                  {item.basePrice != null ? formatPkr(item.basePrice) : formatPkr(0)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className='flex items-center justify-between border-t p-3 bg-muted/10 mt-auto'>
        <div className='flex items-center gap-2'>
          <Switch
            checked={item.isAvailable}
            onCheckedChange={() => onToggleAvailability(item)}
            disabled={isPending}
            aria-label={item.name}
          />
          <span
            className={`text-xs font-medium flex items-center gap-1.5 ${
              item.isAvailable
                ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                : 'text-amber-600 dark:text-amber-400'
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
          className='h-8 px-2.5 gap-1.5 text-xs text-muted-foreground hover:text-foreground'
        >
          <IconPencil className='size-3.5' />
          <span>{t('common.edit')}</span>
        </Button>
      </div>
    </div>
  );
}

export function FoodTableView({
  items,
  categories,
  onEdit,
  onToggleAvailability,
  isPending,
  t
}: FoodTableViewProps) {
  return (
    <div className='rounded-xl border bg-card shadow-xs overflow-hidden'>
      <Table>
        <TableHeader className='bg-muted/40'>
          <TableRow className='hover:bg-transparent'>
            <TableHead className='ps-4 w-[38%] min-w-[240px]'>{t('common.productName')}</TableHead>
            <TableHead className='w-[18%] min-w-[120px]'>{t('common.category')}</TableHead>
            <TableHead className='w-[22%] min-w-[140px]'>{t('common.price')}</TableHead>
            <TableHead className='w-[14%] min-w-[120px]'>{t('menuItems.isAvailable')}</TableHead>
            <TableHead className='pe-4 text-end w-[8%] min-w-[80px]'>{t('table.actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            const hasVariants = item.variants && item.variants.length > 0;
            const categoryName = item.category?.name || categories?.find((c) => c.id === item.categoryId)?.name;
            const discountPct = calcDiscountPct(item.basePrice, item.originalPrice);

            return (
              <TableRow
                key={item.id}
                className={`transition-colors hover:bg-muted/50 ${
                  !item.isAvailable ? 'opacity-70 bg-muted/10' : ''
                }`}
              >
                <TableCell className='ps-4 py-3'>
                  <div className='flex items-center gap-3 min-w-0'>
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
                      <div className='flex items-center gap-1.5'>
                        <span className='font-semibold text-sm text-foreground truncate'>
                          {item.name}
                        </span>
                        {item.isDeal ? (
                          <Badge className='bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30 text-[10px] font-bold px-1.5 py-0 shrink-0'>
                            🔥 {t('menuItems.dealBadge')}
                          </Badge>
                        ) : null}
                      </div>
                      {item.description ? (
                        <p className='text-xs text-muted-foreground truncate max-w-sm mt-0.5'>
                          {item.description}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </TableCell>

                <TableCell className='py-3'>
                  {categoryName ? (
                    <Badge variant='outline' className='text-xs font-normal border-muted-foreground/20 text-muted-foreground'>
                      {categoryName}
                    </Badge>
                  ) : (
                    <span className='text-xs text-muted-foreground'>—</span>
                  )}
                </TableCell>

                <TableCell className='py-3 font-mono text-xs'>
                  {hasVariants ? (
                    <div className='flex flex-wrap gap-1'>
                      {item.variants.map((v) => (
                        <span
                          key={v.id}
                          className='inline-flex items-center rounded bg-muted/60 px-1.5 py-0.5 text-[11px] text-foreground'
                        >
                          <span className='font-semibold text-primary me-1'>{v.name}:</span>
                          {formatPkr(v.price)}
                        </span>
                      ))}
                    </div>
                  ) : discountPct > 0 ? (
                    <div className='flex items-baseline gap-1.5 flex-wrap'>
                      <span className='font-bold text-rose-600 dark:text-rose-400'>
                        {formatPkr(item.basePrice ?? 0)}
                      </span>
                      <span className='line-through text-muted-foreground text-[11px]'>
                        {formatPkr(item.originalPrice ?? 0)}
                      </span>
                      <Badge className='bg-rose-500/10 text-rose-600 dark:text-rose-400 border-0 text-[10px] px-1 py-0'>
                        {discountPct}{t('menuItems.percentOffBadge')}
                      </Badge>
                    </div>
                  ) : (
                    <span className='font-semibold text-foreground'>
                      {item.basePrice != null ? formatPkr(item.basePrice) : formatPkr(0)}
                    </span>
                  )}
                </TableCell>

                <TableCell className='py-3'>
                  <div className='flex items-center gap-2'>
                    <Switch
                      checked={item.isAvailable}
                      onCheckedChange={() => onToggleAvailability(item)}
                      disabled={isPending}
                      aria-label={item.name}
                    />
                    <Badge
                      variant={item.isAvailable ? 'default' : 'outline'}
                      className={
                        item.isAvailable
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                          : 'text-amber-600 dark:text-amber-400 border-amber-500/20'
                      }
                    >
                      {item.isAvailable ? t('menuItems.available') : t('menuItems.soldOut')}
                    </Badge>
                  </div>
                </TableCell>

                <TableCell className='pe-4 py-3 text-end'>
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    onClick={() => onEdit(item)}
                    className='h-8 px-2.5 gap-1 text-xs text-muted-foreground hover:text-foreground'
                  >
                    <IconPencil className='size-3.5' />
                    <span>{t('common.edit')}</span>
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
