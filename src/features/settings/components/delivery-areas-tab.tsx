'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { DeliveryAreasListSkeleton } from '@/components/skeletons/settings-skeleton';
import { IconMapPin, IconSearch, IconPlus, IconCheck, IconX } from '@tabler/icons-react';
import { toPaisa, fromPaisa } from '@/lib/money';
import { StandardPagination } from '@/components/ui/standard-pagination';
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
import type { DeliveryAreaItemDTO, AreaRowState } from '../types';

export function DeliveryAreasTab() {
  const t = useTranslations();
  const { data: profile } = useRestaurantProfile();
  const { data: areas, isLoading } = useDeliveryAreas(profile?.cityId);
  const updateAreas = useUpdateDeliveryAreas();
  const createCustomArea = useCreateCustomDeliveryArea();

  const [rows, setRows] = React.useState<AreaRowState[]>([]);
  const [search, setSearch] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(20);
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [newAreaName, setNewAreaName] = React.useState('');
  const [newAreaFee, setNewAreaFee] = React.useState('0');
  const [newAreaMinOrder, setNewAreaMinOrder] = React.useState('0');

  const handleCreateArea = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = newAreaName.trim();
    if (!trimmedName) {
      toast.error(t('restaurantSettings.enterAreaName'));
      return;
    }
    if (trimmedName.length < 2) {
      toast.error(t('restaurantSettings.areaNameTooShort'));
      return;
    }
    if (trimmedName.length > 60) {
      toast.error(t('restaurantSettings.areaNameTooLong'));
      return;
    }
    const alreadyExists = rows.some(
      (r) => r.name.trim().toLowerCase() === trimmedName.toLowerCase()
    );
    if (alreadyExists) {
      toast.error(t('restaurantSettings.areaAlreadyExists'));
      return;
    }

    if (newAreaFee.trim() !== '') {
      const fee = Number(newAreaFee);
      if (Number.isNaN(fee) || fee < 0 || fee > 50000 || !Number.isInteger(fee)) {
        toast.error(t('restaurantSettings.invalidDeliveryFee'));
        return;
      }
    }

    if (newAreaMinOrder.trim() !== '') {
      const minOrder = Number(newAreaMinOrder);
      if (Number.isNaN(minOrder) || minOrder < 0 || minOrder > 500000 || !Number.isInteger(minOrder)) {
        toast.error(t('restaurantSettings.invalidMinOrder'));
        return;
      }
    }

    try {
      await createCustomArea.mutateAsync({
        name: trimmedName,
        deliveryFee: newAreaFee.trim() ? toPaisa(Number(newAreaFee)) : null,
        minOrderAmount: newAreaMinOrder.trim() ? toPaisa(Number(newAreaMinOrder)) : null,
      });
      setIsAddOpen(false);
      setNewAreaName('');
      setNewAreaFee('0');
      setNewAreaMinOrder('0');
      toast.success(t('restaurantSettings.areaAddedSuccess', { name: trimmedName }));
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

  const total = filteredRows.length;
  const paginatedRows = React.useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, page, pageSize]);

  React.useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(total / pageSize));
    if (page > maxPage) {
      setPage(maxPage);
    }
  }, [total, pageSize, page]);

  React.useEffect(() => {
    if (areas) {
      setRows(
        areas.map((a: DeliveryAreaItemDTO) => ({
          areaId: a.areaId,
          name: a.name,
          slug: a.slug,
          isServed: a.isServed,
          feeInput: a.deliveryFee != null ? String(fromPaisa(a.deliveryFee)) : '0',
          minOrderInput: a.minOrderAmount != null ? String(fromPaisa(a.minOrderAmount)) : '0',
          isVerified: a.isVerified !== false
        }))
      );
    }
  }, [areas]);

  const handleToggleServed = (areaId: string, isServed: boolean) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.areaId !== areaId) return r;
        return {
          ...r,
          isServed,
          feeInput: r.feeInput.trim() !== '' ? r.feeInput : '0',
          minOrderInput: r.minOrderInput.trim() !== '' ? r.minOrderInput : '0'
        };
      })
    );
  };

  const handleFeeChange = (areaId: string, feeInput: string) => {
    setRows((prev) => prev.map((r) => (r.areaId === areaId ? { ...r, feeInput } : r)));
  };

  const handleMinOrderChange = (areaId: string, minOrderInput: string) => {
    setRows((prev) => prev.map((r) => (r.areaId === areaId ? { ...r, minOrderInput } : r)));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(1);
  };

  const handleSave = async () => {
    const served = rows.filter((r) => r.isServed);
    for (const r of served) {
      if (r.feeInput.trim() !== '') {
        const fee = Number(r.feeInput);
        if (Number.isNaN(fee) || fee < 0 || fee > 50000 || !Number.isInteger(fee)) {
          toast.error(t('restaurantSettings.invalidRowFee', { name: r.name }));
          return;
        }
      }
      if (r.minOrderInput.trim() !== '') {
        const min = Number(r.minOrderInput);
        if (Number.isNaN(min) || min < 0 || min > 500000 || !Number.isInteger(min)) {
          toast.error(t('restaurantSettings.invalidRowMinOrder', { name: r.name }));
          return;
        }
      }
    }

    const payload = served.map((r) => ({
      areaId: r.areaId,
      deliveryFee: r.feeInput.trim() ? toPaisa(Number(r.feeInput)) : null,
      minOrderAmount: r.minOrderInput.trim() ? toPaisa(Number(r.minOrderInput)) : null
    }));

    try {
      await updateAreas.mutateAsync({ areas: payload });
      toast.success(t('restaurantSettings.areasSaved'));
    } catch (err) {
      const msg = err instanceof Error ? err.message : t('common.unexpectedError');
      toast.error(msg);
    }
  };

  const servedCount = rows.filter((r) => r.isServed).length;
  const currentDistrictName = profile?.city?.name ?? 'Lower Dir';

  return (
    <div className='rounded-xl border bg-card p-6 shadow-xs space-y-6'>
      <div className='flex items-center justify-between gap-3 rounded-xl border border-border/80 bg-muted/40 px-4 py-3 text-xs text-foreground shadow-2xs'>
        <div className='flex items-center gap-2'>
          <IconMapPin className='size-4 text-primary shrink-0' />
          <span>
            {t('restaurantSettings.operatingInDistrict')} <strong className='font-semibold text-foreground'>{currentDistrictName}</strong>. {t('restaurantSettings.deliveryAreasScoped')}
          </span>
        </div>
        <span className='hidden sm:inline text-muted-foreground text-[11px] font-medium'>
          {t('restaurantSettings.changeInProfile')}
        </span>
      </div>

      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b pb-4'>
        <div>
          <h3 className='text-base font-semibold text-foreground'>
            {t('restaurantSettings.deliveryTitle')}
          </h3>
          <p className='text-xs text-muted-foreground'>
            {t('restaurantSettings.deliveryDescription')}
          </p>
        </div>
        <div className='flex flex-wrap items-center gap-2.5'>
          {rows.length > 3 && (
            <div className='relative w-full sm:w-48'>
              <IconSearch className='absolute inset-s-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground' />
              <Input
                value={search}
                onChange={handleSearchChange}
                placeholder={t('restaurantSettings.searchAreasPlaceholder')}
                className='ps-8 h-9 text-xs'
              />
            </div>
          )}
          <Badge variant='secondary' className='text-xs font-normal whitespace-nowrap h-9 px-2.5'>
            {t('restaurantSettings.areasServedCount', { served: servedCount, total: rows.length })}
          </Badge>

          <Button
            type='button'
            variant='outline'
            className='h-9 text-xs gap-1.5'
            onClick={() => setIsAddOpen(true)}
          >
            <IconPlus className='size-3.5' />
            <span>{t('restaurantSettings.addMissingArea')}</span>
          </Button>

          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogContent className='sm:max-w-md'>
              <form onSubmit={handleCreateArea}>
                <DialogHeader>
                  <DialogTitle>{t('restaurantSettings.dialogAddAreaTitle')}</DialogTitle>
                  <DialogDescription>
                    {t('restaurantSettings.dialogAddAreaDesc')}
                  </DialogDescription>
                </DialogHeader>
                <div className='space-y-4 py-4'>
                  <div className='space-y-2'>
                    <label htmlFor='new-custom-area-name' className='text-xs font-medium'>{t('restaurantSettings.areaNameLabel')}</label>
                    <Input
                      id='new-custom-area-name'
                      required
                      placeholder={t('restaurantSettings.areaNamePlaceholder')}
                      value={newAreaName}
                      onChange={(e) => setNewAreaName(e.target.value)}
                      className='h-9 text-xs'
                    />
                  </div>
                  <div className='grid grid-cols-2 gap-3'>
                    <div className='space-y-2'>
                      <label htmlFor='new-custom-area-fee' className='text-xs font-medium'>{t('restaurantSettings.deliveryFeeLabel')}</label>
                      <Input
                        id='new-custom-area-fee'
                        type='number'
                        min='0'
                        placeholder={t('restaurantSettings.deliveryFeePlaceholder')}
                        value={newAreaFee}
                        onChange={(e) => setNewAreaFee(e.target.value)}
                        className='h-9 text-xs'
                      />
                    </div>
                    <div className='space-y-2'>
                      <label htmlFor='new-custom-area-min-order' className='text-xs font-medium'>{t('restaurantSettings.minOrderLabel')}</label>
                      <Input
                        id='new-custom-area-min-order'
                        type='number'
                        min='0'
                        placeholder={t('restaurantSettings.defaultPlaceholder')}
                        value={newAreaMinOrder}
                        onChange={(e) => setNewAreaMinOrder(e.target.value)}
                        className='h-9 text-xs'
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter className='gap-2 sm:gap-2 pt-3 border-t border-border/60'>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={() => setIsAddOpen(false)}
                    disabled={createCustomArea.isPending}
                    className='h-9 gap-1.5 rounded-lg px-4 text-xs font-semibold'
                  >
                    <IconX className='size-4' />
                    <span>{t('common.cancel')}</span>
                  </Button>
                  <Button
                    type='submit'
                    disabled={createCustomArea.isPending}
                    className='h-9 gap-1.5 rounded-lg px-5 text-xs font-semibold shadow-xs'
                  >
                    <IconPlus className='size-4' />
                    <span>{t('common.add')}</span>
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        <DeliveryAreasListSkeleton />
      ) : (
        <div className='space-y-4'>
          <div className='divide-y divide-border/60'>
            {paginatedRows.map((row) => (
              <div
                key={row.areaId}
                className={`flex flex-col gap-3 py-3.5 sm:flex-row sm:items-center sm:justify-between transition-colors rounded-xl px-2.5 ${
                  row.isServed ? 'bg-muted/30 border border-border/50' : 'hover:bg-muted/20'
                }`}
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
                    <Badge
                      variant='outline'
                      className={`text-[10px] px-1.5 py-0 font-medium ${
                        row.isServed
                          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'border-muted text-muted-foreground bg-muted/40'
                      }`}
                    >
                      {row.isServed ? t('restaurantSettings.servedArea') : t('restaurantSettings.closed')}
                    </Badge>
                    {row.isVerified === false && (
                      <Badge
                        variant='outline'
                        className='text-[10px] text-amber-700 bg-amber-50 border-amber-300 dark:text-amber-400 dark:bg-amber-950/40 font-medium'
                      >
                        {t('restaurantSettings.pendingVerification')}
                      </Badge>
                    )}
                  </div>
                </div>

                {row.isServed ? (
                  <div className='flex flex-wrap items-center gap-3 ps-11 sm:ps-0 animate-in fade-in-50'>
                    <div className='flex items-center gap-1.5'>
                      <span className='text-[11px] text-muted-foreground whitespace-nowrap'>
                        {t('restaurantSettings.deliveryFee')}:
                      </span>
                      <div className='relative w-28'>
                        <span className='absolute inset-s-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium'>
                          {t('common.currency')}
                        </span>
                        <Input
                          type='number'
                          min='0'
                          step='1'
                          value={row.feeInput}
                          onChange={(e) => handleFeeChange(row.areaId, e.target.value)}
                          placeholder={t('restaurantSettings.feePlaceholder')}
                          disabled={updateAreas.isPending}
                          className='h-9 ps-8 text-xs'
                        />
                      </div>
                    </div>

                    <div className='flex items-center gap-1.5'>
                      <span className='text-[11px] text-muted-foreground whitespace-nowrap'>
                        {t('restaurantSettings.areaMinOrder')}:
                      </span>
                      <div className='relative w-28'>
                        <span className='absolute inset-s-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium'>
                          {t('common.currency')}
                        </span>
                        <Input
                          type='number'
                          min='0'
                          step='1'
                          value={row.minOrderInput}
                          onChange={(e) => handleMinOrderChange(row.areaId, e.target.value)}
                          placeholder={t('restaurantSettings.defaultPlaceholder')}
                          disabled={updateAreas.isPending}
                          className='h-9 ps-8 text-xs'
                        />
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          {total > 0 && (
            <div className='pt-2'>
              <StandardPagination
                page={page}
                pageSize={pageSize}
                total={total}
                pageSizeOptions={[10, 20, 30, 50, 100]}
                onPageChange={setPage}
                onPageSizeChange={handlePageSizeChange}
                disabled={updateAreas.isPending}
              />
            </div>
          )}
        </div>
      )}

      <div className='flex justify-end pt-3 border-t'>
        <Button
          type='button'
          onClick={handleSave}
          disabled={updateAreas.isPending}
          className='gap-1.5 shadow-xs px-5'
        >
          <IconCheck className='size-4' />
          <span>{t('restaurantSettings.saveAreas')}</span>
        </Button>
      </div>
    </div>
  );
}
