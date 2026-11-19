import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SortSelect } from '@/components/ui/sort-select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SearchableSelect, type SearchableSelectOption } from '@/components/ui/searchable-select';
import {
  IconSearch,
  IconX,
  IconLayoutGrid,
  IconList,
  IconFlame,
  IconSalad
} from '@tabler/icons-react';
import type { MenuHeaderControlsProps } from '../types';

export function MenuHeaderControls({
  activeTab,
  onTabChange,
  dishesCount,
  dealsCount,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  sortBy,
  onSortChange,
  totalCount,
  availableCount,
  soldOutCount,
  viewMode,
  onViewModeChange,
  selectedCategory,
  onSelectCategory,
  categories,
  categoryCounts,
  allCategoriesTotal,
  t
}: MenuHeaderControlsProps) {
  const handleClearSearch = () => {
    onSearchChange('');
  };

  const handleStatusAll = () => {
    onStatusFilterChange('all');
  };

  const handleStatusAvailable = () => {
    onStatusFilterChange('available');
  };

  const handleStatusSoldOut = () => {
    onStatusFilterChange('soldOut');
  };

  const handleViewGrid = () => {
    onViewModeChange('grid');
  };

  const handleViewList = () => {
    onViewModeChange('list');
  };

  const categoryOptions: SearchableSelectOption[] = React.useMemo(() => {
    const allLabel = t('menuItems.filterByCategory');
    const allOpt: SearchableSelectOption = {
      value: 'all',
      label: `${allLabel} (${allCategoriesTotal})`
    };
    const list: SearchableSelectOption[] = (categories ?? []).map((cat) => ({
      value: cat.id,
      label: `${cat.name} (${categoryCounts[cat.id] || 0})`
    }));
    return [allOpt, ...list];
  }, [categories, categoryCounts, allCategoriesTotal, t]);

  return (
    <div className='sticky top-0 z-20 -mx-4 px-4 sm:-mx-6 sm:px-6 bg-background/95 backdrop-blur-md border-b pb-3 pt-1 space-y-3'>
      <div className='flex items-center justify-between gap-3'>
        <Tabs value={activeTab} onValueChange={(val) => onTabChange(val as 'dishes' | 'deals')}>
          <TabsList className='h-9'>
            <TabsTrigger value='dishes' className='text-xs h-8 px-3.5 gap-1.5'>
              <IconSalad className='size-3.5' />
              <span>{t('menuItems.tabDishes')}</span>
              {typeof dishesCount === 'number' ? (
                <span className='ms-1 rounded-full bg-muted px-1.5 py-0.2 text-[10px] font-semibold text-muted-foreground'>
                  {dishesCount}
                </span>
              ) : null}
            </TabsTrigger>
            <TabsTrigger value='deals' className='text-xs h-8 px-3.5 gap-1.5'>
              <IconFlame className='size-3.5 text-amber-500' />
              <span>{t('menuItems.tabDeals')}</span>
              {typeof dealsCount === 'number' ? (
                <span className='ms-1 rounded-full bg-muted px-1.5 py-0.2 text-[10px] font-semibold text-muted-foreground'>
                  {dealsCount}
                </span>
              ) : null}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className='hidden sm:flex h-9 items-center rounded-lg border bg-muted/40 p-0.5'>
          <Button
            type='button'
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size='icon'
            className='size-8'
            onClick={handleViewGrid}
            title={t('menuItems.viewGrid')}
            aria-label={t('menuItems.viewGrid')}
          >
            <IconLayoutGrid className='size-4' />
          </Button>
          <Button
            type='button'
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size='icon'
            className='size-8'
            onClick={handleViewList}
            title={t('menuItems.viewList')}
            aria-label={t('menuItems.viewList')}
          >
            <IconList className='size-4' />
          </Button>
        </div>
      </div>

      <div className='flex flex-wrap items-center justify-between gap-2.5'>
        <div className='flex flex-1 items-center gap-2 min-w-[220px] sm:min-w-[320px] max-w-xl'>
          <div className='relative flex-1 min-w-[140px]'>
            <IconSearch className='absolute inset-s-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground' />
            <Input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t('menuItems.searchPlaceholder')}
              className='ps-9 pe-8 h-9 text-xs sm:text-sm bg-card w-full'
            />
            {search ? (
              <button
                type='button'
                onClick={handleClearSearch}
                className='absolute inset-e-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
                aria-label={t('menuItems.clearSearch')}
              >
                <IconX className='size-4' />
              </button>
            ) : null}
          </div>

          <SearchableSelect
            value={selectedCategory}
            onChange={(val) => onSelectCategory(val || 'all')}
            options={categoryOptions}
            placeholder={t('menuItems.filterByCategory')}
            searchPlaceholder={t('menuItems.searchCategories')}
            className='w-44 sm:w-52 shrink-0'
            triggerClassName='h-9 text-xs bg-card'
            pageSize={20}
          />
        </div>

        <div className='flex items-center gap-2 flex-wrap'>
          <div className='flex h-9 items-center rounded-lg border bg-muted/40 p-0.5 text-xs font-medium'>
            <button
              type='button'
              onClick={handleStatusAll}
              className={`h-full px-2.5 rounded-md transition-all flex items-center ${
                statusFilter === 'all'
                  ? 'bg-background text-foreground shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t('menuItems.statusAll')} ({totalCount})
            </button>
            <button
              type='button'
              onClick={handleStatusAvailable}
              className={`h-full flex items-center gap-1.5 px-2.5 rounded-md transition-all ${
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
              onClick={handleStatusSoldOut}
              className={`h-full flex items-center gap-1.5 px-2.5 rounded-md transition-all ${
                statusFilter === 'soldOut'
                  ? 'bg-background text-amber-600 dark:text-amber-400 shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <span className='size-1.5 rounded-full bg-amber-500' />
              <span>{t('menuItems.statusSoldOut')} ({soldOutCount})</span>
            </button>
          </div>

          <div className='hidden sm:flex items-center'>
            <SortSelect
              value={sortBy}
              onValueChange={onSortChange}
              className='h-9 w-[9.5rem] text-xs [&[data-size]]:h-9 bg-card'
            />
          </div>
        </div>
      </div>
    </div>
  );
}
