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
import { IconCheck, IconX } from '@tabler/icons-react';
import { useExtendPlatformSubscription } from '../api/platform-query';
import type { ExtendSubscriptionDialogProps } from '../types';

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
      toast.error(t('validDaysRequired'));
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

  const handleSelectPreset = (days: number) => {
    setIsCustom(false);
    setSelectedDays(days);
  };

  const handleCustomDaysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomDays(e.target.value);
    setIsCustom(true);
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
              {t('currentExpiryLabel')}{' '}
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
                  onClick={() => handleSelectPreset(preset.days)}
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
              placeholder={t('customDaysPlaceholder')}
              value={customDays}
              onChange={handleCustomDaysChange}
            />
          </div>
        </div>

        <DialogFooter className='gap-2 sm:gap-2 pt-3 border-t border-border/60'>
          <Button type='button'
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={extendMutation.isPending}
            className='h-10 gap-1.5 rounded-xl px-4 text-xs font-semibold'
          >
            <IconX className='size-4' />
            <span>{t('cancel')}</span>
          </Button>
          <Button type='button' onClick={handleExtend} disabled={extendMutation.isPending} className='h-10 gap-1.5 rounded-xl px-5 text-xs font-semibold shadow-xs'>
            <IconCheck className='size-4' />
            <span>{t('confirm')}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
