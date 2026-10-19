'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Icons } from '@/components/icons';
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
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<PlatformRestaurantStatus | 'ALL'>('ALL');
  const [page, setPage] = React.useState(1);
  const limit = 15;

  // Dialog states
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

  const issueLinkMutation = useIssueSetupLink();

  const filter: QueryRestaurantsFilter = {
    page,
    limit,
    q: search.trim() || undefined,
    status: statusFilter
  };

  const { data: response, isLoading } = usePlatformRestaurants(filter);

  const restaurants = response?.data ?? [];
  const meta = response?.meta;
  const totalPages = meta?.totalPages ?? 1;

  // Aggregate metrics
  const totalCount = meta?.total ?? 0;
  const pendingCount = restaurants.filter((r) => r.status === 'PENDING').length;
  const activeCount = restaurants.filter((r) => r.status === 'ACTIVE').length;
  const suspendedCount = restaurants.filter(
    (r) => r.status === 'SUSPENDED' || r.status === 'DEACTIVATED'
  ).length;

  const handleOpenReview = (restaurant: PlatformRestaurant) => {
    setReviewRestaurantId(restaurant.id);
    setIsReviewOpen(true);
  };

  const handleOpenExtend = (restaurant: PlatformRestaurant) => {
    setExtendTarget({
      id: restaurant.id,
      name: restaurant.name,
      subscriptionEndsAt: restaurant.subscriptionEndsAt
    });
    setIsExtendOpen(true);
  };

  const handleOpenStatus = (
    restaurant: PlatformRestaurant,
    newStatus: PlatformRestaurantStatus
  ) => {
    setStatusTarget({
      id: restaurant.id,
      name: restaurant.name,
      status: newStatus
    });
    setIsStatusOpen(true);
  };

  const handleIssueLink = async (restaurant: PlatformRestaurant) => {
    try {
      const res = await issueLinkMutation.mutateAsync(restaurant.id);
      if (res.setupLink) {
        navigator.clipboard.writeText(res.setupLink);
        toast.success(t('setupLinkCopied'));
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to issue setup link';
      toast.error(msg);
    }
  };

  const renderStatusBadge = (status: PlatformRestaurantStatus) => {
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
  };

  const [currentTimestamp, setCurrentTimestamp] = React.useState<number | null>(null);

  React.useEffect(() => {
    setCurrentTimestamp(Date.now());
  }, []);

  const renderSubscriptionBadge = (restaurant: PlatformRestaurant) => {
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
  };

  return (
    <div className='space-y-6'>
      {/* Title & Action Header */}
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight text-foreground sm:text-3xl'>
            {t('title')}
          </h1>
          <p className='text-sm text-muted-foreground mt-1'>{t('subtitle')}</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className='gap-1.5 self-start sm:self-auto'>
          <Icons.add className='size-4' />
          {t('addRestaurant')}
        </Button>
      </div>

      {/* Summary KPI Cards */}
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>{t('metricTotal')}</CardTitle>
            <Icons.building className='size-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold font-mono'>{totalCount}</div>
            <p className='text-xs text-muted-foreground mt-1'>{t('metricTotalDesc')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>{t('metricPending')}</CardTitle>
            <Icons.clock className='size-4 text-amber-600 dark:text-amber-400' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold font-mono text-amber-600 dark:text-amber-400'>
              {pendingCount}
            </div>
            <p className='text-xs text-muted-foreground mt-1'>{t('metricPendingDesc')}</p>
          </CardContent>
        </Card>

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
            <CardTitle className='text-sm font-medium'>{t('metricSuspended')}</CardTitle>
            <Icons.ban className='size-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold font-mono'>{suspendedCount}</div>
            <p className='text-xs text-muted-foreground mt-1'>{t('metricSuspendedDesc')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div className='relative flex-1 sm:max-w-xs'>
          <Icons.search className='absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder={t('searchPlaceholder')}
            className='ps-9'
          />
        </div>

        <div className='flex items-center gap-1.5 overflow-x-auto'>
          <Button
            size='sm'
            variant={statusFilter === 'ALL' ? 'default' : 'outline'}
            onClick={() => {
              setStatusFilter('ALL');
              setPage(1);
            }}
          >
            {t('filterAll')}
          </Button>
          <Button
            size='sm'
            variant={statusFilter === 'PENDING' ? 'default' : 'outline'}
            onClick={() => {
              setStatusFilter('PENDING');
              setPage(1);
            }}
          >
            <Icons.clock className='me-1 size-3.5' />
            {t('filterPending')}
          </Button>
          <Button
            size='sm'
            variant={statusFilter === 'ACTIVE' ? 'default' : 'outline'}
            onClick={() => {
              setStatusFilter('ACTIVE');
              setPage(1);
            }}
          >
            <Icons.circleCheck className='me-1 size-3.5' />
            {t('filterActive')}
          </Button>
          <Button
            size='sm'
            variant={statusFilter === 'SUSPENDED' ? 'default' : 'outline'}
            onClick={() => {
              setStatusFilter('SUSPENDED');
              setPage(1);
            }}
          >
            <Icons.ban className='me-1 size-3.5' />
            {t('filterSuspended')}
          </Button>
        </div>
      </div>

      {/* Restaurants Table */}
      {isLoading ? (
        <div className='flex flex-col items-center justify-center py-16'>
          <Spinner className='size-8 text-primary' />
        </div>
      ) : restaurants.length === 0 ? (
        <Card className='py-16 text-center'>
          <CardContent className='flex flex-col items-center justify-center space-y-2'>
            <Icons.building className='size-10 text-muted-foreground/60' />
            <h3 className='text-base font-semibold text-foreground'>{t('emptyTitle')}</h3>
            <p className='text-sm text-muted-foreground max-w-sm'>{t('emptyDesc')}</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className='overflow-hidden rounded-lg border bg-card shadow-xs'>
            <Table>
              <TableHeader className='bg-muted/40'>
                <TableRow>
                  <TableHead>{t('colRestaurant')}</TableHead>
                  <TableHead>{t('colOwner')}</TableHead>
                  <TableHead>{t('colCatalog')}</TableHead>
                  <TableHead>{t('colSubscription')}</TableHead>
                  <TableHead>{t('colStatus')}</TableHead>
                  <TableHead className='text-end'>{t('colActions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {restaurants.map((restaurant) => {
                  const owner = restaurant.users?.[0];
                  const counts = restaurant['_count'];

                  return (
                    <TableRow key={restaurant.id} className='hover:bg-muted/30 transition-colors'>
                      <TableCell>
                        <div className='font-semibold text-foreground'>{restaurant.name}</div>
                        <div className='text-xs text-muted-foreground font-mono'>
                          /{restaurant.slug}
                        </div>
                        {restaurant.addressText && (
                          <div className='text-xs text-muted-foreground truncate max-w-[200px] mt-0.5'>
                            {restaurant.addressText}
                          </div>
                        )}
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
                          <span className='text-xs text-muted-foreground font-mono'>
                            {restaurant.contactPhone}
                          </span>
                        )}
                      </TableCell>

                      <TableCell>
                        <div className='text-xs text-muted-foreground space-y-0.5'>
                          <div>
                            <span className='font-semibold text-foreground'>
                              {counts?.items ?? 0}
                            </span>{' '}
                            items
                          </div>
                          <div>
                            <span className='font-semibold text-foreground'>
                              {counts?.deliveryAreas ?? 0}
                            </span>{' '}
                            areas
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>{renderSubscriptionBadge(restaurant)}</TableCell>

                      <TableCell>{renderStatusBadge(restaurant.status)}</TableCell>

                      <TableCell className='text-end'>
                        <div className='flex items-center justify-end gap-1.5'>
                          {restaurant.status === 'PENDING' && (
                            <Button
                              size='sm'
                              className='bg-amber-600 hover:bg-amber-700 text-white gap-1 text-xs'
                              onClick={() => handleOpenReview(restaurant)}
                            >
                              <Icons.check className='size-3.5' />
                              {t('reviewApproval')}
                            </Button>
                          )}

                          <DropdownMenu>
                            <DropdownMenuTrigger
                              render={
                                <Button
                                  size='sm'
                                  variant='ghost'
                                  className='size-8 p-0 text-muted-foreground hover:text-foreground'
                                />
                              }
                            >
                              <Icons.moreHorizontal className='size-4' />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align='end' className='w-48'>
                              <DropdownMenuItem
                                onClick={() => handleOpenReview(restaurant)}
                                className='gap-2'
                              >
                                <Icons.eye className='size-4 text-muted-foreground' />
                                {t('reviewApproval')}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleOpenExtend(restaurant)}
                                className='gap-2'
                              >
                                <Icons.creditCard className='size-4 text-muted-foreground' />
                                {t('extendSub')}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleIssueLink(restaurant)}
                                className='gap-2'
                              >
                                <Icons.clipboard className='size-4 text-muted-foreground' />
                                {t('getSetupLink')}
                              </DropdownMenuItem>

                              <DropdownMenuSeparator />

                              {restaurant.status === 'ACTIVE' ? (
                                <DropdownMenuItem
                                  onClick={() => handleOpenStatus(restaurant, 'SUSPENDED')}
                                  className='gap-2 text-rose-600 focus:text-rose-600'
                                >
                                  <Icons.ban className='size-4' />
                                  {t('suspendStore')}
                                </DropdownMenuItem>
                              ) : restaurant.status === 'SUSPENDED' ? (
                                <DropdownMenuItem
                                  onClick={() => handleOpenStatus(restaurant, 'ACTIVE')}
                                  className='gap-2 text-emerald-600 focus:text-emerald-600'
                                >
                                  <Icons.circleCheck className='size-4' />
                                  {t('reactivateStore')}
                                </DropdownMenuItem>
                              ) : null}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className='flex items-center justify-between pt-2'>
              <div className='text-xs text-muted-foreground'>
                {t('metricTotal')}: {meta?.total}
              </div>
              <div className='flex items-center gap-1'>
                <Button
                  size='sm'
                  variant='outline'
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <Icons.chevronLeft className='size-4' />
                </Button>
                <span className='px-2 text-xs font-mono font-medium'>
                  {page} / {totalPages}
                </span>
                <Button
                  size='sm'
                  variant='outline'
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  <Icons.chevronRight className='size-4' />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Integrated Dialogs */}
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
    </div>
  );
}
