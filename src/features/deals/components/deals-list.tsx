'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { SortSelect } from '@/components/ui/sort-select';
import {
  IconPlus,
  IconSearch,
  IconFlame,
  IconLayoutGrid,
  IconList,
  IconX
} from '@tabler/icons-react';
import { usePaginatedMenuItems, useUpdateMenuItem } from '@/features/menu/api/menu-query';
import { parseSortParam } from '@/features/menu/lib/sort-utils';
import { StandardPagination } from '@/components/ui/standard-pagination';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { DealBuilderDialog } from './deal-builder-dialog';
import { DealCard, DealListItem } from './deal-cards';
import { DealCardSkeleton, DealListRowSkeleton } from '@/components/skeletons/deals-skeleton';
import type { MenuItemDTO } from '@/features/menu/types';

export function DealsList() {
  const t = useTranslations('deals');
  const tRoot = useTranslations();
  const [search, setSearch] = React.useState('');
  const debouncedSearch = React.useDeferredValue(search.trim());
  const [statusFilter, setStatusFilter] = React.useState<'all' | 'available' | 'soldOut'>('all');
  const [sortBy, setSortBy] = React.useState('default');
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState<number>(10);
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingDeal, setEditingDeal] = React.useState<MenuItemDTO | null>(null);
  const [dealToDelete, setDealToDelete] = React.useState<MenuItemDTO | null>(null);
  const [isDeletingDeal, setIsDeletingDeal] = React.useState(false);

  const topRef = React.useRef<HTMLDivElement>(null);

  const { sortBy: backendSortBy, sortOrder: backendSortOrder } = React.useMemo(
    () => parseSortParam(sortBy),
    [sortBy]
  );

  const {
    data: paginatedData,
    isLoading,
    isFetching,
    error,
    refetch
  } = usePaginatedMenuItems({
    isDeal: true,
    page,
    limit: pageSize,
    search: debouncedSearch || undefined,
    isAvailable:
      statusFilter === 'available'
        ? true
        : statusFilter === 'soldOut'
          ? false
          : undefined,
    sortBy: backendSortBy,
    sortOrder: backendSortOrder
  });

  const updateMenuItem = useUpdateMenuItem();

  const deals = paginatedData?.data ?? [];
  const meta = paginatedData?.meta ?? { page: 1, limit: pageSize, total: deals.length };
  const totalDeals = meta.total;

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(1);
  };

  const handleFilterAll = () => {
    setStatusFilter('all');
    setPage(1);
  };

  const handleFilterAvailable = () => {
    setStatusFilter('available');
    setPage(1);
  };

  const handleFilterSoldOut = () => {
    setStatusFilter('soldOut');
    setPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleClearSearch = () => {
    setSearch('');
    setPage(1);
  };

  const handleSortChange = (val: string | null) => {
    if (val != null) {
      setSortBy(val);
      setPage(1);
    }
  };

  const handleViewGrid = () => {
    setViewMode('grid');
  };

  const handleViewList = () => {
    setViewMode('list');
  };

  const handleToggleAvailability = async (deal: MenuItemDTO) => {
    try {
      const nextState = !deal.isAvailable;
      await updateMenuItem.mutateAsync({
        id: deal.id,
        input: { isAvailable: nextState }
      });
      toast.success(nextState ? t('dealAvailable') : t('dealSoldOut'));
    } catch {
      toast.error(t('statusUpdateFailed'));
    }
  };

  const handleDelete = (deal: MenuItemDTO) => {
    setDealToDelete(deal);
  };

  const handleConfirmDelete = async () => {
    if (!dealToDelete) return;
    try {
      setIsDeletingDeal(true);
      await updateMenuItem.mutateAsync({
        id: dealToDelete.id,
        input: { isActive: false }
      });
      toast.success(t('dealRemoved'));
      setDealToDelete(null);
      refetch();
    } catch {
      toast.error(t('removeFailed'));
    } finally {
      setIsDeletingDeal(false);
    }
  };

  const handleEdit = (deal: MenuItemDTO) => {
    setEditingDeal(deal);
    setDialogOpen(true);
  };

  const handleCreateNew = () => {
    setEditingDeal(null);
    setDialogOpen(true);
  };

  return (
    <div ref={topRef} className='space-y-4 pb-8 min-w-0'>
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0'>
        <div>
          <h1 className='text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2'>
            <span>{t('title')}</span>
          </h1>
          <p className='text-xs sm:text-sm text-muted-foreground mt-0.5'>
            {t('subtitle')}
          </p>
        </div>

        <Button
          type='button'
          onClick={handleCreateNew}
          className='gap-1.5 shrink-0 self-start sm:self-auto'
        >
          <IconPlus className='size-4' />
          <span>{t('createDeal')}</span>
        </Button>
      </div>

      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border bg-card p-3 min-w-0'>
        <div className='flex items-center gap-2 text-xs'>
          <span className='font-medium text-muted-foreground'>
            {t('totalDeals')} <strong className='text-foreground'>{totalDeals}</strong>
          </span>
          {isFetching && !isLoading && (
            <span className='inline-flex items-center text-muted-foreground text-[11px] gap-1'>
              <Spinner className='size-3 animate-spin' />
              <span>{t('updating')}</span>
            </span>
          )}
        </div>

        <div className='flex flex-wrap items-center gap-2 min-w-0 w-full sm:w-auto'>
          <div className='flex h-9 items-center rounded-lg border bg-muted/40 p-0.5 text-xs font-medium'>
            <button
              type='button'
              onClick={handleFilterAll}
              className={`h-full px-2.5 rounded-md transition-all flex items-center ${
                statusFilter === 'all'
                  ? 'bg-background text-foreground shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tRoot('menuItems.statusAll')}
            </button>
            <button
              type='button'
              onClick={handleFilterAvailable}
              className={`h-full flex items-center gap-1.5 px-2.5 rounded-md transition-all ${
                statusFilter === 'available'
                  ? 'bg-background text-emerald-600 dark:text-emerald-400 shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <span className='size-1.5 rounded-full bg-emerald-500' />
              <span>{tRoot('menuItems.statusAvailable')}</span>
            </button>
            <button
              type='button'
              onClick={handleFilterSoldOut}
              className={`h-full flex items-center gap-1.5 px-2.5 rounded-md transition-all ${
                statusFilter === 'soldOut'
                  ? 'bg-background text-amber-600 dark:text-amber-400 shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <span className='size-1.5 rounded-full bg-amber-500' />
              <span>{tRoot('menuItems.statusSoldOut')}</span>
            </button>
          </div>

          <div className='relative flex-1 sm:w-64 min-w-0'>
            <IconSearch className='absolute inset-s-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground' />
            <Input
              value={search}
              onChange={handleSearchChange}
              placeholder={t('searchPlaceholder')}
              className='h-9 ps-8 pe-7 text-xs w-full'
            />
            {search && (
              <button
                type='button'
                onClick={handleClearSearch}
                className='absolute inset-e-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5'
                aria-label={t('clearSearch')}
              >
                <IconX className='size-3.5' />
              </button>
            )}
          </div>

          <div className='hidden sm:flex items-center'>
            <SortSelect
              value={sortBy}
              onValueChange={handleSortChange}
            />
          </div>

          <div className='flex items-center rounded-md border p-0.5 shrink-0'>
            <button
              type='button'
              onClick={handleViewGrid}
              className={`p-1 rounded transition-colors ${
                viewMode === 'grid' ? 'bg-muted text-foreground' : 'text-muted-foreground'
              }`}
              aria-label={t('gridView')}
            >
              <IconLayoutGrid className='size-4' />
            </button>
            <button
              type='button'
              onClick={handleViewList}
              className={`p-1 rounded transition-colors ${
                viewMode === 'list' ? 'bg-muted text-foreground' : 'text-muted-foreground'
              }`}
              aria-label={t('listView')}
            >
              <IconList className='size-4' />
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        viewMode === 'grid' ? (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
            {Array.from({ length: 6 }).map((_, i) => (
              <DealCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className='rounded-lg border bg-card divide-y overflow-hidden'>
            {Array.from({ length: 6 }).map((_, i) => (
              <DealListRowSkeleton key={i} />
            ))}
          </div>
        )
      ) : error ? (
        <div className='rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-center'>
          <p className='text-sm text-destructive font-medium mb-2'>
            {t('failedLoadDeals')}
          </p>
          <Button type='button' variant='outline' size='sm' onClick={() => refetch()}>
            {t('tryAgain')}
          </Button>
        </div>
      ) : deals.length === 0 ? (
        <div className='rounded-lg border border-dashed p-8 text-center bg-card/50'>
          <div className='size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3'>
            <IconFlame className='size-5' />
          </div>
          <h3 className='text-sm font-semibold text-foreground mb-1'>
            {t('noItemsAdded')}
          </h3>
          <p className='text-xs text-muted-foreground max-w-sm mx-auto mb-4'>
            {t('createFirstDeal')}
          </p>
          {!debouncedSearch && (
            <Button type='button' size='sm' onClick={handleCreateNew} className='gap-1.5'>
              <IconPlus className='size-4' />
              <span>{t('createFirstDeal')}</span>
            </Button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
          {deals.map((deal) => (
            <DealCard
              key={deal.id}
              deal={deal}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleAvailability={handleToggleAvailability}
              isPending={updateMenuItem.isPending}
            />
          ))}
        </div>
      ) : (
        <div className='rounded-lg border bg-card divide-y overflow-hidden'>
          {deals.map((deal) => (
            <DealListItem
              key={deal.id}
              deal={deal}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleAvailability={handleToggleAvailability}
              isPending={updateMenuItem.isPending}
            />
          ))}
        </div>
      )}

      {totalDeals > 0 && (
        <div className='pt-3 border-t'>
          <StandardPagination
            page={page}
            pageSize={pageSize}
            total={totalDeals}
            pageSizeOptions={[10, 20, 30, 50]}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            disabled={isFetching}
          />
        </div>
      )}

      <DealBuilderDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        deal={editingDeal}
        onSuccess={() => {
          refetch();
        }}
      />

      <ConfirmDialog
        open={!!dealToDelete}
        onOpenChange={(open) => {
          if (!open) setDealToDelete(null);
        }}
        title={t('deleteDeal')}
        description={
          dealToDelete
            ? t('confirmRemove', { name: dealToDelete.name })
            : undefined
        }
        confirmLabel={tRoot('common.delete')}
        cancelLabel={tRoot('common.cancel')}
        variant='destructive'
        isLoading={isDeletingDeal}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
