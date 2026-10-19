'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Icons } from '@/components/icons';
import { usePlatformRestaurants } from '../api/platform-query';
import { ExtendSubscriptionDialog } from './extend-subscription-dialog';
import type { PlatformRestaurant } from '../types';

type SubscriptionFilter = 'ALL' | 'ACTIVE' | 'EXPIRING' | 'EXPIRED' | 'TRIAL';

export function SubscriptionsView() {
  const t = useTranslations('platformSubscriptions');
  const [search, setSearch] = React.useState('');
  const [filter, setFilter] = React.useState<SubscriptionFilter>('ALL');

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
    q: search.trim() || undefined
  });

  const restaurants = response?.data ?? [];

  // Categorize subscription status
  const analyzedRestaurants = React.useMemo(() => {
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

  // Aggregate metric counts
  const activeCount = analyzedRestaurants.filter(
    (r) => r.subStatus === 'ACTIVE' || r.subStatus === 'EXPIRING'
  ).length;
  const expiringCount = analyzedRestaurants.filter((r) => r.subStatus === 'EXPIRING').length;
  const expiredCount = analyzedRestaurants.filter((r) => r.subStatus === 'EXPIRED').length;
  const trialCount = analyzedRestaurants.filter((r) => r.isTrial).length;

  // Filtered list
  const filteredRestaurants = analyzedRestaurants.filter((r) => {
    if (filter === 'ACTIVE') return r.subStatus === 'ACTIVE' || r.subStatus === 'EXPIRING';
    if (filter === 'EXPIRING') return r.subStatus === 'EXPIRING';
    if (filter === 'EXPIRED') return r.subStatus === 'EXPIRED';
    if (filter === 'TRIAL') return r.isTrial;
    return true;
  });

  const handleOpenExtend = (restaurant: PlatformRestaurant) => {
    setExtendTarget({
      id: restaurant.id,
      name: restaurant.name,
      subscriptionEndsAt: restaurant.subscriptionEndsAt
    });
    setIsExtendOpen(true);
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div>
        <h1 className='text-2xl font-bold tracking-tight text-foreground sm:text-3xl'>
          {t('title')}
        </h1>
        <p className='text-sm text-muted-foreground mt-1'>{t('subtitle')}</p>
      </div>

      {/* KPI Metric Cards */}
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>{t('metricActive')}</CardTitle>
            <Icons.circleCheck className='size-4 text-emerald-600 dark:text-emerald-400' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400'>
              {activeCount}
            </div>
            <p className='text-xs text-muted-foreground mt-1'>{t('metricActiveDesc')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>{t('metricExpiring')}</CardTitle>
            <Icons.clock className='size-4 text-amber-600 dark:text-amber-400' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold font-mono text-amber-600 dark:text-amber-400'>
              {expiringCount}
            </div>
            <p className='text-xs text-muted-foreground mt-1'>{t('metricExpiringDesc')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>{t('metricExpired')}</CardTitle>
            <Icons.ban className='size-4 text-rose-600 dark:text-rose-400' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold font-mono text-rose-600 dark:text-rose-400'>
              {expiredCount}
            </div>
            <p className='text-xs text-muted-foreground mt-1'>{t('metricExpiredDesc')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>{t('metricTrial')}</CardTitle>
            <Icons.creditCard className='size-4 text-primary' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold font-mono text-primary'>{trialCount}</div>
            <p className='text-xs text-muted-foreground mt-1'>{t('metricTrialDesc')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div className='relative flex-1 sm:max-w-xs'>
          <Icons.search className='absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className='ps-9'
          />
        </div>

        <div className='flex items-center gap-1.5 overflow-x-auto'>
          <Button
            size='sm'
            variant={filter === 'ALL' ? 'default' : 'outline'}
            onClick={() => setFilter('ALL')}
          >
            {t('filterAll')}
          </Button>
          <Button
            size='sm'
            variant={filter === 'ACTIVE' ? 'default' : 'outline'}
            onClick={() => setFilter('ACTIVE')}
          >
            <Icons.circleCheck className='me-1 size-3.5' />
            {t('filterActive')}
          </Button>
          <Button
            size='sm'
            variant={filter === 'EXPIRING' ? 'default' : 'outline'}
            onClick={() => setFilter('EXPIRING')}
          >
            <Icons.clock className='me-1 size-3.5' />
            {t('filterExpiring')}
          </Button>
          <Button
            size='sm'
            variant={filter === 'EXPIRED' ? 'default' : 'outline'}
            onClick={() => setFilter('EXPIRED')}
          >
            <Icons.ban className='me-1 size-3.5' />
            {t('filterExpired')}
          </Button>
          <Button
            size='sm'
            variant={filter === 'TRIAL' ? 'default' : 'outline'}
            onClick={() => setFilter('TRIAL')}
          >
            <Icons.creditCard className='me-1 size-3.5' />
            {t('filterTrial')}
          </Button>
        </div>
      </div>

      {/* Subscriptions Table */}
      {isLoading ? (
        <div className='flex flex-col items-center justify-center py-16'>
          <Spinner className='size-8 text-primary' />
        </div>
      ) : filteredRestaurants.length === 0 ? (
        <Card className='py-16 text-center'>
          <CardContent className='flex flex-col items-center justify-center space-y-2'>
            <Icons.creditCard className='size-10 text-muted-foreground/60' />
            <h3 className='text-base font-semibold text-foreground'>{t('emptyTitle')}</h3>
            <p className='text-sm text-muted-foreground max-w-sm'>{t('emptyDesc')}</p>
          </CardContent>
        </Card>
      ) : (
        <div className='overflow-hidden rounded-lg border bg-card shadow-xs'>
          <Table>
            <TableHeader className='bg-muted/40'>
              <TableRow>
                <TableHead>{t('colRestaurant')}</TableHead>
                <TableHead>{t('colOwner')}</TableHead>
                <TableHead>{t('colPlan')}</TableHead>
                <TableHead>{t('colExpiry')}</TableHead>
                <TableHead>{t('colDaysLeft')}</TableHead>
                <TableHead className='text-end'>{t('colActions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRestaurants.map((restaurant) => {
                const owner = restaurant.users?.[0];
                const endsAt = restaurant.subscriptionEndsAt
                  ? new Date(restaurant.subscriptionEndsAt)
                  : null;

                return (
                  <TableRow key={restaurant.id} className='hover:bg-muted/30 transition-colors'>
                    <TableCell>
                      <div className='font-semibold text-foreground'>{restaurant.name}</div>
                      <div className='text-xs text-muted-foreground font-mono'>
                        /{restaurant.slug}
                      </div>
                    </TableCell>

                    <TableCell>
                      {owner ? (
                        <div>
                          <div className='font-medium text-foreground text-xs'>{owner.name}</div>
                          <div className='font-mono text-xs text-muted-foreground'>
                            {owner.phone}
                          </div>
                        </div>
                      ) : (
                        <span className='font-mono text-xs text-muted-foreground'>
                          {restaurant.contactPhone}
                        </span>
                      )}
                    </TableCell>

                    <TableCell>
                      {restaurant.isTrial ? (
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
                      )}
                    </TableCell>

                    <TableCell className='text-xs font-mono text-muted-foreground'>
                      {endsAt ? endsAt.toLocaleDateString() : '—'}
                    </TableCell>

                    <TableCell>
                      {restaurant.subStatus === 'EXPIRED' ? (
                        <Badge variant='destructive' className='text-[10px]'>
                          {t('expiredBadge')}
                        </Badge>
                      ) : restaurant.subStatus === 'EXPIRING' ? (
                        <Badge
                          variant='outline'
                          className='border-amber-500/40 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 text-[10px]'
                        >
                          <Icons.clock className='me-1 size-3' />
                          {t('daysRemaining', { days: restaurant.daysLeft })}
                        </Badge>
                      ) : (
                        <Badge
                          variant='secondary'
                          className='bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px]'
                        >
                          <Icons.circleCheck className='me-1 size-3' />
                          {t('daysRemaining', { days: restaurant.daysLeft })}
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell className='text-end'>
                      <Button
                        size='sm'
                        variant='outline'
                        className='gap-1.5 text-xs'
                        onClick={() => handleOpenExtend(restaurant)}
                      >
                        <Icons.creditCard className='size-3.5' />
                        {t('extendAction')}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Subscription Extension Dialog */}
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
