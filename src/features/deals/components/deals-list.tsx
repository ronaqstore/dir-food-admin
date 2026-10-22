'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Spinner } from '@/components/ui/spinner';
import {
  IconPlus,
  IconPencil,
  IconSearch,
  IconPhoto,
  IconTrash,
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
import { formatPkr, fromPaisa } from '@/lib/money';
import { usePaginatedMenuItems, useUpdateMenuItem } from '@/features/menu/api/menu-query';
import { DealBuilderDialog } from './deal-builder-dialog';
import type { MenuItemDTO } from '@/features/menu/types';

export function DealsList() {
  const [search, setSearch] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState<number>(12);
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingDeal, setEditingDeal] = React.useState<MenuItemDTO | null>(null);

  const topRef = React.useRef<HTMLDivElement>(null);

  // Debounce search query and reset page to 1
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
      toast.success(nextState ? 'Deal marked as available' : 'Deal marked as sold out');
    } catch {
      toast.error('Failed to update deal status');
    }
  };

  const handleDeleteDeal = async (deal: MenuItemDTO) => {
    if (!window.confirm(`Are you sure you want to remove "${deal.name}"?`)) return;
    try {
      await updateMenuItem.mutateAsync({
        id: deal.id,
        input: { isActive: false }
      });
      toast.success('Deal removed');
      refetch();
    } catch {
      toast.error('Failed to remove deal');
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

  return (
    <div
      ref={topRef}
      className='scroll-mt-6 space-y-5 p-4 sm:p-6 max-w-7xl mx-auto w-full min-w-0 overflow-x-hidden'
    >
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 min-w-0'>
        <div className='min-w-0'>
          <h1 className='text-xl sm:text-2xl font-bold tracking-tight truncate'>Deals & Combos</h1>
          <p className='text-xs sm:text-sm text-muted-foreground mt-0.5'>
            Manage your promotional bundles, package offers, and discounted combos.
          </p>
        </div>

        <Button onClick={handleCreateNew} className='gap-1.5 shrink-0 self-start sm:self-auto'>
          <IconPlus className='size-4' />
          <span>Create Deal</span>
        </Button>
      </div>

      {/* Metrics & Filter Bar */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border bg-card p-3 min-w-0'>
        <div className='flex items-center gap-2 text-xs'>
          <span className='font-medium text-muted-foreground'>
            Total Deals: <strong className='text-foreground'>{totalDeals}</strong>
          </span>
          {isFetching && !isLoading && (
            <span className='inline-flex items-center text-muted-foreground text-[11px] gap-1'>
              <Spinner className='size-3 animate-spin' />
              <span>Updating...</span>
            </span>
          )}
        </div>

        <div className='flex items-center gap-2 min-w-0 w-full sm:w-auto'>
          {/* Search Input */}
          <div className='relative flex-1 sm:w-64 min-w-0'>
            <IconSearch className='absolute start-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground' />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder='Search deals...'
              className='h-8 ps-8 pe-7 text-xs w-full'
            />
            {search && (
              <button
                type='button'
                onClick={() => setSearch('')}
                className='absolute end-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5'
                aria-label='Clear search'
              >
                <IconX className='size-3.5' />
              </button>
            )}
          </div>

          {/* Grid / List View Toggle */}
          <div className='flex items-center rounded-md border p-0.5 shrink-0'>
            <button
              type='button'
              onClick={() => setViewMode('grid')}
              className={`p-1 rounded transition-colors ${
                viewMode === 'grid' ? 'bg-muted text-foreground' : 'text-muted-foreground'
              }`}
              aria-label='Grid view'
            >
              <IconLayoutGrid className='size-4' />
            </button>
            <button
              type='button'
              onClick={() => setViewMode('list')}
              className={`p-1 rounded transition-colors ${
                viewMode === 'list' ? 'bg-muted text-foreground' : 'text-muted-foreground'
              }`}
              aria-label='List view'
            >
              <IconList className='size-4' />
            </button>
          </div>
        </div>
      </div>

      {/* Loading & Error States */}
      {isLoading ? (
        <div className='flex items-center justify-center py-20 text-muted-foreground'>
          <Spinner className='mr-2 size-5' />
          <span className='text-sm'>Loading deals...</span>
        </div>
      ) : error ? (
        <div className='rounded-lg border border-destructive/20 bg-destructive/10 p-6 text-center space-y-2'>
          <p className='text-sm text-destructive font-medium'>Failed to load deals</p>
          <Button variant='outline' size='sm' onClick={() => refetch()}>
            Try Again
          </Button>
        </div>
      ) : deals.length === 0 ? (
        <div className='rounded-xl border border-dashed p-10 text-center space-y-3'>
          <div className='mx-auto flex size-12 items-center justify-center rounded-full bg-muted'>
            <IconPhoto className='size-6 text-muted-foreground opacity-60' />
          </div>
          <div>
            <h3 className='text-sm font-semibold text-foreground'>
              {debouncedSearch ? 'No deals match your search' : 'No deals created yet'}
            </h3>
            <p className='text-xs text-muted-foreground mt-1 max-w-sm mx-auto'>
              {debouncedSearch
                ? `No offers matched "${debouncedSearch}". Try a different keyword.`
                : 'Create bundle offers like "Family Feast Deal" or "Student Combo" to boost average order value.'}
            </p>
          </div>
          {debouncedSearch ? (
            <Button variant='outline' size='sm' onClick={() => setSearch('')}>
              Clear Search
            </Button>
          ) : (
            <Button onClick={handleCreateNew} size='sm' className='gap-1.5'>
              <IconPlus className='size-4' />
              <span>Create First Deal</span>
            </Button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 min-w-0'>
          {deals.map((deal) => {
            const origPrice = deal.originalPrice;
            const basePrice = deal.basePrice;
            const hasDiscount =
              origPrice != null &&
              basePrice != null &&
              origPrice > basePrice;
            const discountPct =
              hasDiscount && origPrice != null && basePrice != null
                ? Math.round(
                    ((fromPaisa(origPrice) - fromPaisa(basePrice)) /
                      fromPaisa(origPrice)) *
                      100
                  )
                : 0;

            const comboItems = deal.description
              ? deal.description.split('+').map((s) => s.trim()).filter(Boolean)
              : [];

            return (
              <div
                key={deal.id}
                className='rounded-xl border bg-card overflow-hidden shadow-xs flex flex-col justify-between hover:border-border/80 transition-colors min-w-0'
              >
                <div className='min-w-0'>
                  {/* Photo or Header */}
                  {deal.imageUrl ? (
                    <div className='relative h-36 w-full bg-muted overflow-hidden'>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={deal.imageUrl}
                        alt={deal.name}
                        className='size-full object-cover'
                      />
                      {discountPct > 0 ? (
                        <div className='absolute top-2.5 start-2.5'>
                          <Badge className='bg-rose-600 text-white font-semibold text-[10px] px-2'>
                            {discountPct}% OFF
                          </Badge>
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <div className='p-3.5 pb-0 flex items-center justify-between min-w-0'>
                      <Badge variant='outline' className='text-[10px] font-medium truncate max-w-[70%]'>
                        {deal.category?.name || 'Combo Deal'}
                      </Badge>
                      {discountPct > 0 ? (
                        <Badge className='bg-rose-600 text-white font-semibold text-[10px] px-2 shrink-0'>
                          {discountPct}% OFF
                        </Badge>
                      ) : null}
                    </div>
                  )}

                  {/* Body */}
                  <div className='p-3.5 space-y-2.5 min-w-0'>
                    <div className='space-y-0.5 min-w-0'>
                      <h3 className='font-semibold text-sm text-foreground truncate' title={deal.name}>
                        {deal.name}
                      </h3>
                      {deal.category?.name && deal.imageUrl ? (
                        <p className='text-[11px] text-muted-foreground truncate'>{deal.category.name}</p>
                      ) : null}
                    </div>

                    {/* Combo contents chips */}
                    {comboItems.length > 0 ? (
                      <div className='flex flex-wrap gap-1 max-h-16 overflow-y-auto'>
                        {comboItems.map((item, idx) => (
                          <span
                            key={idx}
                            className='inline-flex items-center rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-foreground truncate max-w-full'
                            title={item}
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    ) : null}

                    {/* Pricing */}
                    <div className='flex items-baseline gap-2 pt-0.5'>
                      <span className='text-base font-bold text-foreground'>
                        {deal.basePrice != null ? formatPkr(deal.basePrice) : 'Rs. 0'}
                      </span>
                      {hasDiscount && origPrice != null ? (
                        <span className='text-xs line-through text-muted-foreground'>
                          {formatPkr(origPrice)}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className='border-t p-3 flex items-center justify-between gap-2 bg-muted/20'>
                  <div className='flex items-center gap-2 shrink-0'>
                    <Switch
                      checked={deal.isAvailable !== false}
                      onCheckedChange={() => handleToggleAvailability(deal)}
                      disabled={updateMenuItem.isPending}
                    />
                    <span className='text-xs text-muted-foreground'>
                      {deal.isAvailable !== false ? 'Available' : 'Sold out'}
                    </span>
                  </div>

                  <div className='flex items-center gap-1 shrink-0'>
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={() => handleEditDeal(deal)}
                      className='size-7'
                      aria-label='Edit deal'
                    >
                      <IconPencil className='size-3.5' />
                    </Button>
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={() => handleDeleteDeal(deal)}
                      className='size-7 text-muted-foreground hover:text-destructive'
                      aria-label='Delete deal'
                    >
                      <IconTrash className='size-3.5' />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className='rounded-lg border divide-y bg-card overflow-hidden min-w-0'>
          {deals.map((deal) => {
            const origPrice = deal.originalPrice;
            const basePrice = deal.basePrice;
            const hasDiscount =
              origPrice != null &&
              basePrice != null &&
              origPrice > basePrice;
            const discountPct =
              hasDiscount && origPrice != null && basePrice != null
                ? Math.round(
                    ((fromPaisa(origPrice) - fromPaisa(basePrice)) /
                      fromPaisa(origPrice)) *
                      100
                  )
                : 0;

            return (
              <div
                key={deal.id}
                className='p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/30 transition-colors min-w-0'
              >
                <div className='flex items-center gap-3 min-w-0 flex-1'>
                  {deal.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={deal.imageUrl}
                      alt={deal.name}
                      className='size-12 rounded-md object-cover bg-muted shrink-0'
                    />
                  ) : (
                    <div className='size-12 rounded-md bg-muted flex items-center justify-center shrink-0'>
                      <IconPhoto className='size-5 text-muted-foreground opacity-50' />
                    </div>
                  )}

                  <div className='space-y-0.5 min-w-0 flex-1'>
                    <div className='flex items-center gap-2 min-w-0'>
                      <h4 className='font-semibold text-sm truncate' title={deal.name}>
                        {deal.name}
                      </h4>
                      {discountPct > 0 ? (
                        <Badge className='bg-rose-600 text-white text-[10px] px-1.5 py-0 shrink-0'>
                          {discountPct}% OFF
                        </Badge>
                      ) : null}
                    </div>
                    {deal.description ? (
                      <p className='text-xs text-muted-foreground truncate' title={deal.description}>
                        {deal.description}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className='flex items-center justify-between sm:justify-end gap-4 shrink-0'>
                  <div className='text-start sm:text-end'>
                    <div className='font-bold text-sm'>
                      {deal.basePrice != null ? formatPkr(deal.basePrice) : 'Rs. 0'}
                    </div>
                    {hasDiscount && origPrice != null ? (
                      <div className='text-[11px] line-through text-muted-foreground'>
                        {formatPkr(origPrice)}
                      </div>
                    ) : null}
                  </div>

                  <div className='flex items-center gap-2'>
                    <Switch
                      checked={deal.isAvailable !== false}
                      onCheckedChange={() => handleToggleAvailability(deal)}
                      disabled={updateMenuItem.isPending}
                    />
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={() => handleEditDeal(deal)}
                      className='size-7'
                      aria-label='Edit deal'
                    >
                      <IconPencil className='size-3.5' />
                    </Button>
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={() => handleDeleteDeal(deal)}
                      className='size-7 text-muted-foreground hover:text-destructive'
                      aria-label='Delete deal'
                    >
                      <IconTrash className='size-3.5' />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Bar */}
      {totalDeals > 0 && (
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t text-xs text-muted-foreground min-w-0'>
          {/* Range & Page Size Info */}
          <div className='flex flex-wrap items-center gap-3'>
            <span>
              Showing <strong className='text-foreground'>{startItem}–{endItem}</strong> of{' '}
              <strong className='text-foreground'>{totalDeals}</strong> deals
            </span>
            <span className='text-border hidden sm:inline'>•</span>
            <div className='flex items-center gap-1.5'>
              <span>Per page:</span>
              {[12, 24, 48].map((size) => (
                <button
                  key={size}
                  type='button'
                  onClick={() => {
                    setPageSize(size);
                    setPage(1);
                  }}
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

          {/* Navigation Controls */}
          {totalPages > 1 && (
            <div className='flex items-center gap-1 self-center sm:self-auto'>
              <Button
                variant='outline'
                size='icon'
                className='size-7'
                onClick={() => handlePageChange(1)}
                disabled={page === 1 || isFetching}
                aria-label='First page'
              >
                <IconChevronsLeft className='size-3.5' />
              </Button>
              <Button
                variant='outline'
                size='icon'
                className='size-7'
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1 || isFetching}
                aria-label='Previous page'
              >
                <IconChevronLeft className='size-3.5' />
              </Button>

              <div className='flex items-center gap-1 px-1'>
                {paginationRange.map((p, idx) =>
                  typeof p === 'number' ? (
                    <Button
                      key={idx}
                      variant={p === page ? 'default' : 'ghost'}
                      size='icon'
                      className='size-7 text-xs'
                      onClick={() => handlePageChange(p)}
                      disabled={isFetching}
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

              <Button
                variant='outline'
                size='icon'
                className='size-7'
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages || isFetching}
                aria-label='Next page'
              >
                <IconChevronRight className='size-3.5' />
              </Button>
              <Button
                variant='outline'
                size='icon'
                className='size-7'
                onClick={() => handlePageChange(totalPages)}
                disabled={page === totalPages || isFetching}
                aria-label='Last page'
              >
                <IconChevronsRight className='size-3.5' />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Dialog */}
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
