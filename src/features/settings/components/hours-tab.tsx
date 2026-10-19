'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Spinner } from '@/components/ui/spinner';
import { useOperatingHours, useUpdateOperatingHours } from '../api/restaurant-query';
import type { DayHoursInput } from '../types';

const DAYS_OF_WEEK = [
  { index: 1, key: 'dayMonday' },
  { index: 2, key: 'dayTuesday' },
  { index: 3, key: 'dayWednesday' },
  { index: 4, key: 'dayThursday' },
  { index: 5, key: 'dayFriday' },
  { index: 6, key: 'daySaturday' },
  { index: 0, key: 'daySunday' }
] as const;

interface DayScheduleRow {
  dayOfWeek: number;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

export function HoursTab() {
  const t = useTranslations();
  const { data: schedule, isLoading } = useOperatingHours();
  const updateHours = useUpdateOperatingHours();

  const [days, setDays] = React.useState<DayScheduleRow[]>(() =>
    DAYS_OF_WEEK.map((d) => ({
      dayOfWeek: d.index,
      isOpen: true,
      openTime: '10:00',
      closeTime: '23:00'
    }))
  );

  React.useEffect(() => {
    if (schedule && schedule.length > 0) {
      setDays(
        DAYS_OF_WEEK.map((d) => {
          const match = schedule.find((s) => s.dayOfWeek === d.index);
          const range = match?.ranges && match.ranges.length > 0 ? match.ranges[0] : null;

          return {
            dayOfWeek: d.index,
            isOpen: Boolean(range),
            openTime: range?.openTime || '10:00',
            closeTime: range?.closeTime || '23:00'
          };
        })
      );
    }
  }, [schedule]);

  const handleToggleDay = (dayOfWeek: number, isOpen: boolean) => {
    setDays((prev) => prev.map((d) => (d.dayOfWeek === dayOfWeek ? { ...d, isOpen } : d)));
  };

  const handleTimeChange = (dayOfWeek: number, field: 'openTime' | 'closeTime', value: string) => {
    setDays((prev) => prev.map((d) => (d.dayOfWeek === dayOfWeek ? { ...d, [field]: value } : d)));
  };

  const handleSave = async () => {
    const payload: DayHoursInput[] = days.map((d) => ({
      dayOfWeek: d.dayOfWeek,
      ranges: d.isOpen ? [{ openTime: d.openTime, closeTime: d.closeTime }] : []
    }));

    try {
      await updateHours.mutateAsync({ days: payload });
      toast.success(t('restaurantSettings.hoursSaved'));
    } catch (err) {
      const msg = err instanceof Error ? err.message : t('common.unexpectedError');
      toast.error(msg);
    }
  };

  if (isLoading) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <Spinner className='size-8 text-primary' />
      </div>
    );
  }

  return (
    <div className='rounded-xl border bg-card p-6 shadow-xs space-y-6'>
      <div className='flex flex-col gap-1 border-b pb-4'>
        <h3 className='text-base font-semibold text-foreground'>
          {t('restaurantSettings.hoursTitle')}
        </h3>
        <p className='text-xs text-muted-foreground'>{t('restaurantSettings.hoursDescription')}</p>
      </div>

      <div className='divide-y divide-border'>
        {DAYS_OF_WEEK.map((d) => {
          const dayRow = days.find((r) => r.dayOfWeek === d.index) || {
            dayOfWeek: d.index,
            isOpen: true,
            openTime: '10:00',
            closeTime: '23:00'
          };

          return (
            <div
              key={d.index}
              className='flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between'
            >
              <div className='flex items-center gap-4 min-w-40'>
                <Switch
                  checked={dayRow.isOpen}
                  onCheckedChange={(checked) => handleToggleDay(d.index, checked)}
                  disabled={updateHours.isPending}
                  aria-label={t(`restaurantSettings.${d.key}`)}
                />
                <span className='font-semibold text-sm text-foreground'>
                  {t(`restaurantSettings.${d.key}`)}
                </span>
              </div>

              {dayRow.isOpen ? (
                <div className='flex items-center gap-3 animate-in fade-in-50'>
                  <div className='flex items-center gap-1.5'>
                    <span className='text-xs text-muted-foreground'>
                      {t('restaurantSettings.openTime')}:
                    </span>
                    <Input
                      type='time'
                      value={dayRow.openTime}
                      onChange={(e) => handleTimeChange(d.index, 'openTime', e.target.value)}
                      disabled={updateHours.isPending}
                      className='h-8 w-28 text-xs'
                    />
                  </div>
                  <span className='text-muted-foreground text-xs'>—</span>
                  <div className='flex items-center gap-1.5'>
                    <span className='text-xs text-muted-foreground'>
                      {t('restaurantSettings.closeTime')}:
                    </span>
                    <Input
                      type='time'
                      value={dayRow.closeTime}
                      onChange={(e) => handleTimeChange(d.index, 'closeTime', e.target.value)}
                      disabled={updateHours.isPending}
                      className='h-8 w-28 text-xs'
                    />
                  </div>
                </div>
              ) : (
                <span className='text-xs text-muted-foreground font-medium py-1'>
                  {t('restaurantSettings.closed')}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className='flex justify-end pt-4 border-t'>
        <Button onClick={handleSave} disabled={updateHours.isPending}>
          {updateHours.isPending ? (
            <>
              <Spinner className='me-2 size-4' />
              {t('common.saving')}
            </>
          ) : (
            t('restaurantSettings.saveHours')
          )}
        </Button>
      </div>
    </div>
  );
}
