'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreatePlatformCity } from '../api/platform-query';
import type { AddDistrictDialogProps } from '../types';

export function AddDistrictDialog({
  open,
  onOpenChange,
  onCreated
}: AddDistrictDialogProps) {
  const t = useTranslations('platformAreas');
  const [cityName, setCityName] = React.useState('');
  const createCityMutation = useCreatePlatformCity();

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleCityNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCityName(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cityName.trim()) return;
    try {
      const created = await createCityMutation.mutateAsync({ name: cityName.trim() });
      toast.success(t('districtCreated', { name: cityName.trim() }));
      setCityName('');
      onOpenChange(false);
      onCreated?.(created.id);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('districtFailed'));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <DialogHeader>
            <DialogTitle>{t('dialogAddDistrictTitle')}</DialogTitle>
            <DialogDescription>
              {t('dialogAddDistrictDesc')}
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-3 text-sm'>
            <div className='space-y-1.5'>
              <Label htmlFor='city-name'>{t('districtNameLabel')}</Label>
              <Input
                id='city-name'
                required
                placeholder={t('districtNamePlaceholder')}
                value={cityName}
                onChange={handleCityNameChange}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type='button'
              variant='ghost'
              onClick={handleClose}
              disabled={createCityMutation.isPending}
            >
              {t('cancel')}
            </Button>
            <Button type='submit' disabled={createCityMutation.isPending}>
              {t('createDistrictButton')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
