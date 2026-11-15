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
  IconChevronDown,
  IconChevronUp
} from '@tabler/icons-react';
import { useCategories } from '@/features/categories/api/categories-query';
import { usePaginatedMenuItems, useUpdateMenuItem } from '../api/menu-query';
import { parseSortParam } from '../lib/sort-utils';
import { StandardPagination } from '@/components/ui/standard-pagination';
import { MenuItemDialog } from './menu-item-dialog';
import { FoodCard, FoodListItem } from './menu-item-cards';
import { MenuHeaderControls } from './menu-header-controls';
import { MenuMobileSheet } from './menu-mobile-sheet';
import type { MenuItemDTO, ViewMode, StatusFilter } from '../types';

export function MenuList() {
  const t = useTranslations();
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>('all');
  const [search, setSearch] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  const [viewMode, setViewMode] = React.useState<ViewMode>('grid');
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<MenuItemDTO | null>(null);
  const [collapsedCategories, setCollapsedCategories] = React.useState<Record<string, boolean>>({});
  const [mobileCategorySheetOpen, setMobileCategorySheetOpen] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(20);
  const [sortBy, setSortBy] = React.useState('default');

  const categoryPillsRef = React.useRef<HTMLDivElement>(null);

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

  const toggleCategoryCollapse = (catId: string) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId]
    }));
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

  const allCategoriesTotal = React.useMemo(() => {
    if (!categories || categories.length === 0) return totalServerCount;
    return categories.reduce((sum, c) => sum + (c._count?.items ?? 0), 0);
  }, [categories, totalServerCount]);

  const totalCount = totalServerCount;
  const availableCount = items.filter((i) => i.isAvailable).length;
  const soldOutCount = Math.max(0, items.length - availableCount);

  const filteredItems = items;

  const isGroupedView = selectedCategory === 'all' && !debouncedSearch && sortBy === 'default';
  const groupedByCategory = React.useMemo(() => {
    if (!isGroupedView || !categories) return [];

    return categories
      .map((cat) => {
        const catItems = filteredItems.filter((item) => item.categoryId === cat.id);
        return {
          category: cat,
          items: catItems
        };
      })
      .filter((group) => group.items.length > 0);
  }, [isGroupedView, categories, filteredItems]);

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
            <span>{t('menuItems.newItem')}</span>
          </Button>
        </div>
      </div>

      <MenuHeaderControls
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
        categories={categories}
        categoryCounts={categoryCounts}
        allCategoriesTotal={allCategoriesTotal}
        categoryPillsRef={categoryPillsRef}
        t={t}
      />

      <div className='min-w-0 space-y-4'>
        {isItemsLoading ? (
          viewMode === 'grid' ? (
            <div className='grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3'>
              {[1, 2, 3, 4, 5, 6].map((i) => (
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
              <IconSalad className='size-6' />
            </div>
            <h3 className='text-base font-semibold text-foreground mb-1'>
              {t('menuItems.emptyTitle')}
            </h3>
            <p className='text-xs text-muted-foreground max-w-sm mb-4'>
              {search || statusFilter !== 'all' || selectedCategory !== 'all'
                ? t('menuItems.noFilteredMatches')
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
                <span>{t('menuItems.newItem')}</span>
              </Button>
            )}
          </div>
        ) : isGroupedView && groupedByCategory.length > 0 ? (
          <div className='space-y-6'>
            {groupedByCategory.map(({ category, items: catItems }) => {
              const isCollapsed = collapsedCategories[category.id] ?? false;

              return (
                <section key={category.id} className='space-y-3'>
                  <div className='flex items-center justify-between border-b pb-1.5'>
                    <div className='flex items-center gap-2'>
                      <h2 className='text-sm font-semibold text-foreground tracking-tight'>
                        {category.name}
                      </h2>
                      <span className='text-xs font-mono text-muted-foreground'>
                        ({catItems.length})
                      </span>
                    </div>

                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      className='h-7 px-2 text-xs text-muted-foreground hover:text-foreground'
                      onClick={() => toggleCategoryCollapse(category.id)}
                    >
                      {isCollapsed ? (
                        <div className='flex items-center gap-1'>
                          <span>{t('menuItems.expand')}</span>
                          <IconChevronDown className='size-3.5' />
                        </div>
                      ) : (
                        <div className='flex items-center gap-1'>
                          <span>{t('menuItems.collapse')}</span>
                          <IconChevronUp className='size-3.5' />
                        </div>
                      )}
                    </Button>
                  </div>

                  {!isCollapsed && (
                    <div className='grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3'>
                      {catItems.map(renderFoodCard)}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        ) : viewMode === 'grid' ? (
          <div className='grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3'>
            {filteredItems.map(renderFoodCard)}
          </div>
        ) : (
          <div className='rounded-xl border bg-card shadow-xs overflow-hidden divide-y'>
            {filteredItems.map((item) => (
              <FoodListItem
                key={item.id}
                item={item}
                categories={categories}
                onEdit={handleOpenEdit}
                onToggleAvailability={handleToggleAvailability}
                isPending={updateItem.isPending}
                t={t}
              />
            ))}
          </div>
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
        categories={categories}
        categoryCounts={categoryCounts}
        allCategoriesTotal={allCategoriesTotal}
        t={t}
      />

      <MenuItemDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        item={editingItem}
        defaultCategoryId={selectedCategory !== 'all' ? selectedCategory : undefined}
      />
    </div>
  );
}
