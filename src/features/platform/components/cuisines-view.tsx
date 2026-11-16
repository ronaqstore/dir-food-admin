'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { Spinner } from '@/components/ui/spinner';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { StandardPagination } from '@/components/ui/standard-pagination';
import {
  usePlatformCuisines,
  useUpdateMasterCuisine,
  useDeleteMasterCuisine
} from '../api/cuisines-query';
import { CuisineDialog } from './cuisine-dialog';
import type { MasterCuisine } from '../cuisines.types';

export function CuisinesView() {
  const t = useTranslations('platformCuisines');
  const tCommon = useTranslations('common');

  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(50);
  const [search, setSearch] = React.useState('');
  const debouncedSearch = React.useDeferredValue(search.trim());
  const [statusFilter, setStatusFilter] = React.useState<'all' | 'active' | 'inactive'>('all');

  const [selectedCuisine, setSelectedCuisine] = React.useState<MasterCuisine | null>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [cuisineToDelete, setCuisineToDelete] = React.useState<MasterCuisine | null>(null);

  const { data: response, isLoading } = usePlatformCuisines({
    page,
    limit: pageSize,
    q: debouncedSearch || undefined,
    isActive: statusFilter === 'all' ? undefined : statusFilter === 'active'
  });

  const updateMutation = useUpdateMasterCuisine();
  const deleteMutation = useDeleteMasterCuisine();

  const cuisines = React.useMemo(() => {
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response)) return response as MasterCuisine[];
    return [];
  }, [response]);

  const total = response?.meta?.total ?? cuisines.length;

  const handleOpenCreate = () => {
    setSelectedCuisine(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (cuisine: MasterCuisine) => {
    setSelectedCuisine(cuisine);
    setIsDialogOpen(true);
  };

  const handleToggleActive = async (cuisine: MasterCuisine) => {
    try {
      const nextState = !cuisine.isActive;
      await updateMutation.mutateAsync({
        id: cuisine.id,
        input: { isActive: nextState }
      });
      toast.success(nextState ? t('statusActive') : t('statusInactive'));
    } catch (err) {
      const msg = err instanceof Error ? err.message : t('saveFailed');
      toast.error(msg);
    }
  };

  const handleConfirmDelete = async () => {
    if (!cuisineToDelete) return;
    try {
      await deleteMutation.mutateAsync(cuisineToDelete.id);
      toast.success(t('cuisineDeleted', { name: cuisineToDelete.name }));
      setCuisineToDelete(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : t('deleteFailed');
      toast.error(msg);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleStatusFilterChange = (filter: 'all' | 'active' | 'inactive') => {
    setStatusFilter(filter);
    setPage(1);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(1);
  };

  const handleCloseDeleteDialog = (open: boolean) => {
    if (!open) {
      setCuisineToDelete(null);
    }
  };

  return (
    <div className='flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-hidden pb-2'>
      <div className='flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <div className='flex items-center gap-2'>
            <h1 className='text-2xl font-bold tracking-tight text-foreground sm:text-3xl'>
              {t('title')}
            </h1>
            <Badge variant='secondary' className='text-xs font-mono font-normal'>
              {total}
            </Badge>
          </div>
          <p className='text-xs sm:text-sm text-muted-foreground mt-0.5'>{t('subtitle')}</p>
        </div>
        <Button type='button' onClick={handleOpenCreate} className='h-9 gap-1.5 self-start sm:self-auto'>
          <Icons.add className='size-4' />
          {t('addCuisine')}
        </Button>
      </div>

      <div className='flex shrink-0 flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3'>
        <div className='relative flex-1 max-w-sm'>
          <Icons.search className='absolute inset-s-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground' />
          <Input
            value={search}
            onChange={handleSearchChange}
            placeholder={t('searchPlaceholder')}
            className='h-9 ps-9 text-xs'
          />
        </div>

        <div className='flex items-center rounded-lg border bg-muted/30 p-1 self-start sm:self-auto'>
          {(['all', 'active', 'inactive'] as const).map((filter) => (
            <button
              key={filter}
              type='button'
              onClick={() => handleStatusFilterChange(filter)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                statusFilter === filter
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t(`filter_${filter}`)}
            </button>
          ))}
        </div>
      </div>

      <div className='relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border bg-card shadow-xs'>
        {isLoading ? (
          <div className='flex items-center justify-center p-12'>
            <Spinner className='size-6 text-primary' />
          </div>
        ) : cuisines.length === 0 ? (
          <div className='p-8 text-center text-xs text-muted-foreground'>
            {t('noCuisinesFound')}
          </div>
        ) : (
          <div className='min-h-0 flex-1 overflow-auto overscroll-contain'>
            <table className='w-full text-start text-xs'>
              <thead className='sticky top-0 z-10 border-b bg-muted/95 backdrop-blur-xs text-muted-foreground font-semibold shadow-[0_1px_0_0_var(--border)]'>
                <tr>
                  <th className='py-3 px-4'>{t('colName')}</th>
                  <th className='py-3 px-4'>{t('colSlug')}</th>
                  <th className='py-3 px-4'>{t('colSort')}</th>
                  <th className='py-3 px-4'>{t('colStatus')}</th>
                  <th className='py-3 px-4 text-end'>{t('colActions')}</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-border/60'>
                {cuisines.map((cuisine) => (
                  <tr key={cuisine.id} className='hover:bg-muted/20 transition-colors'>
                    <td className='py-3 px-4 font-semibold text-foreground'>
                      {cuisine.name}
                    </td>
                    <td className='py-3 px-4 font-mono text-muted-foreground'>
                      /{cuisine.slug}
                    </td>
                    <td className='py-3 px-4 font-mono text-muted-foreground'>
                      {cuisine.sortOrder}
                    </td>
                    <td className='py-3 px-4'>
                      <div className='flex items-center gap-2'>
                        <Switch
                          checked={cuisine.isActive}
                          onCheckedChange={() => handleToggleActive(cuisine)}
                          disabled={updateMutation.isPending}
                        />
                        <span className='text-xs text-muted-foreground'>
                          {cuisine.isActive ? t('active') : t('inactive')}
                        </span>
                      </div>
                    </td>
                    <td className='py-3 px-4 text-end'>
                      <div className='inline-flex items-center gap-1'>
                        <Button
                          type='button'
                          variant='ghost'
                          size='sm'
                          onClick={() => handleOpenEdit(cuisine)}
                          className='h-8 w-8 p-0'
                          aria-label={t('editCuisine')}
                        >
                          <Icons.edit className='size-3.5' />
                        </Button>
                        <Button
                          type='button'
                          variant='ghost'
                          size='sm'
                          onClick={() => setCuisineToDelete(cuisine)}
                          className='h-8 w-8 p-0 text-destructive hover:text-destructive'
                          aria-label={t('deleteCuisine')}
                        >
                          <Icons.trash className='size-3.5' />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {total > 0 && (
        <div className='shrink-0'>
          <StandardPagination
            page={page}
            pageSize={pageSize}
            total={total}
            pageSizeOptions={[20, 50, 100]}
            onPageChange={setPage}
            onPageSizeChange={handlePageSizeChange}
            disabled={isLoading}
          />
        </div>
      )}

      <CuisineDialog
        cuisine={selectedCuisine}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />

      <ConfirmDialog
        open={!!cuisineToDelete}
        onOpenChange={handleCloseDeleteDialog}
        title={t('deleteCuisine')}
        description={
          cuisineToDelete
            ? t('confirmDelete', { name: cuisineToDelete.name })
            : undefined
        }
        confirmLabel={tCommon('delete')}
        cancelLabel={tCommon('cancel')}
        variant='destructive'
        isLoading={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
