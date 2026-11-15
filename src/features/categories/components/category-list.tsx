'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SortSelect } from '@/components/ui/sort-select';
import { CategoryRowsSkeleton } from '@/components/skeletons/categories-skeleton';
import {
  IconPlus,
  IconPencil,
  IconChevronUp,
  IconChevronDown,
  IconFolder,
  IconSearch,
  IconX
} from '@tabler/icons-react';
import {
  usePaginatedCategories,
  useUpdateCategory,
  useReorderCategories
} from '../api/categories-query';
import { parseSortParam } from '@/features/menu/lib/sort-utils';
import { StandardPagination } from '@/components/ui/standard-pagination';
import { CategoryDialog } from './category-dialog';
import type { CategoryWithCount } from '../types';

export function CategoryList() {
  const t = useTranslations();
  const [search, setSearch] = React.useState('');
  const debouncedSearch = React.useDeferredValue(search.trim());
  const [statusFilter, setStatusFilter] = React.useState<'active' | 'inactive'>('active');
  const [sortBy, setSortBy] = React.useState('default');
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = React.useState<CategoryWithCount | null>(null);
  const [isReordering, setIsReordering] = React.useState(false);

  const { sortBy: backendSortBy, sortOrder: backendSortOrder } = React.useMemo(
    () => parseSortParam(sortBy),
    [sortBy]
  );

  const categorySortOptions = React.useMemo(
    () => [
      { value: 'default', label: t('table.sortDefault') },
      { value: 'name-asc', label: t('table.sortNameAsc') },
      { value: 'name-desc', label: t('table.sortNameDesc') },
      { value: 'newest', label: t('table.sortNewest') }
    ],
    [t]
  );

  const {
    data: paginatedData,
    isLoading,
    isFetching,
    error,
    refetch
  } = usePaginatedCategories({
    search: debouncedSearch || undefined,
    isActive: statusFilter === 'active',
    page,
    limit: pageSize,
    sortBy: backendSortBy,
    sortOrder: backendSortOrder
  });

  const updateCategory = useUpdateCategory();
  const reorderCategories = useReorderCategories();

  const categories = paginatedData?.data ?? [];
  const meta = paginatedData?.meta ?? { page: 1, limit: pageSize, total: categories.length };
  const totalCategories = meta.total;

  const canReorder =
    !debouncedSearch && statusFilter === 'active' && sortBy === 'default' && page === 1;

  const handleOpenCreate = () => {
    setSelectedCategory(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (category: CategoryWithCount) => {
    setSelectedCategory(category);
    setDialogOpen(true);
  };

  const handleStatusFilterChange = React.useCallback((val: string) => {
    setStatusFilter(val as 'active' | 'inactive');
    setPage(1);
  }, []);

  const handleSearchChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  }, []);

  const handleClearSearch = React.useCallback(() => {
    setSearch('');
    setPage(1);
  }, []);

  const handleSortChange = React.useCallback((val: string | null) => {
    if (val != null) {
      setSortBy(val);
      setPage(1);
    }
  }, []);

  const handlePageChange = React.useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handlePageSizeChange = React.useCallback((newSize: number) => {
    setPageSize(newSize);
    setPage(1);
  }, []);

  const handleToggleActive = async (category: CategoryWithCount) => {
    try {
      await updateCategory.mutateAsync({
        id: category.id,
        input: { isActive: !category.isActive }
      });
      toast.success(t('menuCategories.updateSuccess'));
    } catch (err) {
      const msg = err instanceof Error ? err.message : t('common.unexpectedError');
      toast.error(msg);
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    if (!categories.length) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= categories.length) return;

    const reordered = [...categories];
    const [moved] = reordered.splice(index, 1);
    if (!moved) return;
    reordered.splice(targetIndex, 0, moved);

    try {
      setIsReordering(true);
      await reorderCategories.mutateAsync({
        ids: reordered.map((c) => c.id)
      });
      toast.success(t('menuCategories.saveOrder'));
      refetch();
    } catch (err) {
      const msg = err instanceof Error ? err.message : t('common.unexpectedError');
      toast.error(msg);
    } finally {
      setIsReordering(false);
    }
  };

  const items = categories;

  return (
    <div className='flex min-h-0 min-w-0 flex-1 flex-col space-y-4 overflow-y-auto overscroll-y-contain pb-8'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <div className='flex items-center gap-2'>
            <h1 className='text-2xl font-bold tracking-tight text-foreground'>
              {t('menuCategories.title')}
            </h1>
            <Badge variant='secondary' className='text-xs font-mono font-normal'>
              {totalCategories}
            </Badge>
          </div>
          <p className='text-xs text-muted-foreground mt-0.5'>{t('menuCategories.description')}</p>
        </div>
        <div className='flex items-center gap-2'>
          <Button type='button' onClick={handleOpenCreate} className='gap-1.5'>
            <IconPlus className='size-4' />
            <span>{t('menuCategories.newCategory')}</span>
          </Button>
        </div>
      </div>

      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border bg-card p-3 min-w-0'>
        <Tabs value={statusFilter} onValueChange={handleStatusFilterChange}>
          <TabsList className='h-8'>
            <TabsTrigger value='active' className='text-xs h-7 px-3'>
              {t('menuCategories.active')}
            </TabsTrigger>
            <TabsTrigger value='inactive' className='text-xs h-7 px-3'>
              {t('menuCategories.inactive')}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className='flex flex-wrap items-center gap-2 min-w-0 w-full sm:w-auto'>
          <div className='relative flex-1 sm:w-64 min-w-0'>
            <IconSearch className='absolute inset-s-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground' />
            <Input
              value={search}
              onChange={handleSearchChange}
              placeholder={t('table.search')}
              className='h-8 ps-8 pe-7 text-xs w-full'
            />
            {search && (
              <button
                type='button'
                onClick={handleClearSearch}
                className='absolute inset-e-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5'
                aria-label={t('table.clear')}
              >
                <IconX className='size-3.5' />
              </button>
            )}
          </div>

          <div className='hidden sm:flex items-center'>
            <SortSelect
              value={sortBy}
              onValueChange={handleSortChange}
              options={categorySortOptions}
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <CategoryRowsSkeleton />
      ) : error ? (
        <div className='flex h-64 flex-col items-center justify-center gap-3 text-center'>
          <p className='text-sm text-destructive font-medium'>
            {error instanceof Error ? error.message : t('common.unexpectedError')}
          </p>
          <Button type='button' variant='outline' size='sm' onClick={() => refetch()}>
            {t('common.tryAgain')}
          </Button>
        </div>
      ) : items.length === 0 ? (
        <div className='flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center animate-in fade-in-50'>
          <div className='flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-3'>
            <IconFolder className='size-6' />
          </div>
          <h3 className='text-base font-semibold text-foreground mb-1'>
            {debouncedSearch ? t('table.noResults') : t('menuCategories.emptyTitle')}
          </h3>
          <p className='text-xs text-muted-foreground max-w-sm mb-4'>
            {debouncedSearch
              ? t('table.noResults')
              : t('menuCategories.emptyDescription')}
          </p>
          {!debouncedSearch && (
            <Button type='button' onClick={handleOpenCreate} className='gap-1.5'>
              <IconPlus className='size-4' />
              <span>{t('menuCategories.newCategory')}</span>
            </Button>
          )}
        </div>
      ) : (
        <div className='overflow-hidden rounded-xl border bg-card shadow-xs'>
          <div className='divide-y divide-border'>
            {items.map((cat, index) => {
              const displayIndex = (page - 1) * pageSize + index + 1;
              return (
                <div
                  key={cat.id}
                  className='flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between hover:bg-muted/40 transition-colors'
                >
                  <div className='flex items-center gap-3 min-w-0'>
                    {canReorder ? (
                      <div className='flex flex-col gap-0.5'>
                        <Button
                          type='button'
                          variant='ghost'
                          size='icon'
                          className='h-6 w-6 text-muted-foreground hover:text-foreground'
                          disabled={index === 0 || isReordering}
                          onClick={() => handleMove(index, 'up')}
                          aria-label={t('common.moveCategoryUp')}
                        >
                          <IconChevronUp className='size-4' />
                        </Button>
                        <Button
                          type='button'
                          variant='ghost'
                          size='icon'
                          className='h-6 w-6 text-muted-foreground hover:text-foreground'
                          disabled={index === items.length - 1 || isReordering}
                          onClick={() => handleMove(index, 'down')}
                          aria-label={t('common.moveCategoryDown')}
                        >
                          <IconChevronDown className='size-4' />
                        </Button>
                      </div>
                    ) : null}

                    <div className='flex items-center gap-2.5 truncate'>
                      <span className='font-mono text-xs text-muted-foreground/70 w-5 text-center'>
                        {displayIndex}
                      </span>
                      <span className='font-semibold text-foreground truncate'>{cat.name}</span>
                    </div>
                  </div>

                  <div className='flex items-center justify-between sm:justify-end gap-4'>
                    <div className='flex items-center gap-2'>
                      <Badge variant='secondary' className='text-xs font-normal'>
                        {cat._count?.items ?? 0} {t('menuCategories.itemsCount')}
                      </Badge>
                      <Badge
                        variant={cat.isActive ? 'default' : 'outline'}
                        className={
                          cat.isActive
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                            : 'text-muted-foreground'
                        }
                      >
                        {cat.isActive ? t('menuCategories.active') : t('menuCategories.inactive')}
                      </Badge>
                    </div>

                    <div className='flex items-center gap-2'>
                      <Switch
                        checked={cat.isActive}
                        onCheckedChange={() => handleToggleActive(cat)}
                        disabled={updateCategory.isPending}
                        aria-label={cat.name}
                      />
                      <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        onClick={() => handleOpenEdit(cat)}
                        className='gap-1.5'
                      >
                        <IconPencil className='size-3.5' />
                        <span className='hidden sm:inline'>{t('common.edit')}</span>
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {totalCategories > 0 && (
        <div className='pt-3 border-t'>
          <StandardPagination
            page={page}
            pageSize={pageSize}
            total={totalCategories}
            pageSizeOptions={[10, 20, 30, 50]}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            disabled={isFetching}
          />
        </div>
      )}

      <CategoryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        category={selectedCategory}
      />
    </div>
  );
}
