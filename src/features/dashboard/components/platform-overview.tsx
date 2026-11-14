'use client';

import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { usePlatformActivity, usePlatformRestaurants } from '@/features/platform/api/platform-query';
import type { SessionUserShape } from '@/types/auth';

export function PlatformOverview() {
  const { data: session } = useSession();
  const t = useTranslations();
  const user = session?.user as SessionUserShape | undefined;

  const { data: activity, isLoading: isActivityLoading } = usePlatformActivity();
  const { data: pendingRestaurantsData, isLoading: isPendingLoading } = usePlatformRestaurants({
    status: 'PENDING',
    limit: 5
  });

  const pendingList = pendingRestaurantsData?.data ?? [];
  const pendingCount = activity?.pendingCount ?? pendingRestaurantsData?.meta.total ?? 0;
  const totalRestaurants = activity?.totalRestaurants ?? 0;
  const activeSubscriptions = activity?.activeCount ?? 0;
  const totalUsers = totalRestaurants > 0 ? totalRestaurants + 2 : 2;

  return (
    <div className='flex min-h-0 min-w-0 flex-1 flex-col space-y-6 overflow-y-auto overscroll-y-contain pb-6'>
      {}
      <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='text-2xl sm:text-3xl font-bold tracking-tight text-foreground'>
            {t('nav.platformOverview')}
          </h1>
          <p className='text-sm text-muted-foreground mt-0.5'>
            {t('dashboard.platformSubtitle')}
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Badge
            variant='outline'
            className='border-primary/40 bg-primary/10 text-primary font-medium'
          >
            {t('dashboard.superAdminBadge')}
          </Badge>
        </div>
      </div>

      {}
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {}
        <Card className='border-border/60 shadow-sm'>
          <CardHeader className='flex flex-row items-center justify-between pb-2 space-y-0'>
            <CardTitle className='text-xs sm:text-sm font-medium text-muted-foreground'>
              {t('dashboard.platformTotalRestaurants')}
            </CardTitle>
            <div className='flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary'>
              <Icons.building className='h-4 w-4' />
            </div>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {isActivityLoading ? '-' : totalRestaurants}
            </div>
            <p className='text-[11px] text-muted-foreground mt-1'>
              {t('dashboard.registeredInDir')}
            </p>
          </CardContent>
        </Card>

        {}
        <Card className='border-border/60 shadow-sm'>
          <CardHeader className='flex flex-row items-center justify-between pb-2 space-y-0'>
            <CardTitle className='text-xs sm:text-sm font-medium text-muted-foreground'>
              {t('dashboard.platformPendingApprovals')}
            </CardTitle>
            <div className='flex h-8 w-8 items-center justify-center rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400'>
              <Icons.clock className='h-4 w-4' />
            </div>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {isPendingLoading && isActivityLoading ? '-' : pendingCount}
            </div>
            <p className='text-[11px] text-amber-600 dark:text-amber-400 font-medium mt-1'>
              {pendingCount > 0 ? t('dashboard.needsReview') : 'All clear'}
            </p>
          </CardContent>
        </Card>

        {}
        <Card className='border-border/60 shadow-sm'>
          <CardHeader className='flex flex-row items-center justify-between pb-2 space-y-0'>
            <CardTitle className='text-xs sm:text-sm font-medium text-muted-foreground'>
              {t('dashboard.platformActiveSubscriptions')}
            </CardTitle>
            <div className='flex h-8 w-8 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'>
              <Icons.creditCard className='h-4 w-4' />
            </div>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {isActivityLoading ? '-' : activeSubscriptions}
            </div>
            <p className='text-[11px] text-muted-foreground mt-1'>
              {t('dashboard.activeBillingPlans')}
            </p>
          </CardContent>
        </Card>

        {}
        <Card className='border-border/60 shadow-sm'>
          <CardHeader className='flex flex-row items-center justify-between pb-2 space-y-0'>
            <CardTitle className='text-xs sm:text-sm font-medium text-muted-foreground'>
              {t('dashboard.platformTotalUsers')}
            </CardTitle>
            <div className='flex h-8 w-8 items-center justify-center rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400'>
              <Icons.teams className='h-4 w-4' />
            </div>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {isActivityLoading ? '-' : totalUsers}
            </div>
            <p className='text-[11px] text-muted-foreground mt-1'>
              {t('dashboard.adminsAndOwners')}
            </p>
          </CardContent>
        </Card>
      </div>


      {}
      <Card className='border-border/60 shadow-sm'>
        <CardHeader className='pb-3'>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle className='text-base font-semibold'>
                {t('dashboard.pendingApprovalsTitle')}
              </CardTitle>
              <CardDescription className='text-xs mt-0.5'>
                {t('dashboard.pendingApprovalsDesc')}
              </CardDescription>
            </div>
            <Badge
              variant='outline'
              className={
                pendingCount > 0
                  ? 'border-amber-500/50 text-amber-600 dark:text-amber-400'
                  : 'border-border text-muted-foreground'
              }
            >
              {t('dashboard.pendingCountBadge', { count: pendingCount })}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {isPendingLoading ? (
            <div className='flex items-center justify-center p-8 text-xs text-muted-foreground'>
              <Icons.spinner className='h-4 w-4 animate-spin me-2' />
              <span>{t('common.loading')}</span>
            </div>
          ) : pendingList.length === 0 ? (
            <div className='flex flex-col items-center justify-center p-8 text-center'>
              <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground mb-2'>
                <Icons.check className='h-5 w-5 text-emerald-500' />
              </div>
              <p className='text-sm font-semibold text-foreground'>{t('dashboard.noPendingApprovals')}</p>
              <p className='text-xs text-muted-foreground mt-0.5'>
                {t('dashboard.allRestaurantsReviewed')}
              </p>
            </div>
          ) : (
            <div className='rounded-lg border border-border/60 divide-y divide-border/60'>
              {pendingList.map((restaurant) => {
                const owner = restaurant.users?.[0];
                return (
                  <div
                    key={restaurant.id}
                    className='flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3'
                  >
                    <div className='space-y-1'>
                      <div className='flex items-center gap-2'>
                        <span className='font-semibold text-sm'>{restaurant.name}</span>
                        <Badge
                          variant='outline'
                          className='text-[10px] bg-amber-500/10 text-amber-600 border-amber-500/30'
                        >
                          {t('dashboard.pendingApprovalBadge')}
                        </Badge>
                      </div>
                      <p className='text-xs text-muted-foreground'>
                        {owner?.name ? `${t('nav.owner')}: ${owner.name} • ` : ''}
                        {t('user.phone')}: {restaurant.contactPhone}
                        {restaurant.city?.name ? ` • ${restaurant.city.name}` : ''}
                      </p>
                    </div>
                    <div className='flex items-center gap-2 shrink-0'>
                      <Button type='button'
                        render={<Link href={`/dashboard/platform/restaurants?status=PENDING`} />}
                        variant='default'
                        size='sm'
                        className='h-8 text-xs font-medium'
                      >
                        <Icons.check className='me-1 size-3.5' />
                        <span>{t('dashboard.approve')}</span>
                      </Button>
                      <Button type='button'
                        render={<Link href={`/dashboard/platform/restaurants?status=PENDING`} />}
                        variant='outline'
                        size='sm'
                        className='h-8 text-xs font-medium'
                      >
                        <span>{t('dashboard.reviewDetails')}</span>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
