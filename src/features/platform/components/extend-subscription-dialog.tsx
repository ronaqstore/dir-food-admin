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
import { useExtendPlatformSubscription } from '../api/platform-query';

interface ExtendSubscriptionDialogProps {
  restaurantId: string | null;
  restaurantName: string;
  currentExpiry?: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExtendSubscriptionDialog({
  restaurantId,
  restaurantName,
  currentExpiry,
  open,
  onOpenChange
}: ExtendSubscriptionDialogProps) {
  const t = useTranslations('platformRestaurants');
  const extendMutation = useExtendPlatformSubscription();

  const [selectedDays, setSelectedDays] = React.useState<number>(30);
  const [customDays, setCustomDays] = React.useState<string>('');
  const [isCustom, setIsCustom] = React.useState(false);

  const presets = [
    { label: t('preset30'), days: 30 },
    { label: t('preset60'), days: 60 },
    { label: t('preset90'), days: 90 },
    { label: t('preset365'), days: 365 }
  ];

  const handleExtend = async () => {
    if (!restaurantId) return;
    const daysToAdd = isCustom ? parseInt(customDays, 10) : selectedDays;
    if (isNaN(daysToAdd) || daysToAdd <= 0) {
      toast.error('Please enter a valid number of days');
      return;
    }

    try {
      await extendMutation.mutateAsync({
        id: restaurantId,
        input: { addDays: daysToAdd }
      });
      toast.success(t('subExtended'));
      onOpenChange(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to extend subscription';
      toast.error(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>{t('dialogExtendTitle')}</DialogTitle>
          <DialogDescription>
            {restaurantName} — {t('dialogExtendDesc')}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4 text-sm'>
          {currentExpiry && (
            <div className='rounded-md bg-muted/40 p-2.5 text-xs text-muted-foreground'>
              Current Expiry:{' '}
              <span className='font-mono font-medium text-foreground'>
                {new Date(currentExpiry).toLocaleDateString()}
              </span>
            </div>
          )}

          <div className='space-y-2'>
            <Label>{t('extendDays')}</Label>
            <div className='grid grid-cols-2 gap-2'>
              {presets.map((preset) => (
                <Button
                  key={preset.days}
                  type='button'
                  variant={!isCustom && selectedDays === preset.days ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => {
                    setIsCustom(false);
                    setSelectedDays(preset.days);
                  }}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>

          <div className='space-y-1.5'>
            <div className='flex items-center justify-between'>
              <Label htmlFor='custom-days-input' className='text-xs text-muted-foreground'>
                {t('customDays')}
              </Label>
            </div>
            <Input
              id='custom-days-input'
              type='number'
              min='1'
              placeholder='e.g. 15, 45, 180'
              value={customDays}
              onChange={(e) => {
                setCustomDays(e.target.value);
                setIsCustom(true);
              }}
            />
          </div>
        </div>

        <DialogFooter className='gap-2 sm:gap-0 pt-2'>
          <Button
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={extendMutation.isPending}
          >
            {t('cancel')}
          </Button>
          <Button onClick={handleExtend} disabled={extendMutation.isPending}>
            {extendMutation.isPending && <Spinner className='me-1.5 size-4' />}
            {extendMutation.isPending ? t('extending') : t('confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
