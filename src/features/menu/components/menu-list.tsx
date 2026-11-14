'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import {
  MenuItemCardSkeleton,
  MenuItemListRowSkeleton,
  MenuManagementSkeleton
} from '@/components/skeletons/menu-skeleton';
import {
  IconPlus,
  IconSalad,
  IconChevronDown,
  IconChevronUp
} from '@tabler/icons-react';
import { useCategories } from '@/features/categories/api/categories-query';
import { useInfiniteMenuItems, useUpdateMenuItem } from '../api/menu-query';
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

  const categoryPillsRef = React.useRef<HTMLDivElement>(null);
  const sentinelRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: categories, isLoading: isCategoriesLoading } = useCategories();
  const {
    data,
    isLoading: isItemsLoading,
    isFetching,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteMenuItems({
    categoryId: selectedCategory !== 'all' ? selectedCategory : undefined,
    search: debouncedSearch || undefined,
    isAvailable:
      statusFilter === 'available'
        ? true
        : statusFilter === 'soldOut'
          ? false
          : undefined,
    limit: 24
  });

  const updateItem = useUpdateMenuItem();

  React.useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchNextPage();
        }
      },
      { threshold: 0.1, rootMargin: '250px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const items = React.useMemo(() => {
    return data?.pages.flatMap((page) => page.data) ?? [];
  }, [data]);

  const totalServerCount = data?.pages[0]?.meta?.total ?? items.length;

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
  const availableCount = items?.filter((i) => i.isAvailable).length || 0;
  const soldOutCount = Math.max(0, totalCount - availableCount);

  const filteredItems = React.useMemo(() => {
    if (!items) return [];

    return items.filter((item) => {
      if (selectedCategory !== 'all' && item.categoryId !== selectedCategory) {
        return false;
      }

      if (statusFilter === 'available' && !item.isAvailable) return false;
      if (statusFilter === 'soldOut' && item.isAvailable) return false;

      if (search.trim()) {
        const lower = search.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(lower);
        const matchesDesc = item.description?.toLowerCase().includes(lower);
        const matchesCat = item.category?.name.toLowerCase().includes(lower);
        if (!matchesName && !matchesDesc && !matchesCat) return false;
      }

      return true;
    });
  }, [items, selectedCategory, statusFilter, search]);

  const isGroupedView = selectedCategory === 'all' && !search.trim();
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

  if (isCategoriesLoading && !categories) {
    return <MenuManagementSkeleton />;
  }

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
    <div className='flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto overscroll-y-contain pb-28 sm:pb-12 scroll-smooth'>
      <div className='space-y-4'>
        {}
        <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <div className='flex items-center gap-2.5'>
              <h1 className='text-xl sm:text-2xl font-bold tracking-tight text-foreground'>
                {t('menuItems.title')}
              </h1>
              <Badge variant='secondary' className='text-xs font-semibold'>
                {allCategoriesTotal}
              </Badge>
              {isFetching && !isItemsLoading && (
                <span className='inline-flex items-center gap-1 text-[11px] text-muted-foreground animate-in fade-in-50'>
                  <Spinner className='size-3 text-primary animate-spin' />
                </span>
              )}
            </div>
            <p className='text-xs sm:text-sm text-muted-foreground mt-0.5'>
              {t('menuItems.description')}
            </p>
          </div>

          <div className='flex items-center gap-2'>
            <Button type='button'
              onClick={handleOpenCreate}
              disabled={hasNoCategories}
              className='gap-1.5 shadow-sm'
              size='sm'
            >
              <IconPlus className='size-4' />
              <span>{t('menuItems.newItem')}</span>
            </Button>
          </div>
        </div>

        {}
        {hasNoCategories ? (
          <div className='rounded-lg border border-amber-500/20 bg-amber-500/10 p-4 text-amber-800 dark:text-amber-300 flex items-center justify-between'>
            <p className='text-sm'>{t('menuItems.noCategoryWarning')}</p>
          </div>
        ) : null}

        {}
        <MenuHeaderControls
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          totalCount={totalCount}
          availableCount={availableCount}
          soldOutCount={soldOutCount}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          categories={categories}
          categoryCounts={categoryCounts}
          allCategoriesTotal={allCategoriesTotal}
          categoryPillsRef={categoryPillsRef}
          t={t}
        />

        {}
        {isItemsLoading ? (
          viewMode === 'grid' ? (
            <div className='grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3 animate-in fade-in-50 duration-200'>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <MenuItemCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className='rounded-xl border bg-card shadow-xs overflow-hidden divide-y animate-in fade-in-50 duration-200'>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <MenuItemListRowSkeleton key={i} />
              ))}
            </div>
          )
        ) : error ? (
          <div className='flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-destructive/30 p-8 text-center animate-in fade-in-50 bg-destructive/5'>
            <p className='text-sm text-destructive font-medium mb-3'>
              {error instanceof Error ? error.message : t('common.unexpectedError')}
            </p>
            <Button type='button' variant='outline' size='sm' onClick={() => refetch()}>
              {t('common.tryAgain')}
            </Button>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className='flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center animate-in fade-in-50 bg-card/40'>
            <div className='flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary mb-4'>
              <IconSalad className='size-7' />
            </div>
            <h3 className='text-base font-semibold text-foreground mb-1'>
              {search || statusFilter !== 'all'
                ? t('menuItems.noFilteredMatches')
                : t('menuItems.emptyTitle')}
            </h3>
            <p className='text-xs text-muted-foreground max-w-sm mb-5'>
              {search || statusFilter !== 'all'
                ? t('common.reloadPage')
                : t('menuItems.emptyDescription')}
            </p>
            {search || statusFilter !== 'all' ? (
              <Button type='button'
                variant='outline'
                size='sm'
                onClick={handleResetFilters}
              >
                {t('menuItems.resetFilters')}
              </Button>
            ) : (
              <Button type='button' onClick={handleOpenCreate} disabled={hasNoCategories} className='gap-1.5' size='sm'>
                <IconPlus className='size-4' />
                <span>{t('menuItems.newItem')}</span>
              </Button>
            )}
          </div>
        ) : isGroupedView && viewMode === 'grid' ? (
          <div className='space-y-8'>
            {groupedByCategory.map(({ category, items: catItems }) => {
              const isCollapsed = Boolean(collapsedCategories[category.id]);

              return (
                <section
                  key={category.id}
                  id={`cat-section-${category.id}`}
                  className='space-y-3 scroll-mt-28'
                >
                  {}
                  <div className='flex items-center justify-between border-b pb-2 pt-1'>
                    <div className='flex items-center gap-2'>
                      <h2 className='text-base sm:text-lg font-bold text-foreground'>
                        {category.name}
                      </h2>
                      <Badge variant='outline' className='text-xs font-medium'>
                        {catItems.length}
                      </Badge>
                    </div>

                    <Button type='button'
                      variant='ghost'
                      size='sm'
                      onClick={() => toggleCategoryCollapse(category.id)}
                      className='h-7 px-2 text-xs text-muted-foreground hover:text-foreground'
                      aria-label={isCollapsed ? t('menuItems.expand') : t('menuItems.collapse')}
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
                      {catItems.map((item) => (
                        <FoodCard
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
                </section>
              );
            })}
          </div>
        ) : viewMode === 'grid' ? (
          <div className='grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3'>
            {filteredItems.map((item) => (
              <FoodCard
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

        {}
        <div ref={sentinelRef} className='py-4'>
          {isFetchingNextPage && (
            <div className='space-y-4'>
              <div className='flex items-center justify-center gap-2 text-xs text-muted-foreground'>
                <Spinner className='size-4 text-primary' />
                <span>{t('menuItems.loadingMore')}</span>
              </div>
              {viewMode === 'grid' ? (
                <div className='grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3'>
                  {[1, 2, 3].map((i) => (
                    <MenuItemCardSkeleton key={i} />
                  ))}
                </div>
              ) : (
                <div className='rounded-xl border bg-card/60 divide-y overflow-hidden'>
                  {[1, 2, 3].map((i) => (
                    <MenuItemListRowSkeleton key={i} />
                  ))}
                </div>
              )}
            </div>
          )}

          {!hasNextPage && items.length > 0 && totalServerCount > 24 && (
            <div className='text-center py-4'>
              <p className='text-xs text-muted-foreground'>
                {t('menuItems.endOfMenu')} • {t('menuItems.dishesProgress', { count: items.length, total: totalServerCount })}
              </p>
            </div>
          )}
        </div>
      </div>

      {}
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
