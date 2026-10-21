'use client';

import * as React from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import { parseAsArrayOf, parseAsInteger, parseAsString, useQueryState, useQueryStates } from 'nuqs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { usePlatformRestaurants } from '../api/platform-query';
import { ExtendSubscriptionDialog } from './extend-subscription-dialog';
import type { PlatformRestaurant } from '../types';

interface AnalyzedRestaurant extends PlatformRestaurant {
  subStatus: 'NEVER' | 'ACTIVE' | 'EXPIRING' | 'EXPIRED';
  daysLeft: number;
  isTrial: boolean;
}

export function SubscriptionsView() {
  const t = useTranslations('platformSubscriptions');
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
  const [perPage] = useQueryState('perPage', parseAsInteger.withDefault(10));
  const [name] = useQueryState('name', parseAsString);
  const [facetValues] = useQueryStates({
    subStatus: parseAsArrayOf(parseAsString, ',')
  });

  const [extendTarget, setExtendTarget] = React.useState<{
    id: string;
    name: string;
    subscriptionEndsAt?: string | null;
  } | null>(null);
  const [isExtendOpen, setIsExtendOpen] = React.useState(false);

  const [currentTimestamp, setCurrentTimestamp] = React.useState<number | null>(null);

  React.useEffect(() => {
    setCurrentTimestamp(Date.now());
  }, []);

  const { data: response, isLoading } = usePlatformRestaurants({
    limit: 50,
    q: name?.trim() || undefined
  });

  const restaurants = React.useMemo(() => response?.data ?? [], [response?.data]);

  const analyzedRestaurants = React.useMemo<AnalyzedRestaurant[]>(() => {
    if (!currentTimestamp) return [];

    return restaurants.map((r) => {
      const endsAt = r.subscriptionEndsAt ? new Date(r.subscriptionEndsAt) : null;
      const trialStartedAt = r.trialStartedAt ? new Date(r.trialStartedAt) : null;

      let subStatus: 'NEVER' | 'ACTIVE' | 'EXPIRING' | 'EXPIRED' = 'NEVER';
      let daysLeft = 0;

      if (!trialStartedAt) {
        subStatus = 'NEVER';
      } else if (!endsAt) {
        subStatus = 'EXPIRED';
      } else {
        const diffMs = endsAt.getTime() - currentTimestamp;
        daysLeft = Math.ceil(diffMs / (24 * 60 * 60 * 1000));

        if (diffMs <= 0) {
          subStatus = 'EXPIRED';
        } else if (daysLeft <= 7) {
          subStatus = 'EXPIRING';
        } else {
          subStatus = 'ACTIVE';
        }
      }

      return {
        ...r,
        subStatus,
        daysLeft,
        isTrial: Boolean(trialStartedAt && daysLeft > 0 && r.status === 'ACTIVE')
      };
    });
  }, [restaurants, currentTimestamp]);

  const activeCount = analyzedRestaurants.filter(
    (r) => r.subStatus === 'ACTIVE' || r.subStatus === 'EXPIRING'
  ).length;
  const expiringCount = analyzedRestaurants.filter((r) => r.subStatus === 'EXPIRING').length;
  const expiredCount = analyzedRestaurants.filter((r) => r.subStatus === 'EXPIRED').length;
  const trialCount = analyzedRestaurants.filter((r) => r.isTrial).length;

  const handleOpenExtend = React.useCallback((restaurant: PlatformRestaurant) => {
    setExtendTarget({
      id: restaurant.id,
      name: restaurant.name,
      subscriptionEndsAt: restaurant.subscriptionEndsAt
    });
    setIsExtendOpen(true);
  }, []);

  const selectedSubStatus = facetValues.subStatus?.[0];

  const filteredRestaurants = React.useMemo(() => {
    if (!selectedSubStatus || selectedSubStatus === 'ALL') {
      return analyzedRestaurants;
    }
    if (selectedSubStatus === 'ACTIVE') {
      return analyzedRestaurants.filter((r) => r.subStatus === 'ACTIVE' || r.subStatus === 'EXPIRING');
    }
    if (selectedSubStatus === 'EXPIRING') {
      return analyzedRestaurants.filter((r) => r.subStatus === 'EXPIRING');
    }
    if (selectedSubStatus === 'EXPIRED') {
      return analyzedRestaurants.filter((r) => r.subStatus === 'EXPIRED');
    }
    if (selectedSubStatus === 'TRIAL') {
      return analyzedRestaurants.filter((r) => r.isTrial);
    }
    return analyzedRestaurants;
  }, [analyzedRestaurants, selectedSubStatus]);

  const columns = React.useMemo<ColumnDef<AnalyzedRestaurant>[]>(
    () => [
      {
        id: 'name',
        accessorKey: 'name',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('colRestaurant')} />
        ),
        cell: ({ row }) => (
          <div className='min-w-40'>
            <div className='font-semibold text-foreground'>{row.original.name}</div>
            <div className='text-xs text-muted-foreground font-mono'>/{row.original.slug}</div>
          </div>
        ),
        meta: {
          label: t('colRestaurant'),
          placeholderKey: 'platformSubscriptions.searchPlaceholder',
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
          const owner = row.original.users?.[0];
          return owner ? (
            <div>
              <div className='font-medium text-foreground text-xs'>{owner.name}</div>
              <div className='font-mono text-xs text-muted-foreground'>{owner.phone}</div>
            </div>
          ) : (
            <span className='font-mono text-xs text-muted-foreground'>
              {row.original.contactPhone}
            </span>
          );
        },
        meta: { label: t('colOwner'), type: 'text', priority: 2 }
      },
      {
        id: 'plan',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('colPlan')} />
        ),
        cell: ({ row }) =>
          row.original.isTrial ? (
            <Badge
              variant='outline'
              className='border-primary/40 bg-primary/10 text-primary text-[10px]'
            >
              {t('trialBadge')}
            </Badge>
          ) : (
            <Badge variant='secondary' className='text-[10px]'>
              {t('paidBadge')}
            </Badge>
          ),
        meta: { label: t('colPlan'), type: 'text', priority: 3 }
      },
      {
        id: 'expiry',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('colExpiry')} />
        ),
        cell: ({ row }) => {
          const endsAt = row.original.subscriptionEndsAt
            ? new Date(row.original.subscriptionEndsAt)
            : null;
          return (
            <span className='text-xs font-mono text-muted-foreground'>
              {endsAt ? endsAt.toLocaleDateString() : '—'}
            </span>
          );
        },
        meta: { label: t('colExpiry'), type: 'date', priority: 2 }
      },
      {
        id: 'subStatus',
        accessorKey: 'subStatus',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('colDaysLeft')} />
        ),
        cell: ({ row }) => {
          const restaurant = row.original;
          if (restaurant.subStatus === 'EXPIRED') {
            return (
              <Badge variant='destructive' className='text-[10px]'>
                {t('expiredBadge')}
              </Badge>
            );
          }
          if (restaurant.subStatus === 'EXPIRING') {
            return (
              <Badge
                variant='outline'
                className='border-amber-500/40 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 text-[10px]'
              >
                <Icons.clock className='me-1 size-3' />
                {t('daysRemaining', { days: restaurant.daysLeft })}
              </Badge>
            );
          }
          return (
            <Badge
              variant='secondary'
              className='bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px]'
            >
              <Icons.circleCheck className='me-1 size-3' />
              {t('daysRemaining', { days: restaurant.daysLeft })}
            </Badge>
          );
        },
        meta: {
          label: t('colDaysLeft'),
          variant: 'multiSelect',
          options: [
            { label: t('filterActive'), value: 'ACTIVE' },
            { label: t('filterExpiring'), value: 'EXPIRING' },
            { label: t('filterExpired'), value: 'EXPIRED' },
            { label: t('filterTrial'), value: 'TRIAL' }
          ],
          type: 'status',
          priority: 1
        },
        enableColumnFilter: true
      },
      {
        id: 'actions',
        size: 140,
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={t('colActions')}
            className='text-end justify-end'
          />
        ),
        cell: ({ row }) => {
          const restaurant = row.original;
          const handleQuickExtend = (e: React.MouseEvent) => {
            e.stopPropagation();
            handleOpenExtend(restaurant);
          };

          return (
            <div
              className='flex items-center justify-end gap-1.5'
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                size='sm'
                variant='outline'
                className='h-7 text-xs gap-1'
                onClick={handleQuickExtend}
              >
                <Icons.creditCard className='size-3' />
                {t('extendButton')}
              </Button>
              <RowActionsMenu
                actions={[
                  {
                    label: t('extendButton'),
                    icon: Icons.creditCard,
                    onClick: () => handleOpenExtend(restaurant)
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
    [handleOpenExtend, t]
  );

  const subscriptionMobileItem = React.useMemo<MobileItemConfig<AnalyzedRestaurant>>(
    () => ({
      leading: 'avatar',
      title: (row) => row.name,
      subtitle: (row) => {
        const owner = row.users?.[0];
        return owner ? `${owner.name} · ${owner.phone}` : row.contactPhone;
      },
      badge: (row) => ({
        label: row.isTrial ? t('trialBadge') : t('paidBadge'),
        status: row.subStatus
      }),
      value: (row) => t('daysRemaining', { days: row.daysLeft }),
      valueLabel: () => t('colDaysLeft'),
      meta: [
        (row) =>
          row.subscriptionEndsAt
            ? `${t('colExpiry')}: ${new Date(row.subscriptionEndsAt).toLocaleDateString()}`
            : ''
      ],
      ariaLabel: (row) => `${row.name}, ${row.subStatus}`
    }),
    [t]
  );

  const subscriptionDetail = React.useMemo<DetailConfig<AnalyzedRestaurant>>(
    () => ({
      mode: 'sheet',
      title: (row) => row.name,
      badge: (row) => ({
        label: row.subStatus,
        status: row.subStatus
      }),
      sections: (row) => [
        {
          title: t('colRestaurant'),
          fields: [
            { label: t('colRestaurant'), value: row.name },
            { label: 'Slug', value: `/${row.slug}` },
            { label: t('colOwner'), value: row.users?.[0]?.name || '—' },
            { label: 'Phone', value: row.users?.[0]?.phone || row.contactPhone }
          ]
        },
        {
          title: t('colSubscription'),
          fields: [
            { label: t('colPlan'), value: row.isTrial ? t('trialBadge') : t('paidBadge') },
            {
              label: t('colExpiry'),
              value: row.subscriptionEndsAt
                ? new Date(row.subscriptionEndsAt).toLocaleDateString()
                : '—'
            },
            {
              label: t('colDaysLeft'),
              value: t('daysRemaining', { days: row.daysLeft })
            }
          ]
        }
      ],
      actions: (row) => [
        {
          label: t('extendButton'),
          onClick: () => handleOpenExtend(row)
        }
      ]
    }),
    [handleOpenExtend, t]
  );

  const subscriptionQuickFilters = React.useMemo<QuickFilterChip[]>(
    () => [
      { id: 'all', label: t('filterAll') },
      { id: 'ACTIVE', label: t('filterActive'), columnId: 'subStatus', value: ['ACTIVE'] },
      { id: 'EXPIRING', label: t('filterExpiring'), columnId: 'subStatus', value: ['EXPIRING'] },
      { id: 'EXPIRED', label: t('filterExpired'), columnId: 'subStatus', value: ['EXPIRED'] },
      { id: 'TRIAL', label: t('filterTrial'), columnId: 'subStatus', value: ['TRIAL'] }
    ],
    [t]
  );

  const pageCount = Math.max(1, Math.ceil(filteredRestaurants.length / perPage));

  React.useEffect(() => {
    if (page > pageCount && pageCount > 0) {
      void setPage(1);
    }
  }, [page, pageCount, setPage]);

  const paginatedRestaurants = React.useMemo(() => {
    const start = (page - 1) * perPage;
    return filteredRestaurants.slice(start, start + perPage);
  }, [filteredRestaurants, page, perPage]);

  const { table } = useDataTable({
    data: paginatedRestaurants,
    columns,
    pageCount,
    rowCount: filteredRestaurants.length,
    shallow: true,
    debounceMs: 400,
    initialState: {
      pagination: { pageIndex: page - 1, pageSize: perPage },
      columnPinning: { right: ['actions'] }
    }
  });

  return (
    <div className='flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-hidden'>
      <div className='flex shrink-0 flex-col gap-1'>
        <h1 className='text-2xl font-bold tracking-tight text-foreground sm:text-3xl'>
          {t('title')}
        </h1>
        <p className='text-sm text-muted-foreground mt-0.5'>{t('subtitle')}</p>
      </div>

      <div className='grid shrink-0 grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4'>
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
            <span className='text-xs sm:text-sm font-medium text-amber-600 dark:text-amber-400'>
              {t('metricExpiring')}
            </span>
            <Icons.clock className='size-4 text-amber-600 dark:text-amber-400' />
          </div>
          <div className='text-xl sm:text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1'>
            {expiringCount}
          </div>
          <p className='text-[11px] text-muted-foreground truncate'>{t('metricExpiringDesc')}</p>
        </Card>

        <Card className='p-3 sm:p-4'>
          <div className='flex items-center justify-between'>
            <span className='text-xs sm:text-sm font-medium text-rose-600 dark:text-rose-400'>
              {t('metricExpired')}
            </span>
            <Icons.ban className='size-4 text-rose-600 dark:text-rose-400' />
          </div>
          <div className='text-xl sm:text-2xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-1'>
            {expiredCount}
          </div>
          <p className='text-[11px] text-muted-foreground truncate'>{t('metricExpiredDesc')}</p>
        </Card>

        <Card className='p-3 sm:p-4'>
          <div className='flex items-center justify-between'>
            <span className='text-xs sm:text-sm font-medium text-primary'>
              {t('metricTrial')}
            </span>
            <Icons.creditCard className='size-4 text-primary' />
          </div>
          <div className='text-xl sm:text-2xl font-bold font-mono text-primary mt-1'>
            {trialCount}
          </div>
          <p className='text-[11px] text-muted-foreground truncate'>{t('metricTrialDesc')}</p>
        </Card>
      </div>

      <TablePageBody>
        <ResponsiveDataTable
          table={table}
          mobileItem={subscriptionMobileItem}
          detail={subscriptionDetail}
          quickFilters={subscriptionQuickFilters}
          isLoading={isLoading}
          rowCount={filteredRestaurants.length}
        />
      </TablePageBody>

      {extendTarget && (
        <ExtendSubscriptionDialog
          restaurantId={extendTarget.id}
          restaurantName={extendTarget.name}
          currentExpiry={extendTarget.subscriptionEndsAt}
          open={isExtendOpen}
          onOpenChange={setIsExtendOpen}
        />
      )}
    </div>
  );
}