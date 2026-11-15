'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { IconCheck, IconCopy } from '@tabler/icons-react';
import { HoursTabSkeleton } from '@/components/skeletons/settings-skeleton';
import { useOperatingHours, useUpdateOperatingHours } from '../api/restaurant-query';
import type { DayHoursInput, DayScheduleRow } from '../types';

const DAYS_OF_WEEK = [
  { index: 1, key: 'dayMonday' },
  { index: 2, key: 'dayTuesday' },
  { index: 3, key: 'dayWednesday' },
  { index: 4, key: 'dayThursday' },
  { index: 5, key: 'dayFriday' },
  { index: 6, key: 'daySaturday' },
  { index: 0, key: 'daySunday' }
] as const;

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

  const handleCopyHoursToAll = (sourceOpen: string, sourceClose: string) => {
    setDays((prev) =>
      prev.map((d) => (d.isOpen ? { ...d, openTime: sourceOpen, closeTime: sourceClose } : d))
    );
    toast.success(t('restaurantSettings.hoursSaved'));
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
    return <HoursTabSkeleton />;
  }

  return (
    <div className='rounded-xl border bg-card p-6 shadow-xs space-y-6'>
      <div className='flex flex-col gap-1 border-b pb-4'>
        <h3 className='text-base font-semibold text-foreground'>
          {t('restaurantSettings.hoursTitle')}
        </h3>
        <p className='text-xs text-muted-foreground'>{t('restaurantSettings.hoursDescription')}</p>
      </div>

      <div className='divide-y divide-border/60'>
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
              className='flex flex-col gap-3 py-3.5 sm:flex-row sm:items-center sm:justify-between'
            >
              <div className='flex items-center gap-3.5 min-w-[170px]'>
                <Switch
                  checked={dayRow.isOpen}
                  onCheckedChange={(checked) => handleToggleDay(d.index, checked)}
                  disabled={updateHours.isPending}
                  aria-label={t(`restaurantSettings.${d.key}`)}
                />
                <span className='font-semibold text-sm text-foreground'>
                  {t(`restaurantSettings.${d.key}`)}
                </span>
                <Badge
                  variant='outline'
                  className={`text-[10px] px-1.5 py-0 font-medium ${
                    dayRow.isOpen
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'border-muted text-muted-foreground bg-muted/40'
                  }`}
                >
                  {dayRow.isOpen ? t('restaurantSettings.open') : t('restaurantSettings.closed')}
                </Badge>
              </div>

              {dayRow.isOpen ? (
                <div className='flex items-center gap-2 sm:gap-3 ps-11 sm:ps-0 animate-in fade-in-50'>
                  <div className='flex items-center gap-1.5'>
                    <span className='text-[11px] text-muted-foreground'>
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
                    <span className='text-[11px] text-muted-foreground'>
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
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    onClick={() => handleCopyHoursToAll(dayRow.openTime, dayRow.closeTime)}
                    className='size-7 text-muted-foreground hover:text-foreground'
                    title={t('restaurantSettings.copyHoursToAll')}
                    aria-label={t('restaurantSettings.copyHoursToAll')}
                  >
                    <IconCopy className='size-3.5' />
                  </Button>
                </div>
              ) : (
                <span className='text-xs text-muted-foreground italic ps-11 sm:ps-0 py-1'>
                  {t('restaurantSettings.closed')}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className='flex justify-end pt-3 border-t'>
        <Button
          type='button'
          onClick={handleSave}
          disabled={updateHours.isPending}
          className='gap-1.5 shadow-xs px-5'
        >
          <IconCheck className='size-4' />
          <span>{t('restaurantSettings.saveHours')}</span>
        </Button>
      </div>
    </div>
  );
}
