'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  IconCheck,
  IconClock,
  IconDoorOff,
  IconAlertTriangle
} from '@tabler/icons-react';
import type { ProfileAvailabilitySectionProps } from '../types';

export function ProfileAvailabilitySection({
  manualStatus,
  setManualStatus,
  unavailableNote,
  setUnavailableNote,
  onSaveAvailability,
  isPending,
  t
}: ProfileAvailabilitySectionProps) {
  return (
    <div className='rounded-xl border bg-card p-6 shadow-xs space-y-5'>
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b pb-4'>
        <div>
          <h3 className='text-base font-semibold text-foreground'>
            {t('restaurantSettings.availabilityTitle')}
          </h3>
          <p className='text-xs text-muted-foreground'>
            {t('restaurantSettings.availabilityDescription')}
          </p>
        </div>
        <Button
          type='button'
          onClick={onSaveAvailability}
          disabled={isPending}
          size='sm'
          className='gap-1.5 self-start sm:self-auto shadow-xs'
        >
          <IconCheck className='size-4' />
          <span>{t('common.save')}</span>
        </Button>
      </div>

      <div className='grid gap-3 sm:grid-cols-3'>
        <button
          type='button'
          onClick={() => setManualStatus('AUTO')}
          className={`rounded-xl border p-4 text-start transition-all cursor-pointer relative ${
            manualStatus === 'AUTO'
              ? 'border-emerald-500/60 bg-emerald-500/10 ring-2 ring-emerald-500/30'
              : 'border-border/80 bg-card hover:bg-muted/40 hover:border-border'
          }`}
        >
          <div className='flex items-center justify-between gap-2 mb-2'>
            <div className='flex size-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'>
              <IconClock className='size-4' />
            </div>
            <span
              className={`size-2.5 rounded-full ${
                manualStatus === 'AUTO' ? 'bg-emerald-500 ring-4 ring-emerald-500/20' : 'bg-muted border'
              }`}
            />
          </div>
          <p className='text-sm font-semibold text-foreground'>
            {t('restaurantSettings.statusAuto')}
          </p>
          <p className='text-xs text-muted-foreground mt-1 leading-relaxed'>
            {t('restaurantSettings.statusAutoDesc')}
          </p>
        </button>

        <button
          type='button'
          onClick={() => setManualStatus('CLOSED')}
          className={`rounded-xl border p-4 text-start transition-all cursor-pointer relative ${
            manualStatus === 'CLOSED'
              ? 'border-destructive/60 bg-destructive/10 ring-2 ring-destructive/30'
              : 'border-border/80 bg-card hover:bg-muted/40 hover:border-border'
          }`}
        >
          <div className='flex items-center justify-between gap-2 mb-2'>
            <div className='flex size-8 items-center justify-center rounded-lg bg-destructive/15 text-destructive'>
              <IconDoorOff className='size-4' />
            </div>
            <span
              className={`size-2.5 rounded-full ${
                manualStatus === 'CLOSED' ? 'bg-destructive ring-4 ring-destructive/20' : 'bg-muted border'
              }`}
            />
          </div>
          <p className='text-sm font-semibold text-destructive'>
            {t('restaurantSettings.statusClosed')}
          </p>
          <p className='text-xs text-muted-foreground mt-1 leading-relaxed'>
            {t('restaurantSettings.statusClosedDesc')}
          </p>
        </button>

        <button
          type='button'
          onClick={() => setManualStatus('TEMP_UNAVAILABLE')}
          className={`rounded-xl border p-4 text-start transition-all cursor-pointer relative ${
            manualStatus === 'TEMP_UNAVAILABLE'
              ? 'border-amber-500/60 bg-amber-500/10 ring-2 ring-amber-500/30'
              : 'border-border/80 bg-card hover:bg-muted/40 hover:border-border'
          }`}
        >
          <div className='flex items-center justify-between gap-2 mb-2'>
            <div className='flex size-8 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400'>
              <IconAlertTriangle className='size-4' />
            </div>
            <span
              className={`size-2.5 rounded-full ${
                manualStatus === 'TEMP_UNAVAILABLE' ? 'bg-amber-500 ring-4 ring-amber-500/20' : 'bg-muted border'
              }`}
            />
          </div>
          <p className='text-sm font-semibold text-amber-600 dark:text-amber-400'>
            {t('restaurantSettings.statusTemp')}
          </p>
          <p className='text-xs text-muted-foreground mt-1 leading-relaxed'>
            {t('restaurantSettings.statusTempDesc')}
          </p>
        </button>
      </div>

      {manualStatus !== 'AUTO' ? (
        <div className='space-y-1.5 animate-in fade-in-50 pt-1'>
          <Label htmlFor='unavailable-note' className='text-xs font-semibold'>
            {t('restaurantSettings.unavailableNote')}
          </Label>
          <Input
            id='unavailable-note'
            value={unavailableNote}
            onChange={(e) => setUnavailableNote(e.target.value)}
            placeholder={t('restaurantSettings.unavailableNotePlaceholder')}
            maxLength={200}
            className='text-xs h-9'
          />
        </div>
      ) : null}
    </div>
  );
}

