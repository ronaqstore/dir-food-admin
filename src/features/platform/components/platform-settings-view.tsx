'use client';

import * as React from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  ResponsiveDataTable,
  type DetailConfig,
  type MobileItemConfig,
  type QuickFilterChip
} from '@/components/data-table';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { useDataTable } from '@/hooks/use-data-table';
import { RowActionsMenu } from '@/components/common/row-actions-menu';
import { TablePageBody } from '@/components/layout/table-page-body';
import { Icons } from '@/components/icons';
import { useMasterAreas, useUpdateMasterArea } from '../api/platform-query';
import { MasterAreaDialog } from './master-area-dialog';
import type { MasterArea } from '../types';

export function PlatformSettingsView() {
  const t = useTranslations('platformAreas');
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
  const [perPage] = useQueryState('perPage', parseAsInteger.withDefault(20));
  const [name] = useQueryState('name', parseAsString);

  const [selectedArea, setSelectedArea] = React.useState<MasterArea | null>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const { data: areas = [], isLoading } = useMasterAreas();
  const updateMutation = useUpdateMasterArea();

  const totalAreas = areas.length;
  const activeAreas = areas.filter((a) => a.isActive).length;
  const totalCoverageLinks = areas.reduce((sum, a) => sum + (a.activeRestaurantsCount || 0), 0);

  const handleOpenCreate = React.useCallback(() => {
    setSelectedArea(null);
    setIsDialogOpen(true);
  }, []);

  const handleOpenEdit = React.useCallback((area: MasterArea) => {
    setSelectedArea(area);
    setIsDialogOpen(true);
  }, []);

  const handleToggleActive = React.useCallback(
    async (area: MasterArea) => {
      try {
        await updateMutation.mutateAsync({
          id: area.id,
          input: { isActive: !area.isActive }
        });
        toast.success(t('areaUpdated'));
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to update area status';
        toast.error(msg);
      }
    },
    [t, updateMutation]
  );

  const columns = React.useMemo<ColumnDef<MasterArea>[]>(
    () => [
      {
        id: 'name',
        accessorKey: 'name',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('colName')} />
        ),
        cell: ({ row }) => (
          <div className='min-w-36'>
            <div className='font-semibold text-foreground'>{row.original.name}</div>
            <div className='text-xs text-muted-foreground font-mono'>/{row.original.slug}</div>
          </div>
        ),
        meta: {
          label: t('colName'),
          placeholderKey: 'platformAreas.searchPlaceholder',
          variant: 'text',
          icon: Icons.search,
          type: 'text',
          primary: true,
          priority: 1
        },
        enableColumnFilter: true
      },
      {
        id: 'sortOrder',
        accessorKey: 'sortOrder',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('colSort')} />
        ),
        cell: ({ row }) => (
          <span className='font-mono text-xs text-muted-foreground'>
            {row.original.sortOrder}
          </span>
        ),
        meta: { label: t('colSort'), type: 'number', priority: 3 }
      },
      {
        id: 'restaurants',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('colRestaurants')} />
        ),
        cell: ({ row }) => (
          <Badge variant='outline' className='text-[11px] font-medium'>
            {t('restaurantsCount', { count: row.original.activeRestaurantsCount || 0 })}
          </Badge>
        ),
        meta: { label: t('colRestaurants'), type: 'text', priority: 2 }
      },
      {
        id: 'status',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('colStatus')} />
        ),
        cell: ({ row }) => {
          const area = row.original;
          return (
            <div
              className='flex items-center gap-2'
              onClick={(e) => e.stopPropagation()}
            >
              <Switch
                checked={area.isActive}
                onCheckedChange={() => handleToggleActive(area)}
                disabled={updateMutation.isPending}
              />
              <span className='text-xs text-muted-foreground'>
                {area.isActive ? t('active') : t('inactive')}
              </span>
            </div>
          );
        },
        meta: { label: t('colStatus'), type: 'status', priority: 1 }
      },
      {
        id: 'actions',
        size: 100,
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={t('colActions')}
            className='text-end justify-end'
          />
        ),
        cell: ({ row }) => {
          const area = row.original;
          const handleEditClick = (e: React.MouseEvent) => {
            e.stopPropagation();
            handleOpenEdit(area);
          };

          return (
            <div
              className='flex items-center justify-end gap-1.5'
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                size='sm'
                variant='ghost'
                className='gap-1 text-xs'
                onClick={handleEditClick}
              >
                <Icons.edit className='size-3.5' />
                {t('editArea')}
              </Button>
              <RowActionsMenu
                actions={[
                  {
                    label: t('editArea'),
                    icon: Icons.edit,
                    onClick: () => handleOpenEdit(area)
                  }
                ]}
              />
            </div>
          );
        },
        enableSorting: false,
        enableHiding: false,
        meta: { mobile: 'hidden' }
      }
    ],
    [handleOpenEdit, handleToggleActive, t, updateMutation.isPending]
  );

  const areaMobileItem = React.useMemo<MobileItemConfig<MasterArea>>(
    () => ({
      leading: 'avatar',
      title: (row) => row.name,
      subtitle: (row) => `/${row.slug}`,
      badge: (row) => ({
        label: row.isActive ? t('active') : t('inactive'),
        status: row.isActive ? 'ACTIVE' : 'INACTIVE'
      }),
      value: (row) =>
        t('restaurantsCount', { count: row.activeRestaurantsCount || 0 }),
      valueLabel: () => t('colRestaurants'),
      meta: [(row) => `${t('colSort')}: ${row.sortOrder}`],
      ariaLabel: (row) => `${row.name}, ${row.isActive ? t('active') : t('inactive')}`
    }),
    [t]
  );

  const areaDetail = React.useMemo<DetailConfig<MasterArea>>(
    () => ({
      mode: 'sheet',
      title: (row) => row.name,
      badge: (row) => ({
        label: row.isActive ? t('active') : t('inactive'),
        status: row.isActive ? 'ACTIVE' : 'INACTIVE'
      }),
      sections: (row) => [
        {
          title: t('title'),
          fields: [
            { label: t('colName'), value: row.name },
            { label: t('colSlug'), value: `/${row.slug}` },
            { label: t('colSort'), value: String(row.sortOrder) },
            {
              label: t('colRestaurants'),
              value: t('restaurantsCount', { count: row.activeRestaurantsCount || 0 })
            },
            {
              label: t('colStatus'),
              value: row.isActive ? t('active') : t('inactive')
            }
          ]
        }
      ],
      actions: (row) => [
        {
          label: t('editArea'),
          onClick: () => handleOpenEdit(row)
        }
      ]
    }),
    [handleOpenEdit, t]
  );

  const areaQuickFilters = React.useMemo<QuickFilterChip[]>(
    () => [
      { id: 'all', label: t('metricTotal') }
    ],
    [t]
  );

  const filteredAreas = React.useMemo(() => {
    if (!name?.trim()) return areas;
    const q = name.trim().toLowerCase();
    return areas.filter(
      (a) => a.name.toLowerCase().includes(q) || a.slug.toLowerCase().includes(q)
    );
  }, [areas, name]);

  const pageCount = Math.max(1, Math.ceil(filteredAreas.length / perPage));

  React.useEffect(() => {
    if (page > pageCount && pageCount > 0) {
      void setPage(1);
    }
  }, [page, pageCount, setPage]);

  const paginatedAreas = React.useMemo(() => {
    const start = (page - 1) * perPage;
    return filteredAreas.slice(start, start + perPage);
  }, [filteredAreas, page, perPage]);

  const { table } = useDataTable({
    data: paginatedAreas,
    columns,
    pageCount,
    rowCount: filteredAreas.length,
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
          <h1 className='text-2xl font-bold tracking-tight text-foreground sm:text-3xl'>
            {t('title')}
          </h1>
          <p className='text-sm text-muted-foreground mt-0.5'>{t('subtitle')}</p>
        </div>
        <Button onClick={handleOpenCreate} className='gap-1.5 self-start sm:self-auto'>
          <Icons.add className='size-4' />
          {t('addArea')}
        </Button>
      </div>

      <div className='grid shrink-0 grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3'>
        <Card className='p-3 sm:p-4'>
          <div className='flex items-center justify-between'>
            <span className='text-xs sm:text-sm font-medium text-muted-foreground'>
              {t('metricTotal')}
            </span>
            <Icons.building className='size-4 text-muted-foreground' />
          </div>
          <div className='text-xl sm:text-2xl font-bold font-mono mt-1'>{totalAreas}</div>
          <p className='text-[11px] text-muted-foreground truncate'>{t('metricTotalDesc')}</p>
        </Card>

        <Card className='p-3 sm:p-4'>
          <div className='flex items-center justify-between'>
            <span className='text-xs sm:text-sm font-medium text-emerald-600 dark:text-emerald-400'>
              {t('metricActive')}
            </span>
            <Icons.circleCheck className='size-4 text-emerald-600 dark:text-emerald-400' />
          </div>
          <div className='text-xl sm:text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1'>
            {activeAreas}
          </div>
          <p className='text-[11px] text-muted-foreground truncate'>{t('metricActiveDesc')}</p>
        </Card>

        <Card className='p-3 sm:p-4'>
          <div className='flex items-center justify-between'>
            <span className='text-xs sm:text-sm font-medium text-primary'>
              {t('metricCoverage')}
            </span>
            <Icons.trendingUp className='size-4 text-primary' />
          </div>
          <div className='text-xl sm:text-2xl font-bold font-mono text-primary mt-1'>
            {totalCoverageLinks}
          </div>
          <p className='text-[11px] text-muted-foreground truncate'>{t('metricCoverageDesc')}</p>
        </Card>
      </div>

      <TablePageBody>
        <ResponsiveDataTable
          table={table}
          mobileItem={areaMobileItem}
          detail={areaDetail}
          quickFilters={areaQuickFilters}
          isLoading={isLoading}
          rowCount={areas.length}
        />
      </TablePageBody>

      <MasterAreaDialog area={selectedArea} open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </div>
  );
}