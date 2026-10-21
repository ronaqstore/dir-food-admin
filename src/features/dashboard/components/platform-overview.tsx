'use client';

import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import type { SessionUserShape } from '@/types/auth';

export function PlatformOverview() {
  const { data: session } = useSession();
  const t = useTranslations();
  const user = session?.user as SessionUserShape | undefined;

  return (
    <div className='space-y-6'>
      {/* Platform Header */}
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

      {/* Platform Metric Cards */}
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {/* Total Restaurants */}
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
            <div className='text-2xl font-bold'>1</div>
            <p className='text-[11px] text-muted-foreground mt-1'>
              {t('dashboard.registeredInDir')}
            </p>
          </CardContent>
        </Card>

        {/* Pending Approvals */}
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
            <div className='text-2xl font-bold'>1</div>
            <p className='text-[11px] text-amber-600 dark:text-amber-400 font-medium mt-1'>
              {t('dashboard.needsReview')}
            </p>
          </CardContent>
        </Card>

        {/* Active Subscriptions */}
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
            <div className='text-2xl font-bold'>0</div>
            <p className='text-[11px] text-muted-foreground mt-1'>
              {t('dashboard.activeBillingPlans')}
            </p>
          </CardContent>
        </Card>

        {/* Total Platform Users */}
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
            <div className='text-2xl font-bold'>2</div>
            <p className='text-[11px] text-muted-foreground mt-1'>
              {t('dashboard.adminsAndOwners')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className='border-border/60 shadow-sm'>
        <CardHeader className='pb-3'>
          <CardTitle className='text-base font-semibold'>{t('dashboard.quickActions')}</CardTitle>
          <CardDescription className='text-xs'>
            {t('dashboard.platformQuickActionsDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent className='flex flex-wrap gap-2.5'>
          <Button
            render={<Link href='/dashboard/platform/restaurants' />}
            variant='default'
            size='sm'
            className='gap-2'
          >
            <Icons.building className='h-4 w-4' />
            <span>{t('nav.restaurants')}</span>
          </Button>

          <Button
            render={<Link href='/dashboard/platform/subscriptions' />}
            variant='secondary'
            size='sm'
            className='gap-2'
          >
            <Icons.creditCard className='h-4 w-4' />
            <span>{t('nav.subscriptions')}</span>
          </Button>

          <Button
            render={<Link href='/dashboard/platform/settings' />}
            variant='outline'
            size='sm'
            className='gap-2'
          >
            <Icons.settings className='h-4 w-4' />
            <span>{t('nav.settings')}</span>
          </Button>
        </CardContent>
      </Card>

      {/* Pending Approvals Widget */}
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
              className='border-amber-500/50 text-amber-600 dark:text-amber-400'
            >
              {t('dashboard.pendingCountBadge', { count: 1 })}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className='rounded-lg border border-border/60 divide-y divide-border/60'>
            <div className='flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3'>
              <div className='space-y-1'>
                <div className='flex items-center gap-2'>
                  <span className='font-semibold text-sm'>Hotel Al-Noor</span>
                  <Badge
                    variant='outline'
                    className='text-[10px] bg-amber-500/10 text-amber-600 border-amber-500/30'
                  >
                    {t('dashboard.pendingApprovalBadge')}
                  </Badge>
                </div>
                <p className='text-xs text-muted-foreground'>
                  {t('nav.owner')}: Ahmad Khan • {t('user.phone')}: 03001234567 • Timergara
                </p>
              </div>
              <div className='flex items-center gap-2 shrink-0'>
                <Button
                  render={<Link href='/dashboard/platform/restaurants' />}
                  variant='default'
                  size='sm'
                  className='h-8 text-xs font-medium'
                >
                  <Icons.check className='me-1 size-3.5' />
                  <span>{t('dashboard.approve')}</span>
                </Button>
                <Button
                  render={<Link href='/dashboard/platform/restaurants' />}
                  variant='outline'
                  size='sm'
                  className='h-8 text-xs font-medium'
                >
                  <span>{t('dashboard.reviewDetails')}</span>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
