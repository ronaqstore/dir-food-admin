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
import {
  useMasterAreas,
  useUpdateMasterArea,
  useDeleteMasterArea,
  usePlatformCities,
  useCreatePlatformCity
} from '../api/platform-query';
import { MasterAreaDialog } from './master-area-dialog';
import { ApproveAreaDialog } from './approve-area-dialog';
import { MergeAreaDialog } from './merge-area-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { MasterArea } from '../types';

export function PlatformSettingsView() {
  const t = useTranslations('platformAreas');
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
  const [perPage] = useQueryState('perPage', parseAsInteger.withDefault(20));
  const [name] = useQueryState('name', parseAsString);

  const [selectedArea, setSelectedArea] = React.useState<MasterArea | null>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const [approveArea, setApproveArea] = React.useState<MasterArea | null>(null);
  const [isApproveOpen, setIsApproveOpen] = React.useState(false);

  const [mergeArea, setMergeArea] = React.useState<MasterArea | null>(null);
  const [isMergeOpen, setIsMergeOpen] = React.useState(false);

  const [filterNeedsReview, setFilterNeedsReview] = React.useState(false);

  const [selectedCityId, setSelectedCityId] = React.useState<string>('ALL');
  const [isAddCityOpen, setIsAddCityOpen] = React.useState(false);
  const [newCityName, setNewCityName] = React.useState('');

  const { data: cities = [] } = usePlatformCities();
  const createCityMutation = useCreatePlatformCity();
  const { data: allAreas = [], isLoading } = useMasterAreas();
  const updateMutation = useUpdateMasterArea();
  const deleteMutation = useDeleteMasterArea();

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

  const handleCreateCity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCityName.trim()) return;
    try {
      const created = await createCityMutation.mutateAsync({ name: newCityName.trim() });
      toast.success(`City/District "${newCityName.trim()}" created!`);
      setSelectedCityId(created.id);
      setNewCityName('');
      setIsAddCityOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create district');
    }
  };

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
          `Are you sure you want to delete "${area.name}"? This action cannot be undone.`
        )
      ) {
        return;
      }
      try {
        await deleteMutation.mutateAsync(area.id);
        toast.success(`Area "${area.name}" deleted successfully`);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to delete area';
        toast.error(msg);
      }
    },
    [deleteMutation]
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
                  Needs Review
                </Badge>
              ) : row.original.isCustomCreated ? (
                <Badge variant='outline' className='text-[10px] text-amber-600 border-amber-300 dark:text-amber-400'>
                  Owner Created
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
          const handleEditClick = (e: React.MouseEvent) => {
            e.stopPropagation();
            handleOpenEdit(area);
          };

          return (
            <div
              className='flex items-center justify-end gap-1.5'
              onClick={(e) => e.stopPropagation()}
            >
              {isPendingReview && (
                <Button
                  size='sm'
                  variant='outline'
                  className='gap-1 text-xs text-emerald-700 border-emerald-300 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/40 h-7 px-2'
                  onClick={() => handleOpenApprove(area)}
                >
                  <Icons.circleCheck className='size-3 text-emerald-600' />
                  Approve
                </Button>
              )}
              <Button
                size='sm'
                variant='ghost'
                className='gap-1 text-xs h-7'
                onClick={handleEditClick}
              >
                <Icons.edit className='size-3.5' />
                {t('editArea')}
              </Button>
              <RowActionsMenu
                actions={[
                  ...(isPendingReview
                    ? [
                        {
                          label: 'Approve & Publish',
                          icon: Icons.circleCheck,
                          onClick: () => handleOpenApprove(area)
                        }
                      ]
                    : []),
                  {
                    label: 'Merge with Existing Area',
                    icon: Icons.galleryVerticalEnd,
                    onClick: () => handleOpenMerge(area)
                  },
                  {
                    label: t('editArea'),
                    icon: Icons.edit,
                    onClick: () => handleOpenEdit(area)
                  },
                  {
                    label: 'Delete Area',
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
        <div className='flex items-center gap-2 self-start sm:self-auto'>
          <Button variant='outline' onClick={() => setIsAddCityOpen(true)} className='gap-1.5'>
            <Icons.add className='size-4' />
            Add District
          </Button>
          <Button onClick={handleOpenCreate} className='gap-1.5'>
            <Icons.add className='size-4' />
            {t('addArea')}
          </Button>
        </div>
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
          <p className='text-[11px] text-muted-foreground truncate'>
            {selectedCity ? `Standard zones in ${selectedCity.name}` : t('metricTotalDesc')}
          </p>
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

      <div className='flex flex-wrap items-center justify-between gap-2 shrink-0'>
        {cities.length > 0 && (
          <div className='flex items-center gap-2 overflow-x-auto pb-1'>
            <span className='text-xs font-medium text-muted-foreground whitespace-nowrap'>District:</span>
            <Button
              size='sm'
              variant={selectedCityId === 'ALL' ? 'default' : 'outline'}
              className='h-7 text-xs rounded-full'
              onClick={() => setSelectedCityId('ALL')}
            >
              <span>All Districts</span>
              <span
                className={`ms-1.5 rounded-full px-1.5 py-0.2 text-[10px] ${
                  selectedCityId === 'ALL'
                    ? 'bg-primary-foreground/20 text-primary-foreground font-bold'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {totalAllAreas}
              </span>
            </Button>
            {cities.map((c) => {
              const count = allAreas.filter((a) => a.cityId === c.id).length;
              const isSelected = selectedCityId === c.id;
              return (
                <Button
                  key={c.id}
                  size='sm'
                  variant={isSelected ? 'default' : 'outline'}
                  className='h-7 text-xs rounded-full'
                  onClick={() => setSelectedCityId(c.id)}
                >
                  <span>{c.name}</span>
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
        )}

        <div className='flex items-center gap-2 ms-auto'>
          <Button
            size='sm'
            variant={filterNeedsReview ? 'default' : 'outline'}
            className={`h-7 text-xs rounded-full gap-1.5 ${
              filterNeedsReview
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : totalNeedsReview > 0
                ? 'border-amber-400 text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/40'
                : ''
            }`}
            onClick={() => setFilterNeedsReview((prev) => !prev)}
          >
            <Icons.alertCircle className='size-3.5' />
            <span>Needs Review</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                filterNeedsReview
                  ? 'bg-white/20 text-white'
                  : totalNeedsReview > 0
                  ? 'bg-amber-200 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {totalNeedsReview}
            </span>
          </Button>
        </div>
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

      <Dialog open={isAddCityOpen} onOpenChange={setIsAddCityOpen}>
        <DialogContent className='sm:max-w-md'>
          <form onSubmit={handleCreateCity} className='space-y-4'>
            <DialogHeader>
              <DialogTitle>Add New District / City</DialogTitle>
              <DialogDescription>
                Create a new district (e.g. Swat, Peshawar, Mardan) to group restaurants and delivery areas.
              </DialogDescription>
            </DialogHeader>

            <div className='space-y-3 text-sm'>
              <div className='space-y-1.5'>
                <Label htmlFor='city-name'>District / City Name *</Label>
                <Input
                  id='city-name'
                  required
                  placeholder='e.g. Swat, Peshawar, Mardan'
                  value={newCityName}
                  onChange={(e) => setNewCityName(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type='button'
                variant='ghost'
                onClick={() => setIsAddCityOpen(false)}
                disabled={createCityMutation.isPending}
              >
                Cancel
              </Button>
              <Button type='submit' disabled={createCityMutation.isPending}>
                Create District
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}