'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import {
  IconPlus,
  IconSearch,
  IconPhoto,
  IconLayoutGrid,
  IconList,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconDots,
  IconX
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { usePaginatedMenuItems, useUpdateMenuItem } from '@/features/menu/api/menu-query';
import { DealBuilderDialog } from './deal-builder-dialog';
import { DealCard, DealListItem } from './deal-cards';
import type { MenuItemDTO } from '@/features/menu/types';

export function DealsList() {
  const t = useTranslations('deals');
  const [search, setSearch] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState<number>(12);
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingDeal, setEditingDeal] = React.useState<MenuItemDTO | null>(null);

  const topRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

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
    search: debouncedSearch || undefined
  });

  const updateMenuItem = useUpdateMenuItem();

  const deals = paginatedData?.data ?? [];
  const meta = paginatedData?.meta ?? { page: 1, limit: pageSize, total: deals.length };
  const totalDeals = meta.total;
  const totalPages = Math.max(1, Math.ceil(totalDeals / pageSize));

  const startItem = totalDeals === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalDeals);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || newPage === page) return;
    setPage(newPage);
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const paginationRange = React.useMemo(() => {
    const delta = 1;
    const range: (number | string)[] = [];
    const left = page - delta;
    const right = page + delta + 1;
    let prev: number | null = null;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= left && i < right)) {
        if (prev && i - prev === 2) {
          range.push(prev + 1);
        } else if (prev && i - prev > 2) {
          range.push('...');
        }
        range.push(i);
        prev = i;
      }
    }
    return range;
  }, [page, totalPages]);

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

  const handleDeleteDeal = async (deal: MenuItemDTO) => {
    if (!window.confirm(t('confirmRemove', { name: deal.name }))) return;
    try {
      await updateMenuItem.mutateAsync({
        id: deal.id,
        input: { isActive: false }
      });
      toast.success(t('dealRemoved'));
      refetch();
    } catch {
      toast.error(t('removeFailed'));
    }
  };

  const handleEditDeal = (deal: MenuItemDTO) => {
    setEditingDeal(deal);
    setDialogOpen(true);
  };

  const handleCreateNew = () => {
    setEditingDeal(null);
    setDialogOpen(true);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPage(1);
  };

  return (
    <div
      ref={topRef}
      className='scroll-mt-6 space-y-5 p-4 sm:p-6 max-w-7xl mx-auto w-full min-w-0 overflow-x-hidden'
    >
      {}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 min-w-0'>
        <div className='min-w-0'>
          <h1 className='text-xl sm:text-2xl font-bold tracking-tight truncate'>{t('title')}</h1>
          <p className='text-xs sm:text-sm text-muted-foreground mt-0.5'>
            {t('subtitle')}
          </p>
        </div>

        <Button type='button' onClick={handleCreateNew} className='gap-1.5 shrink-0 self-start sm:self-auto'>
          <IconPlus className='size-4' />
          <span>{t('createDeal')}</span>
        </Button>
      </div>

      {}
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

        <div className='flex items-center gap-2 min-w-0 w-full sm:w-auto'>
          {}
          <div className='relative flex-1 sm:w-64 min-w-0'>
            <IconSearch className='absolute inset-s-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground' />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className='h-8 ps-8 pe-7 text-xs w-full'
            />
            {search && (
              <button
                type='button'
                onClick={() => setSearch('')}
                className='absolute inset-e-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5'
                aria-label={t('clearSearch')}
              >
                <IconX className='size-3.5' />
              </button>
            )}
          </div>

          {}
          <div className='flex items-center rounded-md border p-0.5 shrink-0'>
            <button
              type='button'
              onClick={() => setViewMode('grid')}
              className={`p-1 rounded transition-colors ${
                viewMode === 'grid' ? 'bg-muted text-foreground' : 'text-muted-foreground'
              }`}
              aria-label={t('gridView')}
            >
              <IconLayoutGrid className='size-4' />
            </button>
            <button
              type='button'
              onClick={() => setViewMode('list')}
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

      {}
      {isLoading ? (
        <div className='flex items-center justify-center py-20 text-muted-foreground'>
          <Spinner className='me-2 size-5' />
          <span className='text-sm'>{t('loadingDeals')}</span>
        </div>
      ) : error ? (
        <div className='rounded-lg border border-destructive/20 bg-destructive/10 p-6 text-center space-y-2'>
          <p className='text-sm text-destructive font-medium'>{t('failedLoadDeals')}</p>
          <Button type='button' variant='outline' size='sm' onClick={() => refetch()}>
            {t('tryAgain')}
          </Button>
        </div>
      ) : deals.length === 0 ? (
        <div className='rounded-xl border border-dashed p-10 text-center space-y-3'>
          <div className='mx-auto flex size-12 items-center justify-center rounded-full bg-muted'>
            <IconPhoto className='size-6 text-muted-foreground opacity-60' />
          </div>
          <div>
            <h3 className='text-sm font-semibold text-foreground'>
              {debouncedSearch ? t('searchPlaceholder') : t('title')}
            </h3>
            <p className='text-xs text-muted-foreground mt-1 max-w-sm mx-auto'>
              {debouncedSearch
                ? `No offers matched "${debouncedSearch}". Try a different keyword.`
                : 'Create bundle offers like "Family Feast Deal" or "Student Combo" to boost average order value.'}
            </p>
          </div>
          {debouncedSearch ? (
            <Button type='button' variant='outline' size='sm' onClick={() => setSearch('')}>
              {t('clearSearch')}
            </Button>
          ) : (
            <Button type='button' onClick={handleCreateNew} size='sm' className='gap-1.5'>
              <IconPlus className='size-4' />
              <span>{t('createFirstDeal')}</span>
            </Button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 min-w-0'>
          {deals.map((deal) => (
            <DealCard
              key={deal.id}
              deal={deal}
              isPending={updateMenuItem.isPending}
              onToggleAvailability={handleToggleAvailability}
              onEdit={handleEditDeal}
              onDelete={handleDeleteDeal}
            />
          ))}
        </div>
      ) : (
        <div className='rounded-lg border divide-y bg-card overflow-hidden min-w-0'>
          {deals.map((deal) => (
            <DealListItem
              key={deal.id}
              deal={deal}
              isPending={updateMenuItem.isPending}
              onToggleAvailability={handleToggleAvailability}
              onEdit={handleEditDeal}
              onDelete={handleDeleteDeal}
            />
          ))}
        </div>
      )}

      {}
      {totalDeals > 0 && (
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t text-xs text-muted-foreground min-w-0'>
          {}
          <div className='flex flex-wrap items-center gap-3'>
            <span>
              {t('showing')} <strong className='text-foreground'>{startItem}–{endItem}</strong> {t('of')}{' '}
              <strong className='text-foreground'>{totalDeals}</strong> {t('dealsCount')}
            </span>
            <span className='text-border hidden sm:inline'>•</span>
            <div className='flex items-center gap-1.5'>
              <span>{t('perPage')}</span>
              {[12, 24, 48].map((size) => (
                <button
                  key={size}
                  type='button'
                  onClick={() => handlePageSizeChange(size)}
                  className={cn(
                    'px-2 py-0.5 rounded text-xs transition-colors',
                    pageSize === size
                      ? 'bg-foreground text-background font-semibold'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  )}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {}
          {totalPages > 1 && (
            <div className='flex items-center gap-1 self-center sm:self-auto'>
              <Button type='button'
                variant='outline'
                size='icon'
                className='size-7'
                onClick={() => handlePageChange(1)}
                disabled={page === 1 || isFetching}
                aria-label={t('firstPage')}
              >
                <IconChevronsLeft className='size-3.5' />
              </Button>
              <Button type='button'
                variant='outline'
                size='icon'
                className='size-7'
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1 || isFetching}
                aria-label={t('prevPage')}
              >
                <IconChevronLeft className='size-3.5' />
              </Button>

              <div className='flex items-center gap-1 px-1'>
                {paginationRange.map((p, idx) =>
                  typeof p === 'number' ? (
                    <Button type='button'
                      key={idx}
                      variant={p === page ? 'default' : 'ghost'}
                      size='icon'
                      className='size-7 text-xs'
                      onClick={() => handlePageChange(p)}
                      disabled={isFetching}
                      aria-label={`${t('page')} ${p}`}
                    >
                      {p}
                    </Button>
                  ) : (
                    <span key={idx} className='px-1 text-muted-foreground'>
                      <IconDots className='size-3.5' />
                    </span>
                  )
                )}
              </div>

              <Button type='button'
                variant='outline'
                size='icon'
                className='size-7'
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages || isFetching}
                aria-label={t('nextPage')}
              >
                <IconChevronRight className='size-3.5' />
              </Button>
              <Button type='button'
                variant='outline'
                size='icon'
                className='size-7'
                onClick={() => handlePageChange(totalPages)}
                disabled={page === totalPages || isFetching}
                aria-label={t('lastPage')}
              >
                <IconChevronsRight className='size-3.5' />
              </Button>
            </div>
          )}
        </div>
      )}

      {}
      <DealBuilderDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        deal={editingDeal}
        onSuccess={() => {
          refetch();
        }}
      />
    </div>
  );
}
