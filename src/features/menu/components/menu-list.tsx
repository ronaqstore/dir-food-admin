'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  MenuItemCardSkeleton,
  MenuItemListRowSkeleton
} from '@/components/skeletons/menu-skeleton';
import {
  IconPlus,
  IconSalad,
  IconFlame
} from '@tabler/icons-react';
import { useCategories } from '@/features/categories/api/categories-query';
import { usePaginatedMenuItems, useUpdateMenuItem } from '../api/menu-query';
import { parseSortParam } from '../lib/sort-utils';
import { StandardPagination } from '@/components/ui/standard-pagination';
import { MenuItemDialog } from './menu-item-dialog';
import { FoodCard, FoodTableView } from './menu-item-cards';
import { MenuHeaderControls } from './menu-header-controls';
import { MenuMobileSheet } from './menu-mobile-sheet';
import type { MenuItemDTO, ViewMode, StatusFilter, MenuItemTab } from '../types';

export function MenuList() {
  const t = useTranslations();
  const [activeTab, setActiveTab] = React.useState<MenuItemTab>('dishes');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>('all');
  const [search, setSearch] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  const [viewMode, setViewMode] = React.useState<ViewMode>('grid');
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<MenuItemDTO | null>(null);
  const [mobileCategorySheetOpen, setMobileCategorySheetOpen] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(20);
  const [sortBy, setSortBy] = React.useState('default');

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { sortBy: backendSortBy, sortOrder: backendSortOrder } = React.useMemo(
    () => parseSortParam(sortBy),
    [sortBy]
  );

  const { data: categories, isLoading: isCategoriesLoading } = useCategories();
  const {
    data: paginatedData,
    isLoading: isItemsLoading,
    isFetching,
    error,
    refetch
  } = usePaginatedMenuItems({
    categoryId: selectedCategory !== 'all' ? selectedCategory : undefined,
    search: debouncedSearch || undefined,
    isDeal: activeTab === 'deals',
    isAvailable:
      statusFilter === 'available'
        ? true
        : statusFilter === 'soldOut'
          ? false
          : undefined,
    page,
    limit: pageSize,
    sortBy: backendSortBy,
    sortOrder: backendSortOrder
  });

  const updateItem = useUpdateMenuItem();

  const items = paginatedData?.data ?? [];
  const totalServerCount = paginatedData?.meta?.total ?? items.length;

  const handleOpenCreate = () => {
    setEditingItem(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (item: MenuItemDTO) => {
    setEditingItem(item);
    setDialogOpen(true);
  };

  const handleToggleAvailability = async (item: MenuItemDTO) => {
    try {
      await updateItem.mutateAsync({
        id: item.id,
        input: { isAvailable: !item.isAvailable }
      });
      toast.success(t('menuItems.statusToggleSuccess'));
    } catch (err) {
      const msg = err instanceof Error ? err.message : t('common.unexpectedError');
      toast.error(msg);
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setSelectedCategory('all');
    setSortBy('default');
    setPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const handleStatusFilterChange = (val: StatusFilter) => {
    setStatusFilter(val);
    setPage(1);
  };

  const handleSortChange = (val: string | null) => {
    if (val != null) {
      setSortBy(val);
      setPage(1);
    }
  };

  const handleTabChange = (tab: MenuItemTab) => {
    setActiveTab(tab);
    setPage(1);
    setSelectedCategory('all');
  };

  const handleSelectCategory = (catId: string) => {
    setSelectedCategory(catId);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(1);
  };

  const categoryCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    if (!categories) return counts;
    for (const cat of categories) {
      counts[cat.id] = cat._count?.items ?? 0;
    }
    return counts;
  }, [categories]);

  const dishesCount = paginatedData?.meta?.dishesCount ?? 0;
  const dealsCount = paginatedData?.meta?.dealsCount ?? 0;
  const totalCount = paginatedData?.meta?.totalCount ?? totalServerCount;
  const availableCount = paginatedData?.meta?.availableCount ?? 0;
  const soldOutCount = paginatedData?.meta?.soldOutCount ?? 0;

  const filteredCategories = React.useMemo(() => {
    if (!categories) return [];
    if (activeTab === 'dishes') {
      return categories.filter((c) => c.name.toLowerCase() !== 'deals & combos');
    }
    return categories.filter(
      (c) => c.name.toLowerCase() === 'deals & combos' || (c._count?.items ?? 0) > 0
    );
  }, [categories, activeTab]);

  const allCategoriesTotal = React.useMemo(() => {
    return activeTab === 'deals' ? dealsCount : dishesCount;
  }, [activeTab, dealsCount, dishesCount]);

  const filteredItems = items;
  const hasNoCategories = !isCategoriesLoading && (!categories || categories.length === 0);

  const renderFoodCard = (item: MenuItemDTO) => (
    <FoodCard
      key={item.id}
      item={item}
      categories={categories}
      onEdit={handleOpenEdit}
      onToggleAvailability={handleToggleAvailability}
      isPending={updateItem.isPending}
      t={t}
    />
  );

  if (error && !items.length && !categories) {
    return (
      <div className='flex h-64 flex-col items-center justify-center gap-3 text-center'>
        <p className='text-sm text-destructive font-medium'>
          {error instanceof Error ? error.message : t('common.unexpectedError')}
        </p>
        <Button type='button' variant='outline' size='sm' onClick={() => refetch()}>
          {t('common.tryAgain')}
        </Button>
      </div>
    );
  }

  return (
    <div className='flex min-h-0 min-w-0 flex-1 flex-col space-y-4 overflow-y-auto overscroll-y-contain pb-8'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <div className='flex items-center gap-2'>
            <h1 className='text-2xl font-bold tracking-tight text-foreground'>
              {t('menuItems.title')}
            </h1>
            <Badge variant='secondary' className='text-xs font-mono font-normal'>
              {totalServerCount}
            </Badge>
          </div>
          <p className='text-xs text-muted-foreground mt-0.5'>{t('menuItems.description')}</p>
        </div>

        <div className='flex items-center gap-2'>
          <Button
            type='button'
            onClick={handleOpenCreate}
            disabled={hasNoCategories}
            className='gap-1.5'
          >
            <IconPlus className='size-4' />
            <span>
              {activeTab === 'deals' ? t('deals.createDeal') : t('menuItems.newItem')}
            </span>
          </Button>
        </div>
      </div>

      <MenuHeaderControls
        activeTab={activeTab}
        onTabChange={handleTabChange}
        dishesCount={dishesCount}
        dealsCount={dealsCount}
        search={search}
        onSearchChange={handleSearchChange}
        statusFilter={statusFilter}
        onStatusFilterChange={handleStatusFilterChange}
        sortBy={sortBy}
        onSortChange={handleSortChange}
        totalCount={totalCount}
        availableCount={availableCount}
        soldOutCount={soldOutCount}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
        categories={filteredCategories}
        categoryCounts={categoryCounts}
        allCategoriesTotal={allCategoriesTotal}
        t={t}
      />

      <div className='min-w-0 space-y-4'>
        {isItemsLoading ? (
          viewMode === 'grid' ? (
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <MenuItemCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className='rounded-xl border bg-card shadow-xs overflow-hidden divide-y'>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <MenuItemListRowSkeleton key={i} />
              ))}
            </div>
          )
        ) : filteredItems.length === 0 ? (
          <div className='flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center animate-in fade-in-50'>
            <div className='flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground mb-3'>
              {activeTab === 'deals' ? (
                <IconFlame className='size-6 text-amber-500' />
              ) : (
                <IconSalad className='size-6' />
              )}
            </div>
            <h3 className='text-base font-semibold text-foreground mb-1'>
              {search || statusFilter !== 'all' || selectedCategory !== 'all'
                ? t('menuItems.noFilteredMatches')
                : activeTab === 'deals'
                  ? t('deals.noItemsAdded')
                  : t('menuItems.emptyTitle')}
            </h3>
            <p className='text-xs text-muted-foreground max-w-sm mb-4'>
              {search || statusFilter !== 'all' || selectedCategory !== 'all'
                ? t('menuItems.noFilteredMatches')
                : activeTab === 'deals'
                  ? t('deals.createFirstDeal')
                  : t('menuItems.emptyDescription')}
            </p>
            {search || statusFilter !== 'all' || selectedCategory !== 'all' ? (
              <Button type='button' variant='outline' size='sm' onClick={handleResetFilters}>
                {t('menuItems.resetFilters')}
              </Button>
            ) : (
              <Button
                type='button'
                onClick={handleOpenCreate}
                disabled={hasNoCategories}
                className='gap-1.5'
              >
                <IconPlus className='size-4' />
                <span>
                  {activeTab === 'deals' ? t('deals.createDeal') : t('menuItems.newItem')}
                </span>
              </Button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
            {filteredItems.map(renderFoodCard)}
          </div>
        ) : (
          <FoodTableView
            items={filteredItems}
            categories={categories}
            onEdit={handleOpenEdit}
            onToggleAvailability={handleToggleAvailability}
            isPending={updateItem.isPending}
            t={t}
          />
        )}

        {totalServerCount > 0 ? (
          <div className='pt-3 border-t'>
            <StandardPagination
              page={page}
              pageSize={pageSize}
              total={totalServerCount}
              pageSizeOptions={[10, 20, 30, 50]}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              disabled={isFetching}
            />
          </div>
        ) : null}
      </div>

      <MenuMobileSheet
        open={mobileCategorySheetOpen}
        onOpenChange={setMobileCategorySheetOpen}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        categories={filteredCategories}
        categoryCounts={categoryCounts}
        allCategoriesTotal={allCategoriesTotal}
        t={t}
      />

      <MenuItemDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        item={editingItem}
        defaultCategoryId={selectedCategory !== 'all' ? selectedCategory : undefined}
        defaultIsDeal={activeTab === 'deals'}
      />
    </div>
  );
}
