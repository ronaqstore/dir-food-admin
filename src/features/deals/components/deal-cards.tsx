'use client';

import * as React from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  IconPencil,
  IconPhoto,
  IconTrash
} from '@tabler/icons-react';
import { formatPkr, fromPaisa } from '@/lib/money';
import type { DealCardProps } from '../types';

export function DealCard({
  deal,
  isPending,
  onToggleAvailability,
  onEdit,
  onDelete
}: DealCardProps) {
  const t = useTranslations('deals');
  const origPrice = deal.originalPrice;
  const basePrice = deal.basePrice;
  const hasDiscount =
    origPrice != null &&
    basePrice != null &&
    origPrice > basePrice;
  const discountPct =
    hasDiscount && origPrice != null && basePrice != null
      ? Math.round(
          ((fromPaisa(origPrice) - fromPaisa(basePrice)) /
            fromPaisa(origPrice)) *
            100
        )
      : 0;

  const comboItems = React.useMemo(() => {
    return deal.description
      ? deal.description.split('+').map((s) => s.trim()).filter(Boolean)
      : [];
  }, [deal.description]);

  const handleToggle = () => {
    onToggleAvailability(deal);
  };

  const handleEdit = () => {
    onEdit(deal);
  };

  const handleDelete = () => {
    onDelete(deal);
  };

  return (
    <div className='rounded-xl border bg-card overflow-hidden shadow-xs flex flex-col justify-between hover:border-border/80 transition-colors min-w-0'>
      <div className='min-w-0'>
        {deal.imageUrl ? (
          <div className='relative h-36 w-full bg-muted overflow-hidden'>
            <Image
              src={deal.imageUrl}
              alt={deal.name}
              fill
              unoptimized
              className='object-cover'
            />
            {discountPct > 0 ? (
              <div className='absolute top-2.5 inset-s-2.5'>
                <Badge className='bg-rose-600 text-white font-semibold text-[10px] px-2'>
                  {discountPct}{t('percentOffBadge')}
                </Badge>
              </div>
            ) : null}
          </div>
        ) : (
          <div className='p-3.5 pb-0 flex items-center justify-between min-w-0'>
            <Badge variant='outline' className='text-[10px] font-medium truncate max-w-[70%]'>
              {deal.category?.name || 'Combo Deal'}
            </Badge>
            {discountPct > 0 ? (
              <Badge className='bg-rose-600 text-white font-semibold text-[10px] px-2 shrink-0'>
                {discountPct}{t('percentOffBadge')}
              </Badge>
            ) : null}
          </div>
        )}

        <div className='p-3.5 space-y-2.5 min-w-0'>
          <div className='space-y-0.5 min-w-0'>
            <h3 className='font-semibold text-sm text-foreground truncate' title={deal.name}>
              {deal.name}
            </h3>
            {deal.category?.name && deal.imageUrl ? (
              <p className='text-[11px] text-muted-foreground truncate'>{deal.category.name}</p>
            ) : null}
          </div>

          {comboItems.length > 0 ? (
            <div className='flex flex-wrap gap-1 max-h-16 overflow-y-auto'>
              {comboItems.map((item, idx) => (
                <span
                  key={idx}
                  className='inline-flex items-center rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-foreground truncate max-w-full'
                  title={item}
                >
                  {item}
                </span>
              ))}
            </div>
          ) : null}

          <div className='flex items-baseline gap-2 pt-0.5'>
            <span className='text-base font-bold text-foreground'>
              {deal.basePrice != null ? formatPkr(deal.basePrice) : formatPkr(0)}
            </span>
            {hasDiscount && origPrice != null ? (
              <span className='text-xs line-through text-muted-foreground'>
                {formatPkr(origPrice)}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className='border-t p-3 flex items-center justify-between gap-2 bg-muted/20'>
        <div className='flex items-center gap-2 shrink-0'>
          <Switch
            checked={deal.isAvailable !== false}
            onCheckedChange={handleToggle}
            disabled={isPending}
          />
          <span className='text-xs text-muted-foreground'>
            {deal.isAvailable !== false ? 'ACTIVE' : 'INACTIVE'}
          </span>
        </div>

        <div className='flex items-center gap-1 shrink-0'>
          <Button
            type='button'
            variant='ghost'
            size='icon'
            onClick={handleEdit}
            className='size-7'
            aria-label={t('editDeal')}
          >
            <IconPencil className='size-3.5' />
          </Button>
          <Button
            type='button'
            variant='ghost'
            size='icon'
            onClick={handleDelete}
            className='size-7 text-muted-foreground hover:text-destructive'
            aria-label={t('deleteDeal')}
          >
            <IconTrash className='size-3.5' />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function DealListItem({
  deal,
  isPending,
  onToggleAvailability,
  onEdit,
  onDelete
}: DealCardProps) {
  const t = useTranslations('deals');
  const origPrice = deal.originalPrice;
  const basePrice = deal.basePrice;
  const hasDiscount =
    origPrice != null &&
    basePrice != null &&
    origPrice > basePrice;
  const discountPct =
    hasDiscount && origPrice != null && basePrice != null
      ? Math.round(
          ((fromPaisa(origPrice) - fromPaisa(basePrice)) /
            fromPaisa(origPrice)) *
            100
        )
      : 0;

  const handleToggle = () => {
    onToggleAvailability(deal);
  };

  const handleEdit = () => {
    onEdit(deal);
  };

  const handleDelete = () => {
    onDelete(deal);
  };

  return (
    <div className='p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/30 transition-colors min-w-0'>
      <div className='flex items-center gap-3 min-w-0 flex-1'>
        {deal.imageUrl ? (
          <div className='relative size-12 rounded-md overflow-hidden bg-muted shrink-0'>
            <Image
              src={deal.imageUrl}
              alt={deal.name}
              fill
              unoptimized
              className='object-cover'
            />
          </div>
        ) : (
          <div className='size-12 rounded-md bg-muted flex items-center justify-center shrink-0'>
            <IconPhoto className='size-5 text-muted-foreground opacity-50' />
          </div>
        )}

        <div className='space-y-0.5 min-w-0 flex-1'>
          <div className='flex items-center gap-2 min-w-0'>
            <h4 className='font-semibold text-sm truncate' title={deal.name}>
              {deal.name}
            </h4>
            {discountPct > 0 ? (
              <Badge className='bg-rose-600 text-white text-[10px] px-1.5 py-0 shrink-0'>
                {discountPct}{t('percentOffBadge')}
              </Badge>
            ) : null}
          </div>
          {deal.description ? (
            <p className='text-xs text-muted-foreground truncate' title={deal.description}>
              {deal.description}
            </p>
          ) : null}
        </div>
      </div>

      <div className='flex items-center justify-between sm:justify-end gap-4 shrink-0'>
        <div className='text-start sm:text-end'>
          <div className='font-bold text-sm'>
            {deal.basePrice != null ? formatPkr(deal.basePrice) : formatPkr(0)}
          </div>
          {hasDiscount && origPrice != null ? (
            <div className='text-[11px] line-through text-muted-foreground'>
              {formatPkr(origPrice)}
            </div>
          ) : null}
        </div>

        <div className='flex items-center gap-2'>
          <Switch
            checked={deal.isAvailable !== false}
            onCheckedChange={handleToggle}
            disabled={isPending}
          />
          <Button
            type='button'
            variant='ghost'
            size='icon'
            onClick={handleEdit}
            className='size-7'
            aria-label={t('editDeal')}
          >
            <IconPencil className='size-3.5' />
          </Button>
          <Button
            type='button'
            variant='ghost'
            size='icon'
            onClick={handleDelete}
            className='size-7 text-muted-foreground hover:text-destructive'
            aria-label={t('deleteDeal')}
          >
            <IconTrash className='size-3.5' />
          </Button>
        </div>
      </div>
    </div>
  );
}
