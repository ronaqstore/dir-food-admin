'use client';

import * as React from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import { parseAsArrayOf, parseAsInteger, parseAsString, useQueryState, useQueryStates } from 'nuqs';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { usePlatformRestaurants, useIssueSetupLink } from '../api/platform-query';
import { CreateRestaurantDialog } from './create-restaurant-dialog';
import { ReviewApprovalDialog } from './review-approval-dialog';
import { ExtendSubscriptionDialog } from './extend-subscription-dialog';
import { StatusChangeDialog } from './status-change-dialog';
import type {
  PlatformRestaurant,
  PlatformRestaurantStatus,
  QueryRestaurantsFilter
} from '../types';

export function RestaurantsView() {
  const t = useTranslations('platformRestaurants');
  const [page] = useQueryState('page', parseAsInteger.withDefault(1));
  const [perPage] = useQueryState('perPage', parseAsInteger.withDefault(10));
  const [name] = useQueryState('name', parseAsString);
  const [statusValues] = useQueryStates({
    status: parseAsArrayOf(parseAsString, ',')
  });

  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [reviewRestaurantId, setReviewRestaurantId] = React.useState<string | null>(null);
  const [isReviewOpen, setIsReviewOpen] = React.useState(false);

  const [extendTarget, setExtendTarget] = React.useState<{
    id: string;
    name: string;
    subscriptionEndsAt?: string | null;
  } | null>(null);
  const [isExtendOpen, setIsExtendOpen] = React.useState(false);

  const [statusTarget, setStatusTarget] = React.useState<{
    id: string;
    name: string;
    status: PlatformRestaurantStatus;
  } | null>(null);
  const [isStatusOpen, setIsStatusOpen] = React.useState(false);

  const [issuedLinkData, setIssuedLinkData] = React.useState<{
    restaurantName: string;
    setupUrl: string;
    ownerPhone?: string;
    ownerName?: string;
  } | null>(null);

  const [currentTimestamp, setCurrentTimestamp] = React.useState<number | null>(null);

  React.useEffect(() => {
    setCurrentTimestamp(Date.now());
  }, []);

  const issueLinkMutation = useIssueSetupLink();

  const selectedStatus = statusValues.status?.[0];
  const isValidStatus =
    selectedStatus === 'PENDING' ||
    selectedStatus === 'ACTIVE' ||
    selectedStatus === 'SUSPENDED' ||
    selectedStatus === 'DEACTIVATED';

  const filter: QueryRestaurantsFilter = {
    page,
    limit: perPage,
    q: name?.trim() || undefined,
    status: isValidStatus ? selectedStatus : 'ALL'
  };

  const { data: response, isLoading } = usePlatformRestaurants(filter);

  const restaurants = React.useMemo(() => response?.data ?? [], [response?.data]);
  const meta = response?.meta;
  const totalPages = meta?.totalPages ?? 1;

  const totalCount = meta?.total ?? 0;
  const pendingCount = restaurants.filter((r) => r.status === 'PENDING').length;
  const activeCount = restaurants.filter((r) => r.status === 'ACTIVE').length;
  const suspendedCount = restaurants.filter(
    (r) => r.status === 'SUSPENDED' || r.status === 'DEACTIVATED'
  ).length;

  const handleOpenCreate = React.useCallback(() => {
    setIsCreateOpen(true);
  }, []);

  const handleOpenReview = React.useCallback((restaurant: PlatformRestaurant) => {
    setReviewRestaurantId(restaurant.id);
    setIsReviewOpen(true);
  }, []);

  const handleOpenExtend = React.useCallback((restaurant: PlatformRestaurant) => {
    setExtendTarget({
      id: restaurant.id,
      name: restaurant.name,
      subscriptionEndsAt: restaurant.subscriptionEndsAt
    });
    setIsExtendOpen(true);
  }, []);

  const handleOpenStatus = React.useCallback(
    (restaurant: PlatformRestaurant, newStatus: PlatformRestaurantStatus) => {
      setStatusTarget({
        id: restaurant.id,
        name: restaurant.name,
        status: newStatus
      });
      setIsStatusOpen(true);
    },
    []
  );

  const handleIssueLink = React.useCallback(
    async (restaurant: PlatformRestaurant) => {
      try {
        const res = await issueLinkMutation.mutateAsync(restaurant.id);
        const link = res.setupLink || res.setupUrl;
        if (link) {
          if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
            try {
              await navigator.clipboard.writeText(link);
            } catch {
              // Ignore clipboard failure in restricted environments
            }
          }
          toast.success(t('setupLinkCopied'));
          const owner = restaurant.users?.[0];
          setIssuedLinkData({
            restaurantName: restaurant.name,
            setupUrl: link,
            ownerPhone: res.userPhone || owner?.phone || restaurant.contactPhone,
            ownerName: res.userName || owner?.name
          });
        } else {
          toast.error('No setup link returned');
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to issue setup link';
        toast.error(msg);
      }
    },
    [issueLinkMutation, t]
  );

  const handleCopyIssuedLink = React.useCallback(() => {
    if (issuedLinkData?.setupUrl && typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(issuedLinkData.setupUrl);
      toast.success(t('setupLinkCopied'));
    }
  }, [issuedLinkData, t]);

  const handleCloseIssuedModal = React.useCallback(() => {
    setIssuedLinkData(null);
  }, []);

  const renderStatusBadge = React.useCallback(
    (status: PlatformRestaurantStatus) => {
      switch (status) {
        case 'PENDING':
          return (
            <Badge
              variant='outline'
              className='border-amber-500/40 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
            >
              <Icons.clock className='me-1 size-3' />
              {t('statusPending')}
            </Badge>
          );
        case 'ACTIVE':
          return (
            <Badge
              variant='secondary'
              className='border-emerald-500/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
            >
              <Icons.circleCheck className='me-1 size-3' />
              {t('statusActive')}
            </Badge>
          );
        case 'SUSPENDED':
          return (
            <Badge variant='destructive'>
              <Icons.ban className='me-1 size-3' />
              {t('statusSuspended')}
            </Badge>
          );
        case 'DEACTIVATED':
          return (
            <Badge variant='outline' className='text-muted-foreground'>
              {t('statusDeactivated')}
            </Badge>
          );
      }
    },
    [t]
  );

  const renderSubscriptionBadge = React.useCallback(
    (restaurant: PlatformRestaurant) => {
      if (!restaurant.trialStartedAt) {
        return <span className='text-xs text-muted-foreground'>{t('subNever')}</span>;
      }

      const endsAt = restaurant.subscriptionEndsAt ? new Date(restaurant.subscriptionEndsAt) : null;
      const isExpired = endsAt && currentTimestamp ? endsAt.getTime() <= currentTimestamp : false;

      if (isExpired) {
        return (
          <div className='flex flex-col'>
            <Badge variant='destructive' className='w-fit text-[10px] py-0'>
              {t('subExpired')}
            </Badge>
            {endsAt && (
              <span className='text-[10px] text-muted-foreground font-mono mt-0.5'>
                {endsAt.toLocaleDateString()}
              </span>
            )}
          </div>
        );
      }

      return (
        <div className='flex flex-col'>
          <Badge
            variant='secondary'
            className='w-fit text-[10px] py-0 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
          >
            {t('subValid')}
          </Badge>
          {endsAt && (
            <span className='text-[10px] text-muted-foreground font-mono mt-0.5'>
              {t('subExpiresOn', { date: endsAt.toLocaleDateString() })}
            </span>
          )}
        </div>
      );
    },
    [currentTimestamp, t]
  );

  const columns = React.useMemo<ColumnDef<PlatformRestaurant>[]>(
    () => [
      {
        id: 'name',
        accessorKey: 'name',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('colRestaurant')} />
        ),
        cell: ({ row }) => {
          const restaurant = row.original;
          return (
            <div className='min-w-40'>
              <div className='font-semibold text-foreground'>{restaurant.name}</div>
              <div className='text-xs text-muted-foreground font-mono'>/{restaurant.slug}</div>
              {restaurant.addressText && (
                <div className='text-xs text-muted-foreground truncate max-w-[220px] mt-0.5'>
                  {restaurant.addressText}
                </div>
              )}
            </div>
          );
        },
        meta: {
          label: t('colRestaurant'),
          placeholderKey: 'platformRestaurants.searchPlaceholder',
          variant: 'text',
          icon: Icons.search,
          type: 'text',
          primary: true,
          priority: 1
        },
        enableColumnFilter: true
      },
      {
        id: 'owner',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('colOwner')} />
        ),
        cell: ({ row }) => {
          const restaurant = row.original;
          const owner = restaurant.users?.[0];
          return owner ? (
            <div>
              <div className='font-medium text-foreground text-xs'>{owner.name}</div>
              <div className='font-mono text-xs text-muted-foreground'>{owner.phone}</div>
            </div>
          ) : (
            <span className='text-xs text-muted-foreground font-mono'>
              {restaurant.contactPhone}
            </span>
          );
        },
        meta: { label: t('colOwner'), type: 'text', priority: 2 }
      },
      {
        id: 'catalog',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('colCatalog')} />
        ),
        cell: ({ row }) => {
          const counts = row.original._count;
          return (
            <div className='text-xs text-muted-foreground space-y-0.5'>
              <div>
                <span className='font-semibold text-foreground'>
                  {t('prereqItemsCount', { count: counts?.items ?? 0 })}
                </span>
              </div>
              <div>
                <span className='font-semibold text-foreground'>
                  {t('prereqAreasCount', { count: counts?.deliveryAreas ?? 0 })}
                </span>
              </div>
            </div>
          );
        },
        meta: { label: t('colCatalog'), type: 'text', priority: 3 }
      },
      {
        id: 'subscription',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('colSubscription')} />
        ),
        cell: ({ row }) => renderSubscriptionBadge(row.original),
        meta: { label: t('colSubscription'), type: 'date', priority: 2 }
      },
      {
        id: 'status',
        accessorKey: 'status',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('colStatus')} />
        ),
        cell: ({ row }) => renderStatusBadge(row.original.status),
        meta: {
          label: t('colStatus'),
          variant: 'multiSelect',
          options: [
            { label: t('filterPending'), value: 'PENDING' },
            { label: t('filterActive'), value: 'ACTIVE' },
            { label: t('filterSuspended'), value: 'SUSPENDED' },
            { label: t('filterDeactivated'), value: 'DEACTIVATED' }
          ],
          type: 'status',
          priority: 1
        },
        enableColumnFilter: true
      },
      {
        id: 'actions',
        size: 160,
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={t('colActions')}
            className='text-end justify-end'
          />
        ),
        cell: ({ row }) => {
          const restaurant = row.original;
          const isPending = restaurant.status === 'PENDING';
          const isActive = restaurant.status === 'ACTIVE';
          const isSuspended = restaurant.status === 'SUSPENDED';

          const handleQuickReview = (e: React.MouseEvent) => {
            e.stopPropagation();
            handleOpenReview(restaurant);
          };

          return (
            <div
              className='flex items-center justify-end gap-1.5'
              onClick={(e) => e.stopPropagation()}
            >
              {isPending && (
                <Button
                  size='sm'
                  className='h-7 bg-amber-600 hover:bg-amber-700 text-white gap-1 text-xs px-2'
                  onClick={handleQuickReview}
                >
                  <Icons.check className='size-3' />
                  {t('reviewApproval')}
                </Button>
              )}
              <RowActionsMenu
                actions={[
                  {
                    label: t('reviewApproval'),
                    icon: Icons.eye,
                    onClick: () => handleOpenReview(restaurant)
                  },
                  {
                    label: t('extendSub'),
                    icon: Icons.creditCard,
                    onClick: () => handleOpenExtend(restaurant)
                  },
                  {
                    label: t('getSetupLink'),
                    icon: Icons.clipboard,
                    onClick: () => handleIssueLink(restaurant)
                  },
                  ...(isActive
                    ? [
                        {
                          label: t('suspendStore'),
                          icon: Icons.ban,
                          variant: 'destructive' as const,
                          onClick: () => handleOpenStatus(restaurant, 'SUSPENDED')
                        }
                      ]
                    : isSuspended
                      ? [
                          {
                            label: t('reactivateStore'),
                            icon: Icons.circleCheck,
                            className: 'text-emerald-600 focus:text-emerald-600',
                            onClick: () => handleOpenStatus(restaurant, 'ACTIVE')
                          }
                        ]
                      : [])
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
    [
      handleIssueLink,
      handleOpenExtend,
      handleOpenReview,
      handleOpenStatus,
      renderStatusBadge,
      renderSubscriptionBadge,
      t
    ]
  );

  const restaurantMobileItem = React.useMemo<MobileItemConfig<PlatformRestaurant>>(
    () => ({
      leading: 'avatar',
      title: (row) => row.name,
      subtitle: (row) => {
        const owner = row.users?.[0];
        return owner ? `${owner.name} · ${owner.phone}` : row.contactPhone;
      },
      badge: (row) => ({
        label: row.status === 'PENDING' ? t('statusPending') : row.status,
        status: row.status
      }),
      value: (row) => {
        const count = row._count?.items ?? 0;
        return `${count} items`;
      },
      valueLabel: () => 'Menu',
      meta: [(row) => `/${row.slug}`, (row) => row.addressText ?? ''],
      ariaLabel: (row) => `${row.name}, ${row.status}`
    }),
    [t]
  );

  const restaurantDetail = React.useMemo<DetailConfig<PlatformRestaurant>>(
    () => ({
      mode: 'sheet',
      title: (row) => row.name,
      badge: (row) => ({
        label: row.status === 'PENDING' ? t('statusPending') : row.status,
        status: row.status
      }),
      sections: (row) => [
        {
          title: t('colRestaurant'),
          fields: [
            { label: t('colRestaurant'), value: row.name },
            { label: 'Slug', value: `/${row.slug}` },
            { label: 'Address', value: row.addressText || '—' },
            { label: 'Contact Phone', value: row.contactPhone },
            { label: 'WhatsApp', value: row.whatsappNumber || '—' },
            { label: t('colStatus'), value: renderStatusBadge(row.status) },
            {
              label: t('colCatalog'),
              value: `${row._count?.items ?? 0} items · ${row._count?.deliveryAreas ?? 0} areas`
            }
          ]
        },
        {
          title: t('colOwner'),
          fields: [
            { label: t('colOwner'), value: row.users?.[0]?.name || '—' },
            {
              label: 'Phone',
              value: row.users?.[0]?.phone ? (
                <a
                  className='text-primary underline-offset-2 hover:underline font-mono'
                  href={`tel:${row.users[0].phone}`}
                >
                  {row.users[0].phone}
                </a>
              ) : (
                '—'
              )
            }
          ]
        },
        {
          title: t('colSubscription'),
          fields: [
            { label: 'Status', value: renderSubscriptionBadge(row) },
            {
              label: 'Trial Started',
              value: row.trialStartedAt
                ? new Date(row.trialStartedAt).toLocaleDateString()
                : t('subNever')
            },
            {
              label: 'Expires',
              value: row.subscriptionEndsAt
                ? new Date(row.subscriptionEndsAt).toLocaleDateString()
                : '—'
            }
          ]
        }
      ],
      actions: (row) => [
        {
          label: t('reviewApproval'),
          onClick: () => handleOpenReview(row)
        },
        {
          label: t('extendSub'),
          onClick: () => handleOpenExtend(row)
        },
        {
          label: t('getSetupLink'),
          onClick: () => handleIssueLink(row)
        },
        ...(row.status === 'ACTIVE'
          ? [
              {
                label: t('suspendStore'),
                onClick: () => handleOpenStatus(row, 'SUSPENDED')
              }
            ]
          : row.status === 'SUSPENDED'
            ? [
                {
                  label: t('reactivateStore'),
                  onClick: () => handleOpenStatus(row, 'ACTIVE')
                }
              ]
            : [])
      ]
    }),
    [
      handleIssueLink,
      handleOpenExtend,
      handleOpenReview,
      handleOpenStatus,
      renderStatusBadge,
      renderSubscriptionBadge,
      t
    ]
  );

  const restaurantQuickFilters = React.useMemo<QuickFilterChip[]>(
    () => [
      { id: 'all', label: t('filterAll') },
      { id: 'PENDING', label: t('filterPending'), columnId: 'status', value: ['PENDING'] },
      { id: 'ACTIVE', label: t('filterActive'), columnId: 'status', value: ['ACTIVE'] },
      { id: 'SUSPENDED', label: t('filterSuspended'), columnId: 'status', value: ['SUSPENDED'] }
    ],
    [t]
  );

  const { table } = useDataTable({
    data: restaurants,
    columns,
    pageCount: totalPages,
    rowCount: meta?.total ?? 0,
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
          {t('addRestaurant')}
        </Button>
      </div>

      <div className='grid shrink-0 grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4'>
        <Card className='p-3 sm:p-4'>
          <div className='flex items-center justify-between'>
            <span className='text-xs sm:text-sm font-medium text-muted-foreground'>
              {t('metricTotal')}
            </span>
            <Icons.building className='size-4 text-muted-foreground' />
          </div>
          <div className='text-xl sm:text-2xl font-bold font-mono mt-1'>{totalCount}</div>
          <p className='text-[11px] text-muted-foreground truncate'>{t('metricTotalDesc')}</p>
        </Card>

        <Card className='p-3 sm:p-4'>
          <div className='flex items-center justify-between'>
            <span className='text-xs sm:text-sm font-medium text-amber-600 dark:text-amber-400'>
              {t('metricPending')}
            </span>
            <Icons.clock className='size-4 text-amber-600 dark:text-amber-400' />
          </div>
          <div className='text-xl sm:text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1'>
            {pendingCount}
          </div>
          <p className='text-[11px] text-muted-foreground truncate'>{t('metricPendingDesc')}</p>
        </Card>

        <Card className='p-3 sm:p-4'>
          <div className='flex items-center justify-between'>
            <span className='text-xs sm:text-sm font-medium text-emerald-600 dark:text-emerald-400'>
              {t('metricActive')}
            </span>
            <Icons.circleCheck className='size-4 text-emerald-600 dark:text-emerald-400' />
          </div>
          <div className='text-xl sm:text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1'>
            {activeCount}
          </div>
          <p className='text-[11px] text-muted-foreground truncate'>{t('metricActiveDesc')}</p>
        </Card>

        <Card className='p-3 sm:p-4'>
          <div className='flex items-center justify-between'>
            <span className='text-xs sm:text-sm font-medium text-muted-foreground'>
              {t('metricSuspended')}
            </span>
            <Icons.ban className='size-4 text-muted-foreground' />
          </div>
          <div className='text-xl sm:text-2xl font-bold font-mono mt-1'>{suspendedCount}</div>
          <p className='text-[11px] text-muted-foreground truncate'>{t('metricSuspendedDesc')}</p>
        </Card>
      </div>

      <TablePageBody>
        <ResponsiveDataTable
          table={table}
          mobileItem={restaurantMobileItem}
          detail={restaurantDetail}
          quickFilters={restaurantQuickFilters}
          isLoading={isLoading}
          rowCount={meta?.total}
        />
      </TablePageBody>

      <CreateRestaurantDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />

      <ReviewApprovalDialog
        restaurantId={reviewRestaurantId}
        open={isReviewOpen}
        onOpenChange={setIsReviewOpen}
      />

      {extendTarget && (
        <ExtendSubscriptionDialog
          restaurantId={extendTarget.id}
          restaurantName={extendTarget.name}
          currentExpiry={extendTarget.subscriptionEndsAt}
          open={isExtendOpen}
          onOpenChange={setIsExtendOpen}
        />
      )}

      {statusTarget && (
        <StatusChangeDialog
          restaurantId={statusTarget.id}
          restaurantName={statusTarget.name}
          targetStatus={statusTarget.status}
          open={isStatusOpen}
          onOpenChange={setIsStatusOpen}
        />
      )}

      {issuedLinkData && (
        <Dialog open={!!issuedLinkData} onOpenChange={handleCloseIssuedModal}>
          <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-xl'>
            <DialogHeader>
              <div className='mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/50'>
                <Icons.circleCheck className='size-6 text-emerald-600 dark:text-emerald-400' />
              </div>
              <DialogTitle className='text-center text-xl font-bold'>
                {t('getSetupLink')}
              </DialogTitle>
              <DialogDescription className='text-center text-sm'>
                {issuedLinkData.restaurantName}
              </DialogDescription>
            </DialogHeader>

            <div className='rounded-lg border bg-muted/30 p-4 space-y-3'>
              <div className='text-sm font-semibold text-foreground'>{t('setupLinkTitle')}</div>
              <p className='text-xs text-muted-foreground'>{t('setupLinkDesc')}</p>
              <div className='flex items-center gap-2'>
                <Input
                  readOnly
                  value={issuedLinkData.setupUrl}
                  className='font-mono text-xs bg-background'
                />
                <Button
                  size='sm'
                  onClick={handleCopyIssuedLink}
                  className='shrink-0 gap-1'
                >
                  <Icons.clipboard className='size-4' />
                  {t('copyLink')}
                </Button>
              </div>
            </div>

            <DialogFooter className='flex-col sm:flex-row gap-2'>
              {(() => {
                const phone = issuedLinkData.ownerPhone;
                if (!phone) return null;
                const digits = phone.replace(/[^0-9]/g, '');
                const cleanPhone = digits.startsWith('03') ? `92${digits.slice(1)}` : digits;
                const name = issuedLinkData.ownerName || 'Partner';
                const msg = `Assalam-o-Alaikum ${name}, your password setup link for '${issuedLinkData.restaurantName}' on Dir Food is: ${issuedLinkData.setupUrl}`;
                const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
                return (
                  <Button
                    className='bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5'
                    render={<a href={waUrl} target='_blank' rel='noopener noreferrer' />}
                  >
                    <Icons.whatsapp className='size-4' />
                    {t('sendViaWhatsApp')}
                  </Button>
                );
              })()}
              <Button variant='outline' onClick={handleCloseIssuedModal}>
                {t('done')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}