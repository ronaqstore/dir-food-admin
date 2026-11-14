'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { parseAsArrayOf, parseAsInteger, parseAsString, useQueryState, useQueryStates } from 'nuqs';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  ResponsiveDataTable,
  type DetailConfig,
  type MobileItemConfig,
  type QuickFilterChip
} from '@/components/data-table';
import { useDataTable } from '@/hooks/use-data-table';
import { TablePageBody } from '@/components/layout/table-page-body';
import { Icons } from '@/components/icons';
import { usePlatformRestaurants, useIssueSetupLink } from '../api/platform-query';
import { CreateRestaurantDialog } from './create-restaurant-dialog';
import { ReviewApprovalDialog } from './review-approval-dialog';
import { ExtendSubscriptionDialog } from './extend-subscription-dialog';
import { StatusChangeDialog } from './status-change-dialog';
import { IssuedSetupLinkDialog } from './issued-setup-link-dialog';
import { PlatformRestaurantsMetrics } from './platform-restaurants-metrics';
import {
  useRestaurantColumns,
  renderRestaurantStatusBadge,
  renderRestaurantSubscriptionBadge
} from './use-restaurant-columns';
import type {
  PlatformRestaurant,
  PlatformRestaurantStatus,
  QueryRestaurantsFilter,
  RestaurantSubscriptionTarget,
  RestaurantStatusTarget,
  IssuedSetupLinkData
} from '../types';

export function RestaurantsView() {
  const t = useTranslations('platformRestaurants');
  const [page] = useQueryState('page', parseAsInteger.withDefault(1));
  const [perPage] = useQueryState('perPage', parseAsInteger.withDefault(10));
  const [name] = useQueryState('name', parseAsString);
  const [sort] = useQueryState('sort', parseAsString);
  const [statusValues] = useQueryStates({
    status: parseAsArrayOf(parseAsString, ',')
  });

  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [reviewRestaurantId, setReviewRestaurantId] = React.useState<string | null>(null);
  const [isReviewOpen, setIsReviewOpen] = React.useState(false);

  const [extendTarget, setExtendTarget] = React.useState<RestaurantSubscriptionTarget | null>(null);
  const [isExtendOpen, setIsExtendOpen] = React.useState(false);

  const [statusTarget, setStatusTarget] = React.useState<RestaurantStatusTarget | null>(null);
  const [isStatusOpen, setIsStatusOpen] = React.useState(false);

  const [issuedLinkData, setIssuedLinkData] = React.useState<IssuedSetupLinkData | null>(null);

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
    status: isValidStatus ? selectedStatus : 'ALL',
    sort: sort || undefined
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
            } catch (clipErr) {
              const _ = clipErr;
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
          toast.error(t('noSetupLink'));
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : t('failedIssueSetupLink');
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

  const columns = useRestaurantColumns({
    currentTimestamp,
    onReview: handleOpenReview,
    onExtend: handleOpenExtend,
    onIssueLink: handleIssueLink,
    onChangeStatus: handleOpenStatus,
    isIssueLinkPending: issueLinkMutation.isPending,
    t
  });

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
            { label: t('colStatus'), value: renderRestaurantStatusBadge(row.status, t) },
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
            {
              label: 'Status',
              value: renderRestaurantSubscriptionBadge(row, currentTimestamp, t)
            },
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
      currentTimestamp,
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
        <Button type='button' onClick={handleOpenCreate} className='gap-1.5 self-start sm:self-auto'>
          <Icons.add className='size-4' />
          {t('addRestaurant')}
        </Button>
      </div>

      <PlatformRestaurantsMetrics
        totalCount={totalCount}
        pendingCount={pendingCount}
        activeCount={activeCount}
        suspendedCount={suspendedCount}
        t={t}
      />

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

      <IssuedSetupLinkDialog
        data={issuedLinkData}
        onClose={handleCloseIssuedModal}
        onCopy={handleCopyIssuedLink}
        t={t}
      />
    </div>
  );
}