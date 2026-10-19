'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { Icons } from '@/components/icons';
import {
  usePlatformRestaurantDetail,
  useUpdatePlatformRestaurantStatus
} from '../api/platform-query';

interface ReviewApprovalDialogProps {
  restaurantId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReviewApprovalDialog({
  restaurantId,
  open,
  onOpenChange
}: ReviewApprovalDialogProps) {
  const t = useTranslations('platformRestaurants');
  const { data: restaurant, isLoading } = usePlatformRestaurantDetail(open ? restaurantId : null);
  const statusMutation = useUpdatePlatformRestaurantStatus();

  const handleApprove = async () => {
    if (!restaurant) return;
    try {
      await statusMutation.mutateAsync({
        id: restaurant.id,
        input: { status: 'ACTIVE' }
      });
      toast.success(t('statusUpdated'));
      onOpenChange(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to approve restaurant';
      toast.error(message);
    }
  };

  const completeness = restaurant?.completeness;
  const isReady = completeness?.isReadyForApproval ?? false;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>{t('dialogReviewTitle')}</DialogTitle>
          <DialogDescription>{t('dialogReviewDesc')}</DialogDescription>
        </DialogHeader>

        {isLoading || !restaurant ? (
          <div className='flex items-center justify-center py-12'>
            <Spinner className='size-8 text-primary' />
          </div>
        ) : (
          <div className='space-y-4 text-sm'>
            {/* Restaurant Profile Summary */}
            <div className='rounded-lg border bg-card p-3 shadow-xs space-y-1'>
              <div className='flex items-center justify-between'>
                <span className='font-bold text-base text-foreground'>{restaurant.name}</span>
                <Badge
                  variant='outline'
                  className='border-amber-500/40 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                >
                  {t('statusPending')}
                </Badge>
              </div>
              <div className='text-xs text-muted-foreground'>
                Slug: <span className='font-mono font-medium'>{restaurant.slug}</span>
              </div>
              {restaurant.users && restaurant.users.length > 0 && (
                <div className='text-xs text-muted-foreground pt-1'>
                  Owner:{' '}
                  <span className='font-medium text-foreground'>{restaurant.users[0].name}</span> (
                  {restaurant.users[0].phone})
                </div>
              )}
            </div>

            {/* Readiness Checklist */}
            <div className='space-y-2'>
              <div className='font-semibold text-foreground'>{t('prerequisitesTitle')}</div>

              <div className='divide-y rounded-lg border bg-muted/20'>
                {/* 1. WhatsApp */}
                <div className='flex items-center justify-between p-2.5'>
                  <span className='text-xs text-foreground'>WhatsApp Orders Number</span>
                  {restaurant.whatsappNumber ? (
                    <Badge
                      variant='secondary'
                      className='bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    >
                      <Icons.check className='me-1 size-3' />
                      {restaurant.whatsappNumber}
                    </Badge>
                  ) : (
                    <Badge variant='destructive'>Missing</Badge>
                  )}
                </div>

                {/* 2. Hours */}
                <div className='flex items-center justify-between p-2.5'>
                  <span className='text-xs text-foreground'>Weekly Operating Hours</span>
                  {restaurant.hours && restaurant.hours.length > 0 ? (
                    <Badge
                      variant='secondary'
                      className='bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    >
                      <Icons.check className='me-1 size-3' />
                      {restaurant.hours.length} day(s) configured
                    </Badge>
                  ) : (
                    <Badge variant='destructive'>Missing</Badge>
                  )}
                </div>

                {/* 3. Items */}
                <div className='flex items-center justify-between p-2.5'>
                  <span className='text-xs text-foreground'>Active Menu Items</span>
                  {(restaurant['_count']?.items ?? 0) > 0 ? (
                    <Badge
                      variant='secondary'
                      className='bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    >
                      <Icons.check className='me-1 size-3' />
                      {restaurant['_count']?.items} items
                    </Badge>
                  ) : (
                    <Badge variant='destructive'>Missing</Badge>
                  )}
                </div>

                {/* 4. Delivery Areas */}
                <div className='flex items-center justify-between p-2.5'>
                  <span className='text-xs text-foreground'>
                    Active Delivery Areas in Lower Dir
                  </span>
                  {(restaurant['_count']?.deliveryAreas ?? 0) > 0 ? (
                    <Badge
                      variant='secondary'
                      className='bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    >
                      <Icons.check className='me-1 size-3' />
                      {restaurant['_count']?.deliveryAreas} areas
                    </Badge>
                  ) : (
                    <Badge variant='destructive'>Missing</Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Warning if not ready */}
            {!isReady && completeness?.missingPrerequisites && (
              <div className='rounded-lg border border-amber-500/40 bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'>
                <div className='font-semibold mb-1 flex items-center gap-1.5'>
                  <Icons.warning className='size-4' />
                  Incomplete Application
                </div>
                <ul className='list-disc list-inside space-y-0.5'>
                  {completeness.missingPrerequisites.map((req, idx) => (
                    <li key={idx}>{req}</li>
                  ))}
                </ul>
              </div>
            )}

            <DialogFooter className='gap-2 sm:gap-0 pt-2'>
              <Button
                variant='outline'
                onClick={() => onOpenChange(false)}
                disabled={statusMutation.isPending}
              >
                {t('cancel')}
              </Button>
              <Button
                disabled={!isReady || statusMutation.isPending}
                className='bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5'
                onClick={handleApprove}
              >
                {statusMutation.isPending && <Spinner className='size-4' />}
                <Icons.circleCheck className='size-4' />
                {t('approveButton')}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
