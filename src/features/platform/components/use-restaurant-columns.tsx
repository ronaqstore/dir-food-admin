'use client';

import * as React from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { RowActionsMenu } from '@/components/common/row-actions-menu';
import { Icons } from '@/components/icons';
import type {
  PlatformRestaurant,
  PlatformRestaurantStatus,
  PlatformTranslator,
  UseRestaurantColumnsOptions
} from '../types';

export function renderRestaurantStatusBadge(
  status: PlatformRestaurantStatus,
  t: PlatformTranslator
): React.ReactNode {
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
}

export function renderRestaurantSubscriptionBadge(
  restaurant: PlatformRestaurant,
  currentTimestamp: number | null,
  t: PlatformTranslator
): React.ReactNode {
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
}

export function useRestaurantColumns({
  currentTimestamp,
  onReview,
  onExtend,
  onIssueLink,
  onChangeStatus,
  t
}: UseRestaurantColumnsOptions): ColumnDef<PlatformRestaurant>[] {
  const renderStatusBadge = React.useCallback(
    (status: PlatformRestaurantStatus) => renderRestaurantStatusBadge(status, t),
    [t]
  );

  const renderSubscriptionBadge = React.useCallback(
    (restaurant: PlatformRestaurant) =>
      renderRestaurantSubscriptionBadge(restaurant, currentTimestamp, t),
    [currentTimestamp, t]
  );

  return React.useMemo<ColumnDef<PlatformRestaurant>[]>(
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
        accessorKey: 'subscriptionEndsAt',
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
            onReview(restaurant);
          };

          return (
            <div
              className='flex items-center justify-end gap-1.5'
              onClick={(e) => e.stopPropagation()}
            >
              {isPending && (
                <Button
                  type='button'
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
                    onClick: () => onReview(restaurant)
                  },
                  {
                    label: t('extendSub'),
                    icon: Icons.creditCard,
                    onClick: () => onExtend(restaurant)
                  },
                  {
                    label: t('getSetupLink'),
                    icon: Icons.clipboard,
                    onClick: () => onIssueLink(restaurant)
                  },
                  ...(isActive
                    ? [
                        {
                          label: t('suspendStore'),
                          icon: Icons.ban,
                          variant: 'destructive' as const,
                          onClick: () => onChangeStatus(restaurant, 'SUSPENDED')
                        }
                      ]
                    : isSuspended
                      ? [
                          {
                            label: t('reactivateStore'),
                            icon: Icons.circleCheck,
                            className: 'text-emerald-600 focus:text-emerald-600',
                            onClick: () => onChangeStatus(restaurant, 'ACTIVE')
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
      onIssueLink,
      onExtend,
      onReview,
      onChangeStatus,
      renderStatusBadge,
      renderSubscriptionBadge,
      t
    ]
  );
}
