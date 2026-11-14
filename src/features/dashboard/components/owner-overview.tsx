'use client';

import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import {
  IconAlertCircle,
  IconBrandWhatsapp,
  IconBuildingStore,
  IconClock,
  IconCopy,
  IconExternalLink,
  IconMapPin,
  IconPizza,
  IconRocket
} from '@tabler/icons-react';
import { Link } from '@/i18n/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { STOREFRONT_BASE_URL, WHATSAPP_BASE_URL } from '@/constants/api';
import { env } from '@/config/env';
import { formatPkr } from '@/lib/money';
import type { MissingPublishStep } from '../types';
import {
  useRestaurantProfile,
  usePublishReadiness,
  usePublishRestaurant
} from '@/features/settings/api/restaurant-query';
import type { SessionUserShape } from '@/types/auth';

export function OwnerOverview() {
  const { data: session } = useSession();
  const t = useTranslations();
  const user = session?.user as SessionUserShape | undefined;

  const { data: profile, refetch: refetchProfile } = useRestaurantProfile();
  const { data: readiness, refetch: refetchReadiness } = usePublishReadiness();
  const publishRestaurant = usePublishRestaurant();

  const restaurantName = profile?.name || user?.restaurantName || 'Dir Food';
  const currentStatus = profile?.status ?? user?.restaurantStatus ?? 'PENDING';
  const isPending = currentStatus === 'PENDING';
  const isActive = currentStatus === 'ACTIVE';

  const checks = {
    whatsapp: Boolean(profile?.whatsappNumber || readiness?.checks?.whatsapp),
    hours: readiness?.checks
      ? readiness.checks.hours
      : !readiness?.missingPrerequisites?.some((p) => p.toLowerCase().includes('hour')),
    items: readiness?.checks
      ? readiness.checks.items
      : !readiness?.missingPrerequisites?.some((p) => p.toLowerCase().includes('item')),
    deliveryAreas: readiness?.checks
      ? readiness.checks.deliveryAreas
      : !readiness?.missingPrerequisites?.some((p) => p.toLowerCase().includes('area'))
  };

  const missingSteps: MissingPublishStep[] = [];

  if (!checks.items) {
    missingSteps.push({
      id: 'items',
      description: t('dashboard.publishMissingMenuItem'),
      href: '/dashboard/menu',
      buttonText: t('dashboard.addMenuItem'),
      icon: <IconPizza className='size-3.5' />
    });
  }
  if (!checks.whatsapp) {
    missingSteps.push({
      id: 'whatsapp',
      description: t('dashboard.publishMissingWhatsapp'),
      href: '/dashboard/settings',
      buttonText: t('dashboard.whatsappSettings'),
      icon: <IconBrandWhatsapp className='size-3.5' />
    });
  }
  if (!checks.hours) {
    missingSteps.push({
      id: 'hours',
      description: t('dashboard.publishMissingHours'),
      href: '/dashboard/settings',
      buttonText: t('dashboard.stepHours'),
      icon: <IconClock className='size-3.5' />
    });
  }
  if (!checks.deliveryAreas) {
    missingSteps.push({
      id: 'deliveryAreas',
      description: t('dashboard.publishMissingAreas'),
      href: '/dashboard/settings',
      buttonText: t('dashboard.stepAreas'),
      icon: <IconMapPin className='size-3.5' />
    });
  }

  const isReadyToPublish = readiness?.isReadyToPublish ?? missingSteps.length === 0;

  const storefrontBase = env.NEXT_PUBLIC_WEB_URL || STOREFRONT_BASE_URL;
  const storefrontUrl = profile?.slug ? `${storefrontBase}/r/${profile.slug}` : '';

  const handlePublish = async () => {
    try {
      await publishRestaurant.mutateAsync();
      toast.success(t('restaurantSettings.publishSuccess'));
      void refetchProfile();
      void refetchReadiness();
    } catch (err) {
      const msg = err instanceof Error ? err.message : t('common.unexpectedError');
      toast.error(msg);
    }
  };

  const handleCopyLink = async () => {
    if (!storefrontUrl) return;
    try {
      await navigator.clipboard.writeText(storefrontUrl);
      toast.success(t('dashboard.linkCopied'));
    } catch {
      toast.error(t('common.unexpectedError'));
    }
  };

  const handleShareWhatsApp = () => {
    if (!storefrontUrl) return;
    const shareText = encodeURIComponent(
      `Assalam-o-Alaikum! Our restaurant ${restaurantName} is now live on Dir Food. Check out our menu and place orders here: ${storefrontUrl}`
    );
    window.open(`${WHATSAPP_BASE_URL}/?text=${shareText}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className='flex min-h-0 min-w-0 flex-1 flex-col space-y-6 overflow-y-auto overscroll-y-contain pb-6'>
      {}
      <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='text-2xl sm:text-3xl font-bold tracking-tight text-foreground'>
            {t('dashboard.hi', { name: user?.name || '' })}
          </h1>
          <p className='text-sm text-muted-foreground mt-0.5'>
            {t('dashboard.snapshot', { shop: restaurantName })}
          </p>
        </div>
        <div className='flex flex-wrap items-center gap-2'>
          <Badge
            variant={isPending ? 'outline' : 'default'}
            className={
              isPending
                ? 'border-amber-500/50 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium'
                : 'bg-emerald-600 hover:bg-emerald-600 text-white font-medium'
            }
          >
            {isPending ? t('dashboard.setupInProgressBadge') : t('dashboard.activeBadge')}
          </Badge>
          {isActive && storefrontUrl ? (
            <Button type='button'
              render={<a href={storefrontUrl} target='_blank' rel='noopener noreferrer' />}
              variant='outline'
              size='sm'
              className='gap-1.5'
            >
              <IconExternalLink className='size-3.5' />
              <span>{t('dashboard.viewStorefront')}</span>
            </Button>
          ) : null}
        </div>
      </div>

      {}
      {isActive ? (
        <Card className='border-emerald-500/30 bg-emerald-500/5 shadow-xs'>
          <CardContent className='flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between'>
            <div className='flex items-start gap-3.5'>
              <div className='flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'>
                <IconBuildingStore className='size-5' />
              </div>
              <div className='space-y-1'>
                <div className='flex flex-wrap items-center gap-2'>
                  <h3 className='font-semibold text-foreground text-base'>
                    {t('dashboard.storefrontLiveTitle')}
                  </h3>
                </div>
                <p className='text-xs sm:text-sm text-muted-foreground'>
                  {t('dashboard.storefrontLiveDesc')}
                </p>
              </div>
            </div>

            <div className='flex flex-wrap items-center gap-2 pt-2 sm:pt-0'>
              <Button type='button'
                onClick={handleCopyLink}
                variant='outline'
                size='sm'
                className='gap-1.5'
              >
                <IconCopy className='size-3.5' />
                <span>{t('dashboard.copyMenuLink')}</span>
              </Button>
              <Button type='button'
                onClick={handleShareWhatsApp}
                variant='default'
                size='sm'
                className='gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium'
              >
                <IconBrandWhatsapp className='size-4' />
                <span>{t('dashboard.shareOnWhatsapp')}</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {}
      {isPending ? (
        missingSteps.length > 0 ? (
          <div className='flex flex-col gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-3.5 sm:flex-row sm:items-center sm:justify-between shadow-2xs'>
            <div className='flex items-center gap-3 min-w-0'>
              <div className='flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400'>
                <IconAlertCircle className='size-4' />
              </div>
              <div className='min-w-0'>
                <p className='text-xs sm:text-sm text-foreground'>
                  <span className='font-semibold'>{t('dashboard.publishMissingPrefix')}{' '}</span>
                  <span className='text-muted-foreground'>
                    {missingSteps.map((s) => s.description).join(', ')}.
                  </span>
                </p>
              </div>
            </div>

            <div className='flex items-center gap-2 shrink-0 self-end sm:self-center'>
              <Button type='button'
                render={<Link href={missingSteps[0].href} />}
                size='sm'
                variant='default'
                className='gap-1.5 text-xs h-8 px-3'
              >
                {missingSteps[0].icon}
                <span>{missingSteps[0].buttonText}</span>
              </Button>
            </div>
          </div>
        ) : (
          <div className='flex flex-col gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3.5 sm:flex-row sm:items-center sm:justify-between shadow-2xs'>
            <div className='flex items-center gap-3 min-w-0'>
              <div className='flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'>
                <IconRocket className='size-4' />
              </div>
              <div className='min-w-0'>
                <p className='text-xs sm:text-sm font-semibold text-foreground'>
                  {t('dashboard.publishReadyTitle')}
                </p>
                <p className='text-xs text-muted-foreground'>
                  {t('restaurantSettings.readinessDesc')}
                </p>
              </div>
            </div>

            <div className='flex items-center gap-2 shrink-0 self-end sm:self-center'>
              <Button type='button'
                onClick={handlePublish}
                disabled={publishRestaurant.isPending}
                size='sm'
                className='gap-1.5 shadow-xs text-xs h-8 px-3'
              >
                <IconRocket className='size-3.5' />
                <span>{t('dashboard.publishCtaShort')}</span>
              </Button>
            </div>
          </div>
        )
      ) : null}

      {}
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {}
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

        {}
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
            <div className='text-2xl font-bold'>{formatPkr(0)}</div>
            <p className='text-[11px] text-muted-foreground mt-1'>{t('dashboard.todaySalesHint')}</p>
          </CardContent>
        </Card>

        {}
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

        {}
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

      {}
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
