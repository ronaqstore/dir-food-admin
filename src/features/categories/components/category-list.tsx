'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs';
import { toast } from 'sonner';
import type { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ResponsiveDataTable,
  type DetailConfig,
  type MobileItemConfig,
  type QuickFilterChip
} from '@/components/data-table';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { useDataTable } from '@/hooks/use-data-table';
import { TablePageBody } from '@/components/layout/table-page-body';
import {
  IconPlus,
  IconPencil,
  IconChevronUp,
  IconChevronDown
} from '@tabler/icons-react';
import {
  usePaginatedCategories,
  useUpdateCategory,
  useReorderCategories
} from '../api/categories-query';
import { CategoryDialog } from './category-dialog';
import type { CategoryWithCount } from '../types';

export function CategoryList() {
  const t = useTranslations();
  const [page] = useQueryState('page', parseAsInteger.withDefault(1));
  const [perPage] = useQueryState('perPage', parseAsInteger.withDefault(10));
  const [name] = useQueryState('name', parseAsString);
  const [sort] = useQueryState('sort', parseAsString);
  const [statusFilter, setStatusFilter] = React.useState<'active' | 'inactive' | 'all'>('active');
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = React.useState<CategoryWithCount | null>(null);
  const [isReordering, setIsReordering] = React.useState(false);

  const {
    data: paginatedData,
    isLoading,
    refetch
  } = usePaginatedCategories({
    search: name?.trim() || undefined,
    isActive: statusFilter === 'all' ? undefined : statusFilter === 'active',
    page,
    limit: perPage,
    sortBy: sort ? sort.split('.')[0] : undefined,
    sortOrder: sort && sort.includes('.desc') ? 'desc' : 'asc'
  });

  const updateCategory = useUpdateCategory();
  const reorderCategories = useReorderCategories();

  const categories = React.useMemo(() => {
    if (Array.isArray(paginatedData?.data)) return paginatedData.data;
    if (Array.isArray(paginatedData)) return paginatedData;
    return [];
  }, [paginatedData]);

  const meta = paginatedData?.meta;
  const totalCategories = meta?.total ?? categories.length;
  const pageCount = meta?.totalPages ?? 1;

  const canReorder =
    !name?.trim() && statusFilter === 'active' && page === 1 && !sort;

  const handleOpenCreate = React.useCallback(() => {
    setSelectedCategory(null);
    setDialogOpen(true);
  }, []);

  const handleOpenEdit = React.useCallback((category: CategoryWithCount) => {
    setSelectedCategory(category);
    setDialogOpen(true);
  }, []);

  const handleStatusFilterChange = React.useCallback((val: string) => {
    setStatusFilter(val as 'active' | 'inactive' | 'all');
  }, []);

  const handleToggleActive = React.useCallback(
    async (category: CategoryWithCount) => {
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
    },
    [t, updateCategory]
  );

  const handleMove = React.useCallback(
    async (index: number, direction: 'up' | 'down') => {
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
    },
    [categories, reorderCategories, refetch, t]
  );

  const columns = React.useMemo<ColumnDef<CategoryWithCount>[]>(
    () => [
      {
        id: 'order',
        header: () => <span className='text-xs font-medium'>{t('menuCategories.order')}</span>,
        cell: ({ row }) => {
          const index = row.index;
          return (
            <div className='flex items-center gap-1'>
              {canReorder ? (
                <div className='flex flex-col gap-0.5 me-1'>
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    className='h-5 w-5 text-muted-foreground hover:text-foreground'
                    disabled={index === 0 || isReordering}
                    onClick={() => handleMove(index, 'up')}
                    aria-label={t('common.moveCategoryUp')}
                  >
                    <IconChevronUp className='size-3.5' />
                  </Button>
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    className='h-5 w-5 text-muted-foreground hover:text-foreground'
                    disabled={index === categories.length - 1 || isReordering}
                    onClick={() => handleMove(index, 'down')}
                    aria-label={t('common.moveCategoryDown')}
                  >
                    <IconChevronDown className='size-3.5' />
                  </Button>
                </div>
              ) : null}
              <span className='font-mono text-xs text-muted-foreground/70 w-6 text-center'>
                {(page - 1) * perPage + index + 1}
              </span>
            </div>
          );
        },
        enableSorting: false,
        enableHiding: false,
        size: 70
      },
      {
        id: 'name',
        accessorKey: 'name',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('common.name')} />
        ),
        cell: ({ row }) => (
          <div className='min-w-36'>
            <div className='font-semibold text-foreground truncate'>{row.original.name}</div>
          </div>
        ),
        meta: {
          label: t('common.name'),
          placeholderKey: 'table.search',
          variant: 'text',
          primary: true,
          priority: 1
        },
        enableColumnFilter: true
      },
      {
        id: 'items',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('menuCategories.itemsCount')} />
        ),
        cell: ({ row }) => (
          <Badge variant='secondary' className='text-xs font-normal'>
            {row.original._count?.items ?? 0} {t('menuCategories.itemsCount')}
          </Badge>
        ),
        meta: { label: t('menuCategories.itemsCount'), priority: 2 }
      },
      {
        id: 'status',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('menuCategories.status')} />
        ),
        cell: ({ row }) => {
          const cat = row.original;
          return (
            <div className='flex items-center gap-2' onClick={(e) => e.stopPropagation()}>
              <Switch
                checked={cat.isActive}
                onCheckedChange={() => handleToggleActive(cat)}
                disabled={updateCategory.isPending}
                aria-label={cat.name}
              />
              <Badge
                variant={cat.isActive ? 'default' : 'outline'}
                className={
                  cat.isActive
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs'
                    : 'text-muted-foreground text-xs'
                }
              >
                {cat.isActive ? t('menuCategories.active') : t('menuCategories.inactive')}
              </Badge>
            </div>
          );
        },
        meta: { label: t('menuCategories.status'), priority: 3 }
      },
      {
        id: 'actions',
        cell: ({ row }) => (
          <div className='flex items-center justify-end'>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={() => handleOpenEdit(row.original)}
              className='gap-1.5 h-8'
            >
              <IconPencil className='size-3.5' />
              <span className='hidden sm:inline'>{t('common.edit')}</span>
            </Button>
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
        size: 80
      }
    ],
    [
      canReorder,
      categories.length,
      handleMove,
      handleOpenEdit,
      handleToggleActive,
      isReordering,
      page,
      perPage,
      t,
      updateCategory.isPending
    ]
  );

  const categoryMobileItem = React.useMemo<MobileItemConfig<CategoryWithCount>>(
    () => ({
      leading: 'icon',
      title: (row) => row.name,
      subtitle: (row) => `${row._count?.items ?? 0} ${t('menuCategories.itemsCount')}`,
      badge: (row) => ({
        label: row.isActive ? t('menuCategories.active') : t('menuCategories.inactive'),
        status: row.isActive ? 'ACTIVE' : 'INACTIVE'
      }),
      value: (row) => `${row._count?.items ?? 0}`,
      valueLabel: () => t('menuCategories.itemsCount'),
      meta: [(row) => `${row._count?.items ?? 0} ${t('menuCategories.itemsCount')}`],
      ariaLabel: (row) => `${row.name}, ${row.isActive ? t('menuCategories.active') : t('menuCategories.inactive')}`
    }),
    [t]
  );

  const categoryDetail = React.useMemo<DetailConfig<CategoryWithCount>>(
    () => ({
      mode: 'sheet',
      title: (row) => row.name,
      badge: (row) => ({
        label: row.isActive ? t('menuCategories.active') : t('menuCategories.inactive'),
        status: row.isActive ? 'ACTIVE' : 'INACTIVE'
      }),
      sections: (row) => [
        {
          title: t('menuCategories.title'),
          fields: [
            { label: t('common.name'), value: row.name },
            {
              label: t('menuCategories.itemsCount'),
              value: `${row._count?.items ?? 0} ${t('menuCategories.itemsCount')}`
            },
            {
              label: t('menuCategories.status'),
              value: row.isActive ? t('menuCategories.active') : t('menuCategories.inactive')
            }
          ]
        }
      ],
      actions: (row) => [
        {
          label: t('common.edit'),
          onClick: () => handleOpenEdit(row)
        }
      ]
    }),
    [handleOpenEdit, t]
  );

  const categoryQuickFilters = React.useMemo<QuickFilterChip[]>(
    () => [
      { id: 'all', label: t('table.all') },
      { id: 'active', label: t('menuCategories.active') },
      { id: 'inactive', label: t('menuCategories.inactive') }
    ],
    [t]
  );

  const { table } = useDataTable({
    data: categories,
    columns,
    pageCount,
    rowCount: totalCategories,
    shallow: true,
    debounceMs: 400,
    initialState: {
      pagination: { pageIndex: page - 1, pageSize: perPage },
      columnPinning: { right: ['actions'] }
    }
  });

  return (
    <div className='flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-hidden'>
      <div className='flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <div className='flex items-center gap-2'>
            <h1 className='text-2xl font-bold tracking-tight text-foreground sm:text-3xl'>
              {t('menuCategories.title')}
            </h1>
            <Badge variant='secondary' className='text-xs font-mono font-normal'>
              {totalCategories}
            </Badge>
          </div>
          <p className='text-sm text-muted-foreground mt-0.5'>{t('menuCategories.description')}</p>
        </div>

        <div className='flex items-center gap-2 self-start sm:self-auto'>
          <Tabs value={statusFilter} onValueChange={handleStatusFilterChange}>
            <TabsList className='h-9'>
              <TabsTrigger value='active' className='text-xs h-8 px-3'>
                {t('menuCategories.active')}
              </TabsTrigger>
              <TabsTrigger value='inactive' className='text-xs h-8 px-3'>
                {t('menuCategories.inactive')}
              </TabsTrigger>
              <TabsTrigger value='all' className='text-xs h-8 px-3'>
                {t('table.all')}
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Button type='button' onClick={handleOpenCreate} className='gap-1.5'>
            <IconPlus className='size-4' />
            <span>{t('menuCategories.newCategory')}</span>
          </Button>
        </div>
      </div>

      <TablePageBody>
        <ResponsiveDataTable
          table={table}
          isLoading={isLoading}
          rowCount={totalCategories}
          mobileItem={categoryMobileItem}
          detail={categoryDetail}
          quickFilters={categoryQuickFilters}
        />
      </TablePageBody>

      <CategoryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        category={selectedCategory}
      />
    </div>
  );
}
