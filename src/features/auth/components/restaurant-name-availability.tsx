'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { Icons } from '@/components/icons';
import { checkRestaurantName, type CheckRestaurantNameResult } from '../api/auth.service';

interface RestaurantNameAvailabilityProps {
  name: string;
  className?: string;
}

export function RestaurantNameAvailability({ name, className = '' }: RestaurantNameAvailabilityProps) {
  const t = useTranslations('auth');
  const [checking, setChecking] = React.useState(false);
  const [result, setResult] = React.useState<CheckRestaurantNameResult | null>(null);

  React.useEffect(() => {
    const trimmed = name?.trim() || '';
    if (trimmed.length < 2) {
      setResult(null);
      setChecking(false);
      return;
    }

    setChecking(true);
    const timer = setTimeout(async () => {
      try {
        const res = await checkRestaurantName(trimmed);
        setResult(res);
      } catch {
        // Silently ignore network check failures
        setResult(null);
      } finally {
        setChecking(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [name]);

  if (checking) {
    return (
      <div className={`flex items-center gap-1.5 text-xs text-muted-foreground pt-1 ${className}`}>
        <Icons.spinner className='size-3.5 animate-spin' />
        <span>{t('checkingAvailability')}</span>
      </div>
    );
  }

  if (!result) return null;

  if (result.collision) {
    return (
      <div
        className={`rounded-lg border border-amber-500/30 bg-amber-500/10 p-2.5 text-xs text-amber-900 dark:text-amber-200 space-y-1 mt-1.5 ${className}`}
      >
        <div className='flex items-start gap-1.5 font-medium'>
          <Icons.warning className='size-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0' />
          <span>
            {t('nameCollisionWarning', { name: result.existingRestaurant?.name || name })}
          </span>
        </div>
        <p className='text-[11px] text-amber-800/90 dark:text-amber-300/90 pl-5 leading-relaxed'>
          {t('nameCollisionTip', { name: name.trim() })}
        </p>
        <p className='text-[10px] font-mono text-muted-foreground pl-5 pt-0.5'>
          {t('nameSuggestedSlug', { slug: result.suggestedSlug })}
        </p>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 pt-1 ${className}`}>
      <Icons.check className='size-3.5 text-emerald-600 dark:text-emerald-400' />
      <span className='font-mono'>
        {t('nameAvailable', { slug: result.suggestedSlug })}
      </span>
    </div>
  );
}
