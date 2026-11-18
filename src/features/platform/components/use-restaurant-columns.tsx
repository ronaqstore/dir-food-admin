'use client';

import * as React from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { RowActionsMenu } from '@/components/common/row-actions-menu';
import { Icons } from '@/components/icons';
import { formatPkMobile } from '@/lib/auth/phone';
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

export function renderRestaurantPlanBadge(
  restaurant: PlatformRestaurant,
  currentTimestamp: number | null,
  t: PlatformTranslator
): React.ReactNode {
  if (!restaurant.trialStartedAt) {
    return <span className='text-xs text-muted-foreground'>{t('subNever')}</span>;
  }

  const endsAt = restaurant.subscriptionEndsAt ? new Date(restaurant.subscriptionEndsAt) : null;
  let daysLeft = 0;
  if (endsAt && currentTimestamp) {
    const diffMs = endsAt.getTime() - currentTimestamp;
    daysLeft = Math.ceil(diffMs / (24 * 60 * 60 * 1000));
  }

  const isTrial = Boolean(
    restaurant.trialStartedAt && daysLeft > 0 && restaurant.status === 'ACTIVE'
  );

  return isTrial ? (
    <Badge
      variant='outline'
      className='border-primary/40 bg-primary/10 text-primary text-[11px] font-medium'
    >
      {t('trialBadge')}
    </Badge>
  ) : (
    <Badge variant='secondary' className='text-[11px] font-medium'>
      {t('paidBadge')}
    </Badge>
  );
}

export function renderRestaurantRemainingBadge(
  restaurant: PlatformRestaurant,
  currentTimestamp: number | null,
  t: PlatformTranslator
): React.ReactNode {
  if (!restaurant.trialStartedAt) {
    return <span className='text-xs text-muted-foreground'>—</span>;
  }

  const endsAt = restaurant.subscriptionEndsAt ? new Date(restaurant.subscriptionEndsAt) : null;
  const isExpired = endsAt && currentTimestamp ? endsAt.getTime() <= currentTimestamp : false;
  let daysLeft = 0;
  if (endsAt && currentTimestamp) {
    const diffMs = endsAt.getTime() - currentTimestamp;
    daysLeft = Math.ceil(diffMs / (24 * 60 * 60 * 1000));
  }

  if (isExpired) {
    return (
      <Badge variant='destructive' className='text-[11px] font-medium'>
        {t('subExpired')}
      </Badge>
    );
  }

  if (daysLeft <= 7) {
    return (
      <Badge
        variant='outline'
        className='border-amber-500/40 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 text-[11px] font-medium'
      >
        <Icons.clock className='me-1 size-3' />
        {t('daysRemaining', { days: daysLeft })}
      </Badge>
    );
  }

  return (
    <Badge
      variant='secondary'
      className='bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[11px] font-medium'
    >
      <Icons.circleCheck className='me-1 size-3' />
      {t('daysRemaining', { days: daysLeft })}
    </Badge>
  );
}

export function renderRestaurantSubscriptionBadge(
  restaurant: PlatformRestaurant,
  currentTimestamp: number | null,
  t: PlatformTranslator
): React.ReactNode {
  return renderRestaurantRemainingBadge(restaurant, currentTimestamp, t);
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

  const renderPlanBadge = React.useCallback(
    (restaurant: PlatformRestaurant) =>
      renderRestaurantPlanBadge(restaurant, currentTimestamp, t),
    [currentTimestamp, t]
  );

  const renderRemainingBadge = React.useCallback(
    (restaurant: PlatformRestaurant) =>
      renderRestaurantRemainingBadge(restaurant, currentTimestamp, t),
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
              <div className='font-mono text-xs text-muted-foreground'>
                {formatPkMobile(owner.phone)}
              </div>
            </div>
          ) : (
            <span className='text-xs text-muted-foreground font-mono'>
              {formatPkMobile(restaurant.contactPhone)}
            </span>
          );
        },
        meta: { label: t('colOwner'), type: 'text', priority: 2 }
      },
      {
        id: 'items',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('colItems')} />
        ),
        cell: ({ row }) => {
          const count = row.original._count?.items ?? 0;
          return (
            <span className='font-semibold text-foreground text-xs whitespace-nowrap'>
              {t('prereqItemsCount', { count })}
            </span>
          );
        },
        meta: { label: t('colItems'), type: 'text', priority: 3 }
      },
      {
        id: 'deliveryAreas',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('colDeliveryAreas')} />
        ),
        cell: ({ row }) => {
          const count = row.original._count?.deliveryAreas ?? 0;
          return (
            <span className='font-semibold text-foreground text-xs whitespace-nowrap'>
              {t('prereqAreasCount', { count })}
            </span>
          );
        },
        meta: { label: t('colDeliveryAreas'), type: 'text', priority: 3 }
      },
      {
        id: 'plan',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('colPlan')} />
        ),
        cell: ({ row }) => renderPlanBadge(row.original),
        meta: {
          label: t('colPlan'),
          variant: 'multiSelect',
          options: [
            { label: t('trialBadge'), value: 'TRIAL' },
            { label: t('paidBadge'), value: 'PAID' }
          ],
          type: 'status',
          priority: 2
        },
        enableColumnFilter: true
      },
      {
        id: 'expiry',
        accessorKey: 'subscriptionEndsAt',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('colExpiry')} />
        ),
        cell: ({ row }) => {
          const endsAt = row.original.subscriptionEndsAt
            ? new Date(row.original.subscriptionEndsAt)
            : null;
          return (
            <span className='text-xs font-mono text-muted-foreground whitespace-nowrap'>
              {endsAt ? endsAt.toLocaleDateString() : '—'}
            </span>
          );
        },
        meta: { label: t('colExpiry'), type: 'date', priority: 3 }
      },
      {
        id: 'remaining',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('colDaysLeft')} />
        ),
        cell: ({ row }) => renderRemainingBadge(row.original),
        meta: {
          label: t('colDaysLeft'),
          variant: 'multiSelect',
          options: [
            { label: t('filterActive'), value: 'ACTIVE' },
            { label: t('filterExpiring'), value: 'EXPIRING' },
            { label: t('filterExpired'), value: 'EXPIRED' }
          ],
          type: 'status',
          priority: 2
        },
        enableColumnFilter: true
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
        size: 50,
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

          return (
            <div
              className='flex items-center justify-end'
              onClick={(e) => e.stopPropagation()}
            >
              <RowActionsMenu
                actions={[
                  ...(isPending
                    ? [
                        {
                          label: t('reviewApproval'),
                          icon: Icons.check,
                          onClick: () => onReview(restaurant)
                        }
                      ]
                    : []),
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
      renderPlanBadge,
      renderRemainingBadge,
      renderStatusBadge,
      t
    ]
  );
}
