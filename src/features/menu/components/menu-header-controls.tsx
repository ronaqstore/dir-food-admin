import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  IconSearch,
  IconX,
  IconLayoutGrid,
  IconList
} from '@tabler/icons-react';
import type { MenuHeaderControlsProps } from '../types';

export function MenuHeaderControls({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
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
  categoryPillsRef,
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

  const handleSelectAllCategory = () => {
    onSelectCategory('all');
  };

  return (
    <div className='sticky top-0 z-20 -mx-4 px-4 sm:-mx-6 sm:px-6 bg-background/95 backdrop-blur-md border-b pb-3 pt-1 space-y-3'>
      <div className='flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between'>
        <div className='relative flex-1 max-w-md'>
          <IconSearch className='absolute inset-s-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground' />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t('menuItems.searchPlaceholder')}
            className='ps-9 pe-8 h-9 text-xs sm:text-sm bg-card'
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

        <div className='flex items-center justify-between sm:justify-end gap-2'>
          <div className='flex items-center rounded-lg border bg-muted/40 p-0.5 text-xs font-medium'>
            <button
              type='button'
              onClick={handleStatusAll}
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
              onClick={handleStatusAvailable}
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
              onClick={handleStatusSoldOut}
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

          <div className='hidden sm:flex items-center rounded-lg border bg-muted/40 p-0.5'>
            <Button
              type='button'
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size='icon'
              className='size-7'
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
              className='size-7'
              onClick={handleViewList}
              title={t('menuItems.viewList')}
              aria-label={t('menuItems.viewList')}
            >
              <IconList className='size-4' />
            </Button>
          </div>
        </div>
      </div>

      <div
        ref={categoryPillsRef}
        className='flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth py-0.5'
      >
        <Button
          type='button'
          variant={selectedCategory === 'all' ? 'default' : 'outline'}
          size='sm'
          onClick={handleSelectAllCategory}
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
            {allCategoriesTotal}
          </span>
        </Button>

        {categories?.map((cat) => {
          const count = categoryCounts[cat.id] || 0;
          const isSelected = selectedCategory === cat.id;

          return (
            <Button
              type='button'
              key={cat.id}
              variant={isSelected ? 'default' : 'outline'}
              size='sm'
              onClick={() => onSelectCategory(cat.id)}
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
  );
}

