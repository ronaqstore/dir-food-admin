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
import { IconMapPin, IconSearch, IconPlus } from '@tabler/icons-react';
import { toPaisa, fromPaisa } from '@/lib/money';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  useDeliveryAreas,
  useUpdateDeliveryAreas,
  useCreateCustomDeliveryArea,
  useRestaurantProfile,
} from '../api/restaurant-query';
import type { DeliveryAreaItemDTO } from '../types';

interface AreaRowState {
  areaId: string;
  name: string;
  slug: string;
  isServed: boolean;
  feeInput: string;
  minOrderInput: string;
  isVerified?: boolean;
}

export function DeliveryAreasTab() {
  const t = useTranslations();
  const { data: profile } = useRestaurantProfile();
  const { data: areas, isLoading } = useDeliveryAreas(profile?.cityId);
  const updateAreas = useUpdateDeliveryAreas();
  const createCustomArea = useCreateCustomDeliveryArea();

  const [rows, setRows] = React.useState<AreaRowState[]>([]);
  const [search, setSearch] = React.useState('');
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [newAreaName, setNewAreaName] = React.useState('');
  const [newAreaFee, setNewAreaFee] = React.useState('');
  const [newAreaMinOrder, setNewAreaMinOrder] = React.useState('');

  const handleCreateArea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAreaName.trim()) {
      toast.error('Please enter an area name');
      return;
    }

    try {
      await createCustomArea.mutateAsync({
        name: newAreaName.trim(),
        deliveryFee: newAreaFee ? toPaisa(Number(newAreaFee)) : null,
        minOrderAmount: newAreaMinOrder ? toPaisa(Number(newAreaMinOrder)) : null,
      });
      toast.success(`"${newAreaName.trim()}" added to your delivery areas!`);
      setIsAddOpen(false);
      setNewAreaName('');
      setNewAreaFee('');
      setNewAreaMinOrder('');
    } catch (err) {
      const msg = err instanceof Error ? err.message : t('common.unexpectedError');
      toast.error(msg);
    }
  };

  const filteredRows = React.useMemo(() => {
    if (!search.trim()) return rows;
    const lower = search.toLowerCase();
    return rows.filter((r) => r.name.toLowerCase().includes(lower));
  }, [rows, search]);

  React.useEffect(() => {
    if (areas) {
      setRows(
        areas.map((a: DeliveryAreaItemDTO) => ({
          areaId: a.areaId,
          name: a.name,
          slug: a.slug,
          isServed: a.isServed,
          feeInput: a.deliveryFee != null ? String(fromPaisa(a.deliveryFee)) : '',
          minOrderInput: a.minOrderAmount != null ? String(fromPaisa(a.minOrderAmount)) : '',
          isVerified: a.isVerified !== false
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
  const currentDistrictName = profile?.city?.name ?? 'Lower Dir';

  return (
    <div className='rounded-xl border bg-card p-6 shadow-xs space-y-6'>
      {/* District Notice Banner */}
      <div className='flex items-center justify-between gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-xs text-foreground'>
        <div className='flex items-center gap-2'>
          <IconMapPin className='size-4 text-primary shrink-0' />
          <span>
            Operating in District: <strong className='font-semibold text-primary'>{currentDistrictName}</strong>.
            Delivery areas are scoped to your district so customers in {currentDistrictName} can order from you.
          </span>
        </div>
        <span className='hidden sm:inline text-muted-foreground text-[11px]'>
          (Change in Profile Settings)
        </span>
      </div>

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

          <Button
            size='sm'
            variant='outline'
            className='h-8 text-xs gap-1.5'
            onClick={() => setIsAddOpen(true)}
          >
            <IconPlus className='size-3.5' />
            Add Missing Area
          </Button>

          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogContent className='sm:max-w-md'>
              <form onSubmit={handleCreateArea}>
                <DialogHeader>
                  <DialogTitle>Add Delivery Area</DialogTitle>
                  <DialogDescription>
                    Add a locality or neighborhood in your city. It will be enabled for your restaurant immediately.
                  </DialogDescription>
                </DialogHeader>
                <div className='space-y-4 py-4'>
                  <div className='space-y-2'>
                    <label className='text-xs font-medium'>Area Name *</label>
                    <Input
                      required
                      placeholder='e.g. Qambar, Shahi Khel, Khazana'
                      value={newAreaName}
                      onChange={(e) => setNewAreaName(e.target.value)}
                      className='h-9 text-xs'
                    />
                  </div>
                  <div className='grid grid-cols-2 gap-3'>
                    <div className='space-y-2'>
                      <label className='text-xs font-medium'>Delivery Fee (Rs)</label>
                      <Input
                        type='number'
                        min='0'
                        placeholder='e.g. 100 (empty = WhatsApp)'
                        value={newAreaFee}
                        onChange={(e) => setNewAreaFee(e.target.value)}
                        className='h-9 text-xs'
                      />
                    </div>
                    <div className='space-y-2'>
                      <label className='text-xs font-medium'>Min Order (Rs)</label>
                      <Input
                        type='number'
                        min='0'
                        placeholder='Default'
                        value={newAreaMinOrder}
                        onChange={(e) => setNewAreaMinOrder(e.target.value)}
                        className='h-9 text-xs'
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type='button'
                    variant='ghost'
                    onClick={() => setIsAddOpen(false)}
                    disabled={createCustomArea.isPending}
                  >
                    Cancel
                  </Button>
                  <Button type='submit' disabled={createCustomArea.isPending}>
                    {createCustomArea.isPending ? <Spinner className='size-4 me-2' /> : null}
                    Add & Enable
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
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
                {row.isVerified === false && (
                  <Badge
                    variant='outline'
                    className='text-[10px] text-amber-700 bg-amber-50 border-amber-300 dark:text-amber-400 dark:bg-amber-950/40 font-medium'
                  >
                    Pending Verification
                  </Badge>
                )}
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
