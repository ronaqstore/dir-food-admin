'use client';

import * as React from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs';
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
import {
  useMasterAreas,
  usePaginatedMasterAreas,
  useUpdateMasterArea,
  useDeleteMasterArea,
  usePlatformCities
} from '../api/platform-query';
import { MasterAreaDialog } from './master-area-dialog';
import { ApproveAreaDialog } from './approve-area-dialog';
import { MergeAreaDialog } from './merge-area-dialog';
import { AddDistrictDialog } from './add-district-dialog';
import { PlatformDistrictsBar } from './platform-districts-bar';
import { PlatformAreasMetrics } from './platform-areas-metrics';
import type { MasterArea } from '../types';

export function PlatformSettingsView() {
  const t = useTranslations('platformAreas');
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
  const [perPage] = useQueryState('perPage', parseAsInteger.withDefault(20));
  const [name] = useQueryState('name', parseAsString);
  const [sort] = useQueryState('sort', parseAsString);

  const [selectedArea, setSelectedArea] = React.useState<MasterArea | null>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const [approveArea, setApproveArea] = React.useState<MasterArea | null>(null);
  const [isApproveOpen, setIsApproveOpen] = React.useState(false);

  const [mergeArea, setMergeArea] = React.useState<MasterArea | null>(null);
  const [isMergeOpen, setIsMergeOpen] = React.useState(false);

  const [filterNeedsReview, setFilterNeedsReview] = React.useState(false);

  const [selectedCityId, setSelectedCityId] = React.useState<string>('ALL');
  const [isAddCityOpen, setIsAddCityOpen] = React.useState(false);

  const { data: cities = [] } = usePlatformCities();
  const { data: allAreas = [], isLoading } = useMasterAreas();
  const updateMutation = useUpdateMasterArea();
  const deleteMutation = useDeleteMasterArea();

  const { data: paginatedData, isLoading: isTableLoading } = usePaginatedMasterAreas({
    page,
    limit: perPage,
    q: name?.trim() || undefined,
    cityId: selectedCityId !== 'ALL' ? selectedCityId : undefined,
    needsReview: filterNeedsReview || undefined,
    sort: sort || undefined
  });

  const tableAreas = paginatedData?.data ?? [];
  const meta = paginatedData?.meta;
  const pageCount = meta?.totalPages ?? 1;
  const rowCount = meta?.total ?? 0;

  const areas = React.useMemo(() => {
    let list = selectedCityId === 'ALL' ? allAreas : allAreas.filter((a) => a.cityId === selectedCityId);
    if (filterNeedsReview) {
      list = list.filter((a) => a.isVerified === false);
    }
    return list;
  }, [allAreas, selectedCityId, filterNeedsReview]);

  const totalNeedsReview = React.useMemo(() => {
    return allAreas.filter((a) => a.isVerified === false).length;
  }, [allAreas]);

  const selectedCity = React.useMemo(
    () => cities.find((c) => c.id === selectedCityId),
    [cities, selectedCityId]
  );

  const handleToggleNeedsReview = React.useCallback(() => {
    setFilterNeedsReview((prev) => !prev);
  }, []);

  const totalAllAreas = allAreas.length;
  const totalAreas = selectedCityId === 'ALL' ? totalAllAreas : areas.length;
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

  const handleOpenApprove = React.useCallback((area: MasterArea) => {
    setApproveArea(area);
    setIsApproveOpen(true);
  }, []);

  const handleOpenMerge = React.useCallback((area: MasterArea) => {
    setMergeArea(area);
    setIsMergeOpen(true);
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

  const handleDeleteArea = React.useCallback(
    async (area: MasterArea) => {
      if (
        !window.confirm(
          t('confirmDeleteArea', { name: area.name })
        )
      ) {
        return;
      }
      try {
        await deleteMutation.mutateAsync(area.id);
        toast.success(t('areaDeleted', { name: area.name }));
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to delete area';
        toast.error(msg);
      }
    },
    [deleteMutation, t]
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
            <div className='flex items-center gap-2'>
              <span className='font-semibold text-foreground'>{row.original.name}</span>
              {row.original.isVerified === false ? (
                <Badge
                  variant='outline'
                  className='text-[10px] text-amber-700 bg-amber-50 border-amber-300 dark:text-amber-400 dark:bg-amber-950/40 dark:border-amber-700 font-semibold'
                >
                  {t('needsReview')}
                </Badge>
              ) : row.original.isCustomCreated ? (
                <Badge variant='outline' className='text-[10px] text-amber-600 border-amber-300 dark:text-amber-400'>
                  {t('ownerCreated')}
                </Badge>
              ) : null}
            </div>
            <div className='flex items-center gap-2 text-xs text-muted-foreground'>
              <span className='font-mono'>/{row.original.slug}</span>
              <span>•</span>
              <span className='font-medium text-foreground/80'>{row.original.cityName || 'District'}</span>
            </div>
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
          const isPendingReview = area.isVerified === false;

          return (
            <div
              className='flex items-center justify-end gap-1.5'
              onClick={(e) => e.stopPropagation()}
            >
              {isPendingReview && (
                <Button type='button'
                  size='sm'
                  variant='outline'
                  className='gap-1 text-xs text-emerald-700 border-emerald-300 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/40 h-7 px-2'
                  onClick={() => handleOpenApprove(area)}
                >
                  <Icons.circleCheck className='size-3 text-emerald-600' />
                  {t('approve')}
                </Button>
              )}
              <RowActionsMenu
                actions={[
                  ...(isPendingReview
                    ? [
                        {
                          label: t('approveAndPublish'),
                          icon: Icons.circleCheck,
                          onClick: () => handleOpenApprove(area)
                        }
                      ]
                    : []),
                  {
                    label: t('mergeWithExistingArea'),
                    icon: Icons.galleryVerticalEnd,
                    onClick: () => handleOpenMerge(area)
                  },
                  {
                    label: t('editArea'),
                    icon: Icons.edit,
                    onClick: () => handleOpenEdit(area)
                  },
                  {
                    label: t('deleteArea'),
                    icon: Icons.trash,
                    variant: 'destructive',
                    onClick: () => handleDeleteArea(area)
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
    [handleOpenEdit, handleOpenApprove, handleOpenMerge, handleToggleActive, handleDeleteArea, t, updateMutation.isPending]
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

  const { table } = useDataTable({
    data: tableAreas,
    columns,
    pageCount,
    rowCount,
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
        <div className='flex items-center gap-2 self-start sm:self-auto'>
          <Button type='button' variant='outline' onClick={() => setIsAddCityOpen(true)} className='gap-1.5'>
            <Icons.add className='size-4' />
            {t('addDistrict')}
          </Button>
          <Button type='button' onClick={handleOpenCreate} className='gap-1.5'>
            <Icons.add className='size-4' />
            {t('addArea')}
          </Button>
        </div>
      </div>

      <PlatformAreasMetrics
        totalAreas={totalAreas}
        selectedCityName={selectedCity?.name}
        activeAreas={activeAreas}
        totalCoverageLinks={totalCoverageLinks}
        t={t}
      />

      <PlatformDistrictsBar
        cities={cities}
        allAreas={allAreas}
        selectedCityId={selectedCityId}
        onSelectCityId={setSelectedCityId}
        totalAllAreas={totalAllAreas}
        filterNeedsReview={filterNeedsReview}
        onToggleNeedsReview={handleToggleNeedsReview}
        totalNeedsReview={totalNeedsReview}
      />

      <TablePageBody>
        <ResponsiveDataTable
          table={table}
          mobileItem={areaMobileItem}
          detail={areaDetail}
          quickFilters={areaQuickFilters}
          isLoading={isTableLoading || isLoading}
          rowCount={rowCount}
        />
      </TablePageBody>

      <MasterAreaDialog
        area={selectedArea}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        defaultCityId={selectedCityId !== 'ALL' ? selectedCityId : undefined}
      />

      <ApproveAreaDialog
        area={approveArea}
        open={isApproveOpen}
        onOpenChange={setIsApproveOpen}
      />

      <MergeAreaDialog
        sourceArea={mergeArea}
        allAreas={allAreas}
        open={isMergeOpen}
        onOpenChange={setIsMergeOpen}
      />

      <AddDistrictDialog
        open={isAddCityOpen}
        onOpenChange={setIsAddCityOpen}
        onCreated={setSelectedCityId}
      />
    </div>
  );
}