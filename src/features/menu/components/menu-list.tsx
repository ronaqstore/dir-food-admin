'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Spinner } from '@/components/ui/spinner';
import { MenuManagementSkeleton } from '@/components/skeletons/menu-skeleton';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import {
  IconPlus,
  IconPencil,
  IconSearch,
  IconPhoto,
  IconSalad,
  IconToolsKitchen2,
  IconLayoutGrid,
  IconList,
  IconX,
  IconChevronDown,
  IconChevronUp,
  IconCheck,
  IconAlertCircle
} from '@tabler/icons-react';
import { formatPkr } from '@/lib/money';
import { useCategories } from '@/features/categories/api/categories-query';
import { useInfiniteMenuItems, useUpdateMenuItem } from '../api/menu-query';
import { MenuItemDialog } from './menu-item-dialog';
import type { MenuItemDTO } from '../types';

type ViewMode = 'grid' | 'list';
type StatusFilter = 'all' | 'available' | 'soldOut';

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
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteMenuItems({
    categoryId: selectedCategory !== 'all' ? selectedCategory : undefined,
    search: debouncedSearch || undefined,
    limit: 24
  });

  const updateItem = useUpdateMenuItem();

  // Infinite scroll trigger via IntersectionObserver
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

  // Flatten paginated pages into single items list
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

  // Pre-calculate counts per category for the chips
  const categoryCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    if (!items) return counts;
    for (const item of items) {
      counts[item.categoryId] = (counts[item.categoryId] || 0) + 1;
    }
    return counts;
  }, [items]);

  // Overall metrics
  const totalCount = totalServerCount;
  const availableCount = items?.filter((i) => i.isAvailable).length || 0;
  const soldOutCount = Math.max(0, totalCount - availableCount);

  // Filtered items based on Category, Status, and Search query
  const filteredItems = React.useMemo(() => {
    if (!items) return [];

    return items.filter((item) => {
      // Category filter
      if (selectedCategory !== 'all' && item.categoryId !== selectedCategory) {
        return false;
      }

      // Availability status filter
      if (statusFilter === 'available' && !item.isAvailable) return false;
      if (statusFilter === 'soldOut' && item.isAvailable) return false;

      // Text search filter
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

  // Group filtered items by category when viewing all categories with no search
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

  if (isCategoriesLoading || isItemsLoading) {
    return <MenuManagementSkeleton />;
  }

  if (error) {
    return (
      <div className='flex h-64 flex-col items-center justify-center gap-3 text-center'>
        <p className='text-sm text-destructive font-medium'>
          {error instanceof Error ? error.message : t('common.unexpectedError')}
        </p>
        <Button variant='outline' size='sm' onClick={() => refetch()}>
          {t('common.tryAgain')}
        </Button>
      </div>
    );
  }

  return (
    <div className='flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto overscroll-y-contain pb-28 sm:pb-12 scroll-smooth'>
      <div className='space-y-4'>
        {/* Page Header */}
        <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <div className='flex items-center gap-2.5'>
              <h1 className='text-xl sm:text-2xl font-bold tracking-tight text-foreground'>
                {t('menuItems.title')}
              </h1>
              <Badge variant='secondary' className='text-xs font-semibold'>
                {totalCount}
              </Badge>
            </div>
            <p className='text-xs sm:text-sm text-muted-foreground mt-0.5'>
              {t('menuItems.description')}
            </p>
          </div>

          <div className='flex items-center gap-2'>
            <Button
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

        {/* Warning if no categories */}
        {hasNoCategories ? (
          <div className='rounded-lg border border-amber-500/20 bg-amber-500/10 p-4 text-amber-800 dark:text-amber-300 flex items-center justify-between'>
            <p className='text-sm'>{t('menuItems.noCategoryWarning')}</p>
          </div>
        ) : null}

        {/* Sticky Control & Filter Bar (Foodpanda / Zomato style) */}
        <div className='sticky top-0 z-20 -mx-4 px-4 sm:-mx-6 sm:px-6 bg-background/95 backdrop-blur-md border-b pb-3 pt-1 space-y-3'>
          {/* Row 1: Search, Stock status pills & View Switcher */}
          <div className='flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between'>
            {/* Search Input */}
            <div className='relative flex-1 max-w-md'>
              <IconSearch className='absolute start-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground' />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('menuItems.searchPlaceholder')}
                className='ps-9 pe-8 h-9 text-xs sm:text-sm bg-card'
              />
              {search ? (
                <button
                  type='button'
                  onClick={() => setSearch('')}
                  className='absolute end-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
                  aria-label={t('menuItems.clearSearch')}
                >
                  <IconX className='size-3.5' />
                </button>
              ) : null}
            </div>

            <div className='flex items-center justify-between sm:justify-end gap-2'>
              {/* Status Filter Chips */}
              <div className='flex items-center rounded-lg border bg-muted/40 p-0.5 text-xs font-medium'>
                <button
                  type='button'
                  onClick={() => setStatusFilter('all')}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    statusFilter === 'all'
                      ? 'bg-background text-foreground shadow-xs font-semibold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t('menuItems.statusAll')} ({totalCount})
                </button>
                <button
                  type='button'
                  onClick={() => setStatusFilter('available')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
                    statusFilter === 'available'
                      ? 'bg-background text-emerald-600 dark:text-emerald-400 shadow-xs font-semibold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span className='size-1.5 rounded-full bg-emerald-500' />
                  <span>{t('menuItems.statusAvailable')} ({availableCount})</span>
                </button>
                <button
                  type='button'
                  onClick={() => setStatusFilter('soldOut')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
                    statusFilter === 'soldOut'
                      ? 'bg-background text-amber-600 dark:text-amber-400 shadow-xs font-semibold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span className='size-1.5 rounded-full bg-amber-500' />
                  <span>{t('menuItems.statusSoldOut')} ({soldOutCount})</span>
                </button>
              </div>

              {/* View Switcher (Grid vs List for 100+ scalability) */}
              <div className='hidden sm:flex items-center rounded-lg border bg-muted/40 p-0.5'>
                <Button
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  size='icon'
                  className='size-7'
                  onClick={() => setViewMode('grid')}
                  title={t('menuItems.viewGrid')}
                  aria-label={t('menuItems.viewGrid')}
                >
                  <IconLayoutGrid className='size-4' />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  size='icon'
                  className='size-7'
                  onClick={() => setViewMode('list')}
                  title={t('menuItems.viewList')}
                  aria-label={t('menuItems.viewList')}
                >
                  <IconList className='size-4' />
                </Button>
              </div>
            </div>
          </div>

          {/* Row 2: Category Scrollable Pills (with Counts) */}
          <div
            ref={categoryPillsRef}
            className='flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth py-0.5'
          >
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size='sm'
              onClick={() => setSelectedCategory('all')}
              className='rounded-full text-xs shrink-0 h-7 px-3 font-medium'
            >
              <span>{t('menuItems.filterByCategory')}</span>
              <span
                className={`ms-1.5 rounded-full px-1.5 py-0.2 text-[10px] ${
                  selectedCategory === 'all'
                    ? 'bg-primary-foreground/20 text-primary-foreground font-bold'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {totalCount}
              </span>
            </Button>

            {categories?.map((cat) => {
              const count = categoryCounts[cat.id] || 0;
              const isSelected = selectedCategory === cat.id;

              return (
                <Button
                  key={cat.id}
                  variant={isSelected ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => setSelectedCategory(cat.id)}
                  className='rounded-full text-xs shrink-0 h-7 px-3 font-medium'
                >
                  <span>{cat.name}</span>
                  <span
                    className={`ms-1.5 rounded-full px-1.5 py-0.2 text-[10px] ${
                      isSelected
                        ? 'bg-primary-foreground/20 text-primary-foreground font-bold'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {count}
                  </span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        {filteredItems.length === 0 ? (
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
              <Button
                variant='outline'
                size='sm'
                onClick={() => {
                  setSearch('');
                  setStatusFilter('all');
                  setSelectedCategory('all');
                }}
              >
                {t('menuItems.resetFilters')}
              </Button>
            ) : (
              <Button onClick={handleOpenCreate} disabled={hasNoCategories} className='gap-1.5' size='sm'>
                <IconPlus className='size-4' />
                <span>{t('menuItems.newItem')}</span>
              </Button>
            )}
          </div>
        ) : isGroupedView && viewMode === 'grid' ? (
          /* Foodpanda / Zomato Grouped Sections View (Categorized) */
          <div className='space-y-8'>
            {groupedByCategory.map(({ category, items: catItems }) => {
              const isCollapsed = Boolean(collapsedCategories[category.id]);

              return (
                <section
                  key={category.id}
                  id={`cat-section-${category.id}`}
                  className='space-y-3 scroll-mt-28'
                >
                  {/* Category Section Header */}
                  <div className='flex items-center justify-between border-b pb-2 pt-1'>
                    <div className='flex items-center gap-2'>
                      <h2 className='text-base sm:text-lg font-bold text-foreground'>
                        {category.name}
                      </h2>
                      <Badge variant='outline' className='text-xs font-medium'>
                        {catItems.length}
                      </Badge>
                    </div>

                    <Button
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
          /* Filtered or Flat Grid View */
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
          /* Scalable Compact List View (Best for 100+ menu items) */
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

        {/* Infinite Scroll Sentinel & Loading Indicator */}
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
                    <div
                      key={i}
                      className='h-36 rounded-xl border bg-card/60 p-3.5 animate-pulse flex flex-col justify-between'
                    >
                      <div className='flex gap-3'>
                        <div className='size-20 rounded-xl bg-muted/80 shrink-0' />
                        <div className='space-y-2 flex-1 pt-1'>
                          <div className='h-3.5 w-16 bg-muted/80 rounded' />
                          <div className='h-4 w-3/4 bg-muted/80 rounded' />
                          <div className='h-3 w-full bg-muted/60 rounded' />
                        </div>
                      </div>
                      <div className='h-6 bg-muted/40 rounded mt-2' />
                    </div>
                  ))}
                </div>
              ) : (
                <div className='rounded-xl border bg-card/60 divide-y overflow-hidden'>
                  {[1, 2, 3].map((i) => (
                    <div key={i} className='p-3 flex items-center justify-between gap-3 animate-pulse'>
                      <div className='flex items-center gap-3 flex-1'>
                        <div className='size-12 rounded-lg bg-muted/80 shrink-0' />
                        <div className='space-y-1.5 flex-1'>
                          <div className='h-3.5 w-1/3 bg-muted/80 rounded' />
                          <div className='h-3 w-1/4 bg-muted/60 rounded' />
                        </div>
                      </div>
                      <div className='h-7 w-20 bg-muted/60 rounded' />
                    </div>
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

      {/* Floating Mobile Category Jump Button (Foodpanda / Zomato Signature Feature) */}
      {categories && categories.length > 1 && (
        <div className='sm:hidden fixed bottom-20 end-4 z-40'>
          <Button
            size='sm'
            onClick={() => setMobileCategorySheetOpen(true)}
            className='rounded-full shadow-lg gap-2 bg-foreground text-background hover:bg-foreground/90 px-4 py-2 text-xs font-semibold'
          >
            <IconToolsKitchen2 className='size-4' />
            <span>{t('menuItems.categoryJump')}</span>
            <Badge variant='secondary' className='h-4 px-1.5 text-[10px] bg-background/20 text-background'>
              {categories.length}
            </Badge>
          </Button>
        </div>
      )}

      {/* Mobile Category Quick-Jump Sheet */}
      <Sheet open={mobileCategorySheetOpen} onOpenChange={setMobileCategorySheetOpen}>
        <SheetContent side='bottom' className='rounded-t-2xl max-h-[75vh] overflow-y-auto px-4 py-6'>
          <SheetHeader className='mb-4 text-start'>
            <SheetTitle className='text-base font-bold flex items-center gap-2'>
              <IconToolsKitchen2 className='size-5 text-primary' />
              <span>{t('menuItems.categoryJump')}</span>
            </SheetTitle>
          </SheetHeader>

          <div className='grid gap-1.5 pb-6'>
            <button
              type='button'
              onClick={() => {
                setSelectedCategory('all');
                setMobileCategorySheetOpen(false);
              }}
              className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-all text-start ${
                selectedCategory === 'all'
                  ? 'bg-primary text-primary-foreground font-semibold'
                  : 'hover:bg-muted font-medium text-foreground'
              }`}
            >
              <span>{t('menuItems.filterByCategory')}</span>
              <Badge variant='outline' className={selectedCategory === 'all' ? 'border-primary-foreground text-primary-foreground' : ''}>
                {totalCount}
              </Badge>
            </button>

            {categories?.map((cat) => {
              const count = categoryCounts[cat.id] || 0;
              const isSelected = selectedCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  type='button'
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setMobileCategorySheetOpen(false);
                    const el = document.getElementById(`cat-section-${cat.id}`);
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-all text-start ${
                    isSelected
                      ? 'bg-primary text-primary-foreground font-semibold'
                      : 'hover:bg-muted font-medium text-foreground'
                  }`}
                >
                  <span>{cat.name}</span>
                  <Badge variant='outline' className={isSelected ? 'border-primary-foreground text-primary-foreground' : ''}>
                    {count}
                  </Badge>
                </button>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>

      <MenuItemDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        item={editingItem}
        defaultCategoryId={selectedCategory !== 'all' ? selectedCategory : undefined}
      />
    </div>
  );
}

// -----------------------------------------------------------------------------
// Foodpanda / Zomato Visual Dish Card Component
// -----------------------------------------------------------------------------
interface FoodCardProps {
  item: MenuItemDTO;
  categories: { id: string; name: string }[] | undefined;
  onEdit: (item: MenuItemDTO) => void;
  onToggleAvailability: (item: MenuItemDTO) => void;
  isPending: boolean;
  t: ReturnType<typeof useTranslations>;
}

function FoodCard({
  item,
  categories,
  onEdit,
  onToggleAvailability,
  isPending,
  t
}: FoodCardProps) {
  const hasVariants = item.variants && item.variants.length > 0;
  const categoryName = item.category?.name || categories?.find((c) => c.id === item.categoryId)?.name;

  return (
    <div
      className={`group relative flex flex-col justify-between rounded-xl border bg-card p-3.5 shadow-xs transition-all duration-150 hover:border-primary/40 hover:shadow-md ${
        !item.isAvailable ? 'bg-muted/20 border-dashed opacity-80' : ''
      }`}
    >
      <div>
        <div className='flex gap-3 items-start mb-2.5'>
          {/* Dish Image (Appetizing Food Thumbnail) */}
          <div className='relative size-20 shrink-0 overflow-hidden rounded-xl border bg-gradient-to-br from-muted/50 to-muted/80 shadow-2xs'>
            {item.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.imageUrl}
                alt={item.name}
                loading='lazy'
                className={`size-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                  !item.isAvailable ? 'grayscale-50' : ''
                }`}
              />
            ) : (
              <div className='flex size-full flex-col items-center justify-center text-muted-foreground/40 bg-primary/5'>
                <IconToolsKitchen2 className='size-6 text-primary/40' />
              </div>
            )}

            {!item.isAvailable && (
              <div className='absolute inset-0 bg-background/70 backdrop-blur-[1px] flex items-center justify-center p-1 text-center'>
                <span className='text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-500/10 px-1 py-0.5 rounded'>
                  {t('menuItems.soldOut')}
                </span>
              </div>
            )}
          </div>

          {/* Dish Details */}
          <div className='min-w-0 flex-1'>
            <div className='flex items-center gap-1.5 flex-wrap mb-1'>
              {categoryName ? (
                <Badge variant='outline' className='text-[10px] font-normal px-1.5 py-0 border-muted-foreground/20 text-muted-foreground'>
                  {categoryName}
                </Badge>
              ) : null}
              {item.isDeal ? (
                <Badge className='bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30 text-[10px] font-bold px-1.5 py-0'>
                  🔥 Deal
                </Badge>
              ) : null}
            </div>

            <h3 className='font-semibold text-foreground text-sm leading-snug line-clamp-1 group-hover:text-primary transition-colors'>
              {item.name}
            </h3>

            {item.description ? (
              <p className='text-xs text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed'>
                {item.description}
              </p>
            ) : null}
          </div>
        </div>

        {/* Pricing / Variants info */}
        <div className='mb-3'>
          {hasVariants ? (
            <div className='flex flex-wrap gap-1.5'>
              {item.variants.map((v) => (
                <span
                  key={v.id}
                  className='inline-flex items-center rounded-md bg-muted/60 px-2 py-0.5 text-[11px] font-medium text-foreground'
                >
                  <span className='font-semibold text-primary me-1'>{v.name}:</span>
                  {formatPkr(v.price)}
                </span>
              ))}
            </div>
          ) : item.originalPrice != null && item.basePrice != null && item.originalPrice > item.basePrice ? (
            <div className='flex items-baseline gap-1.5 flex-wrap'>
              <span className='text-sm font-bold text-rose-600 dark:text-rose-400'>
                {formatPkr(item.basePrice)}
              </span>
              <span className='text-xs text-muted-foreground line-through'>
                {formatPkr(item.originalPrice)}
              </span>
              <span className='text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1 py-0.2 rounded'>
                {Math.round(((item.originalPrice - item.basePrice) / item.originalPrice) * 100)}% OFF
              </span>
            </div>
          ) : (
            <div className='flex items-baseline gap-1'>
              <span className='text-sm font-bold text-foreground'>
                {item.basePrice != null ? formatPkr(item.basePrice) : 'Rs 0'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Card Footer: Availability Switch + Edit Button */}
      <div className='flex items-center justify-between border-t pt-2.5 mt-auto'>
        <div className='flex items-center gap-2'>
          <Switch
            checked={item.isAvailable}
            onCheckedChange={() => onToggleAvailability(item)}
            disabled={isPending}
            aria-label={item.name}
          />
          <span
            className={`text-xs font-medium flex items-center gap-1 ${
              item.isAvailable
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-amber-600 dark:text-amber-400 font-normal'
            }`}
          >
            <span
              className={`size-1.5 rounded-full ${
                item.isAvailable ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
            {item.isAvailable ? t('menuItems.available') : t('menuItems.soldOut')}
          </span>
        </div>

        <Button
          variant='ghost'
          size='sm'
          onClick={() => onEdit(item)}
          className='h-7 px-2.5 gap-1 text-xs hover:bg-muted text-muted-foreground hover:text-foreground'
        >
          <IconPencil className='size-3.5' />
          <span>{t('common.edit')}</span>
        </Button>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Scalable Compact List Row Component (For High Volume / 100+ Menu Items)
// -----------------------------------------------------------------------------
function FoodListItem({
  item,
  categories,
  onEdit,
  onToggleAvailability,
  isPending,
  t
}: FoodCardProps) {
  const hasVariants = item.variants && item.variants.length > 0;
  const categoryName = item.category?.name || categories?.find((c) => c.id === item.categoryId)?.name;

  return (
    <div
      className={`flex items-center justify-between gap-3 p-3 transition-colors hover:bg-muted/40 ${
        !item.isAvailable ? 'opacity-70 bg-muted/20' : ''
      }`}
    >
      <div className='flex items-center gap-3 min-w-0 flex-1'>
        {/* Compact Thumbnail */}
        <div className='relative size-12 shrink-0 overflow-hidden rounded-lg border bg-muted'>
          {item.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.imageUrl}
              alt={item.name}
              loading='lazy'
              className='size-full object-cover'
            />
          ) : (
            <div className='flex size-full items-center justify-center text-muted-foreground/40'>
              <IconPhoto className='size-5' />
            </div>
          )}
        </div>

        {/* Info */}
        <div className='min-w-0 flex-1'>
          <div className='flex items-center gap-2'>
            <h4 className='font-semibold text-sm text-foreground truncate'>
              {item.name}
            </h4>
            {item.isDeal ? (
              <Badge className='bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30 text-[10px] font-bold px-1.5 py-0 shrink-0'>
                🔥 Deal
              </Badge>
            ) : null}
            {categoryName ? (
              <Badge variant='outline' className='text-[10px] font-normal px-1.5 py-0 shrink-0 hidden sm:inline-flex'>
                {categoryName}
              </Badge>
            ) : null}
          </div>

          <div className='flex items-center gap-2 mt-0.5 text-xs text-muted-foreground'>
            {hasVariants ? (
              <span className='font-medium text-foreground'>
                {item.variants.map((v) => `${v.name}: ${formatPkr(v.price)}`).join(' • ')}
              </span>
            ) : item.originalPrice != null && item.basePrice != null && item.originalPrice > item.basePrice ? (
              <div className='flex items-baseline gap-1.5'>
                <span className='font-bold text-rose-600 dark:text-rose-400'>
                  {formatPkr(item.basePrice)}
                </span>
                <span className='line-through text-muted-foreground text-[11px]'>
                  {formatPkr(item.originalPrice)}
                </span>
                <span className='text-[10px] font-bold text-emerald-600 dark:text-emerald-400'>
                  {Math.round(((item.originalPrice - item.basePrice) / item.originalPrice) * 100)}% OFF
                </span>
              </div>
            ) : (
              <span className='font-bold text-foreground'>
                {item.basePrice != null ? formatPkr(item.basePrice) : 'Rs 0'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className='flex items-center gap-3 shrink-0'>
        <div className='flex items-center gap-1.5'>
          <Switch
            checked={item.isAvailable}
            onCheckedChange={() => onToggleAvailability(item)}
            disabled={isPending}
            aria-label={item.name}
          />
          <span className='text-xs font-medium hidden md:inline-block'>
            {item.isAvailable ? (
              <span className='text-emerald-600 dark:text-emerald-400'>{t('menuItems.available')}</span>
            ) : (
              <span className='text-amber-600 dark:text-amber-400'>{t('menuItems.soldOut')}</span>
            )}
          </span>
        </div>

        <Button
          variant='outline'
          size='sm'
          onClick={() => onEdit(item)}
          className='h-7 px-2 text-xs gap-1'
        >
          <IconPencil className='size-3.5' />
          <span className='hidden sm:inline'>{t('common.edit')}</span>
        </Button>
      </div>
    </div>
  );
}
