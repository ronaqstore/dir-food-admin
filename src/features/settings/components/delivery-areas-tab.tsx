'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { DeliveryAreasTabSkeleton } from '@/components/skeletons/settings-skeleton';
import { IconMapPin, IconSearch } from '@tabler/icons-react';
import { toPaisa, fromPaisa } from '@/lib/money';
import { useDeliveryAreas, useUpdateDeliveryAreas } from '../api/restaurant-query';
import type { DeliveryAreaItemDTO } from '../types';

interface AreaRowState {
  areaId: string;
  name: string;
  slug: string;
  isServed: boolean;
  feeInput: string;
  minOrderInput: string;
}

export function DeliveryAreasTab() {
  const t = useTranslations();
  const { data: areas, isLoading } = useDeliveryAreas();
  const updateAreas = useUpdateDeliveryAreas();

  const [rows, setRows] = React.useState<AreaRowState[]>([]);
  const [search, setSearch] = React.useState('');

  const filteredRows = React.useMemo(() => {
    if (!search.trim()) return rows;
    const lower = search.toLowerCase();
    return rows.filter((r) => r.name.toLowerCase().includes(lower));
  }, [rows, search]);

  React.useEffect(() => {
    if (areas && areas.length > 0) {
      setRows(
        areas.map((a: DeliveryAreaItemDTO) => ({
          areaId: a.areaId,
          name: a.name,
          slug: a.slug,
          isServed: a.isServed,
          feeInput: a.deliveryFee != null ? String(fromPaisa(a.deliveryFee)) : '',
          minOrderInput: a.minOrderAmount != null ? String(fromPaisa(a.minOrderAmount)) : ''
        }))
      );
    }
  }, [areas]);

  const handleToggleServed = (areaId: string, isServed: boolean) => {
    setRows((prev) => prev.map((r) => (r.areaId === areaId ? { ...r, isServed } : r)));
  };

  const handleFeeChange = (areaId: string, feeInput: string) => {
    setRows((prev) => prev.map((r) => (r.areaId === areaId ? { ...r, feeInput } : r)));
  };

  const handleMinOrderChange = (areaId: string, minOrderInput: string) => {
    setRows((prev) => prev.map((r) => (r.areaId === areaId ? { ...r, minOrderInput } : r)));
  };

  const handleSave = async () => {
    const payload = rows
      .filter((r) => r.isServed)
      .map((r) => ({
        areaId: r.areaId,
        deliveryFee: r.feeInput ? toPaisa(Number(r.feeInput)) : null,
        minOrderAmount: r.minOrderInput ? toPaisa(Number(r.minOrderInput)) : null
      }));

    try {
      await updateAreas.mutateAsync({ areas: payload });
      toast.success(t('restaurantSettings.areasSaved'));
    } catch (err) {
      const msg = err instanceof Error ? err.message : t('common.unexpectedError');
      toast.error(msg);
    }
  };

  if (isLoading) {
    return <DeliveryAreasTabSkeleton />;
  }

  const servedCount = rows.filter((r) => r.isServed).length;

  return (
    <div className='rounded-xl border bg-card p-6 shadow-xs space-y-6'>
      <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b pb-4'>
        <div>
          <h3 className='text-base font-semibold text-foreground'>
            {t('restaurantSettings.deliveryTitle')}
          </h3>
          <p className='text-xs text-muted-foreground'>
            {t('restaurantSettings.deliveryDescription')}
          </p>
        </div>
        <div className='flex items-center gap-3'>
          {rows.length > 5 && (
            <div className='relative w-full sm:w-56'>
              <IconSearch className='absolute start-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground' />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('restaurantSettings.searchAreasPlaceholder')}
                className='ps-9 h-8 text-xs'
              />
            </div>
          )}
          <Badge variant='secondary' className='w-fit text-xs font-normal whitespace-nowrap'>
            {t('restaurantSettings.areasServedCount', { served: servedCount, total: rows.length })}
          </Badge>
        </div>
      </div>

      <div className='divide-y divide-border'>
        {filteredRows.map((row) => (
          <div
            key={row.areaId}
            className='flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between hover:bg-muted/30 transition-colors rounded-lg px-2'
          >
            <div className='flex items-center gap-3'>
              <Switch
                checked={row.isServed}
                onCheckedChange={(checked) => handleToggleServed(row.areaId, checked)}
                disabled={updateAreas.isPending}
                aria-label={row.name}
              />
              <div className='flex items-center gap-2'>
                <IconMapPin
                  className={`size-4 ${row.isServed ? 'text-primary' : 'text-muted-foreground'}`}
                />
                <span
                  className={`text-sm font-semibold ${row.isServed ? 'text-foreground' : 'text-muted-foreground'}`}
                >
                  {row.name}
                </span>
              </div>
            </div>

            {row.isServed ? (
              <div className='flex flex-wrap items-center gap-4 ps-11 sm:ps-0 animate-in fade-in-50'>
                <div className='flex items-center gap-2'>
                  <span className='text-xs text-muted-foreground whitespace-nowrap'>
                    {t('restaurantSettings.deliveryFee')}:
                  </span>
                  <div className='relative w-32'>
                    <span className='absolute start-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium'>
                      Rs.
                    </span>
                    <Input
                      type='number'
                      min='0'
                      step='1'
                      value={row.feeInput}
                      onChange={(e) => handleFeeChange(row.areaId, e.target.value)}
                      placeholder={t('restaurantSettings.feePlaceholder')}
                      disabled={updateAreas.isPending}
                      className='h-8 ps-9 text-xs'
                    />
                  </div>
                </div>

                <div className='flex items-center gap-2'>
                  <span className='text-xs text-muted-foreground whitespace-nowrap'>
                    {t('restaurantSettings.areaMinOrder')}:
                  </span>
                  <div className='relative w-32'>
                    <span className='absolute start-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium'>
                      Rs.
                    </span>
                    <Input
                      type='number'
                      min='0'
                      step='1'
                      value={row.minOrderInput}
                      onChange={(e) => handleMinOrderChange(row.areaId, e.target.value)}
                      placeholder={t('restaurantSettings.defaultPlaceholder')}
                      disabled={updateAreas.isPending}
                      className='h-8 ps-9 text-xs'
                    />
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        ))}
      </div>

      <div className='flex justify-end pt-4 border-t'>
        <Button onClick={handleSave} disabled={updateAreas.isPending}>
          {updateAreas.isPending ? (
            <>
              <Spinner className='me-2 size-4' />
              {t('common.saving')}
            </>
          ) : (
            t('restaurantSettings.saveAreas')
          )}
        </Button>
      </div>
    </div>
  );
}
