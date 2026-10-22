'use client';

import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Icons } from '@/components/icons';
import type { SessionUserShape } from '@/types/auth';

export function OwnerOverview() {
  const { data: session } = useSession();
  const t = useTranslations();
  const user = session?.user as SessionUserShape | undefined;

  const restaurantName = user?.restaurantName || 'Dir Food';
  const restaurantStatus = user?.restaurantStatus || 'PENDING';
  const isPending = restaurantStatus === 'PENDING';

  return (
    <div className='flex min-h-0 min-w-0 flex-1 flex-col space-y-6 overflow-y-auto overscroll-y-contain pb-6'>
      {/* Welcome & Status Header */}
      <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='text-2xl sm:text-3xl font-bold tracking-tight text-foreground'>
            {t('dashboard.hi', { name: user?.name || '' })}
          </h1>
          <p className='text-sm text-muted-foreground mt-0.5'>
            {t('dashboard.snapshot', { shop: restaurantName })}
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Badge
            variant={isPending ? 'outline' : 'default'}
            className={
              isPending
                ? 'border-amber-500/50 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium'
                : 'bg-emerald-600 hover:bg-emerald-600 text-white font-medium'
            }
          >
            {isPending ? t('dashboard.pendingApprovalBadge') : t('dashboard.activeBadge')}
          </Badge>
        </div>
      </div>

      {/* Pending Approval Notice */}
      {isPending ? (
        <Alert className='border-amber-500/30 bg-amber-500/5 text-foreground'>
          <Icons.info className='size-4 text-amber-500' />
          <AlertTitle className='font-semibold text-amber-600 dark:text-amber-400'>
            {t('dashboard.pendingApprovalTitle')}
          </AlertTitle>
          <AlertDescription className='text-xs sm:text-sm text-muted-foreground mt-1'>
            {t('dashboard.pendingApprovalBanner')}
          </AlertDescription>
        </Alert>
      ) : null}

      {/* Key Metric Cards */}
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {/* Today's Orders */}
        <Card className='border-border/60 shadow-sm'>
          <CardHeader className='flex flex-row items-center justify-between pb-2 space-y-0'>
            <CardTitle className='text-xs sm:text-sm font-medium text-muted-foreground'>
              {t('dashboard.todayOrders')}
            </CardTitle>
            <div className='flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary'>
              <Icons.receipt className='h-4 w-4' />
            </div>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>0</div>
            <p className='text-[11px] text-muted-foreground mt-1'>{t('dashboard.todayOrdersHint')}</p>
          </CardContent>
        </Card>

        {/* Today's Sales */}
        <Card className='border-border/60 shadow-sm'>
          <CardHeader className='flex flex-row items-center justify-between pb-2 space-y-0'>
            <CardTitle className='text-xs sm:text-sm font-medium text-muted-foreground'>
              {t('dashboard.todaySales')}
            </CardTitle>
            <div className='flex h-8 w-8 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'>
              <Icons.cash className='h-4 w-4' />
            </div>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>Rs 0</div>
            <p className='text-[11px] text-muted-foreground mt-1'>{t('dashboard.todaySalesHint')}</p>
          </CardContent>
        </Card>

        {/* Active Orders */}
        <Card className='border-border/60 shadow-sm'>
          <CardHeader className='flex flex-row items-center justify-between pb-2 space-y-0'>
            <CardTitle className='text-xs sm:text-sm font-medium text-muted-foreground'>
              {t('dashboard.activeOrders')}
            </CardTitle>
            <div className='flex h-8 w-8 items-center justify-center rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400'>
              <Icons.clock className='h-4 w-4' />
            </div>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>0</div>
            <p className='text-[11px] text-muted-foreground mt-1'>{t('dashboard.activeOrdersHint')}</p>
          </CardContent>
        </Card>

        {/* Menu Items */}
        <Card className='border-border/60 shadow-sm'>
          <CardHeader className='flex flex-row items-center justify-between pb-2 space-y-0'>
            <CardTitle className='text-xs sm:text-sm font-medium text-muted-foreground'>
              {t('dashboard.totalMenuItems')}
            </CardTitle>
            <div className='flex h-8 w-8 items-center justify-center rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400'>
              <Icons.pizza className='h-4 w-4' />
            </div>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>0</div>
            <p className='text-[11px] text-muted-foreground mt-1'>
              {t('dashboard.totalMenuItemsHint')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Action Shortcuts */}
      <Card className='border-border/60 shadow-sm'>
        <CardHeader className='pb-3'>
          <CardTitle className='text-base font-semibold'>{t('dashboard.quickActions')}</CardTitle>
          <CardDescription className='text-xs'>{t('dashboard.quickActionsDesc')}</CardDescription>
        </CardHeader>
        <CardContent className='flex flex-wrap gap-2.5'>
          <Button
            render={<Link href='/dashboard/menu' />}
            variant='default'
            size='sm'
            className='gap-2'
          >
            <Icons.add className='h-4 w-4' />
            <span>{t('dashboard.addMenuItem')}</span>
          </Button>

          <Button
            render={<Link href='/dashboard/orders' />}
            variant='secondary'
            size='sm'
            className='gap-2'
          >
            <Icons.receipt className='h-4 w-4' />
            <span>{t('dashboard.viewLiveOrders')}</span>
          </Button>

          <Button
            render={<Link href='/dashboard/settings' />}
            variant='outline'
            size='sm'
            className='gap-2'
          >
            <Icons.chat className='h-4 w-4' />
            <span>{t('dashboard.whatsappSettings')}</span>
          </Button>

          <Button
            render={<Link href='/dashboard/settings' />}
            variant='outline'
            size='sm'
            className='gap-2'
          >
            <Icons.qrCode className='h-4 w-4 text-primary' />
            <span>{t('dashboard.qrCodeShortcut')}</span>
          </Button>
        </CardContent>
      </Card>

      {/* Recent Orders Preview */}
      <Card className='border-border/60 shadow-sm'>
        <CardHeader className='pb-3'>
          <CardTitle className='text-base font-semibold'>{t('dashboard.recentOrders')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex flex-col items-center justify-center py-10 text-center text-muted-foreground'>
            <div className='flex h-12 w-12 items-center justify-center rounded-full bg-muted/60 mb-3'>
              <Icons.receipt className='h-6 w-6 text-muted-foreground/60' />
            </div>
            <p className='text-sm font-medium'>{t('dashboard.noRecentOrders')}</p>
            <p className='text-xs text-muted-foreground mt-1 max-w-sm'>
              {t('dashboard.noRecentOrdersDesc')}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
