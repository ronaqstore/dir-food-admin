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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { useUpdatePlatformRestaurantStatus } from '../api/platform-query';
import type { PlatformRestaurantStatus } from '../types';

interface StatusChangeDialogProps {
  restaurantId: string | null;
  restaurantName: string;
  targetStatus: PlatformRestaurantStatus | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StatusChangeDialog({
  restaurantId,
  restaurantName,
  targetStatus,
  open,
  onOpenChange
}: StatusChangeDialogProps) {
  const t = useTranslations('platformRestaurants');
  const statusMutation = useUpdatePlatformRestaurantStatus();
  const [reason, setReason] = React.useState('');

  React.useEffect(() => {
    if (!open) {
      setReason('');
    }
  }, [open]);

  if (!targetStatus) return null;

  const isDestructive = targetStatus === 'SUSPENDED' || targetStatus === 'DEACTIVATED';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurantId) return;

    if (isDestructive && !reason.trim()) {
      toast.error('A reason is required when suspending or deactivating');
      return;
    }

    try {
      await statusMutation.mutateAsync({
        id: restaurantId,
        input: {
          status: targetStatus,
          reason: reason.trim() || undefined
        }
      });
      toast.success(t('statusUpdated'));
      onOpenChange(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update status';
      toast.error(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <DialogHeader>
            <DialogTitle>
              {targetStatus === 'SUSPENDED'
                ? t('suspendStore')
                : targetStatus === 'DEACTIVATED'
                  ? t('deactivateStore')
                  : t('reactivateStore')}
            </DialogTitle>
            <DialogDescription>
              {restaurantName} — {t('dialogStatusDesc')}
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-2 text-sm'>
            <div className='space-y-1.5'>
              <Label htmlFor='status-reason'>
                {t('reasonLabel')} {isDestructive && '*'}
              </Label>
              <Input
                id='status-reason'
                required={isDestructive}
                placeholder={t('reasonPlaceholder')}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className='gap-2 sm:gap-0 pt-2'>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={statusMutation.isPending}
            >
              {t('cancel')}
            </Button>
            <Button
              type='submit'
              variant={isDestructive ? 'destructive' : 'default'}
              disabled={statusMutation.isPending}
            >
              {statusMutation.isPending && <Spinner className='me-1.5 size-4' />}
              {statusMutation.isPending ? t('updating') : t('confirm')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
