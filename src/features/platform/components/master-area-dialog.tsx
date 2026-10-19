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
import { Switch } from '@/components/ui/switch';
import { Spinner } from '@/components/ui/spinner';
import { useCreateMasterArea, useUpdateMasterArea } from '../api/platform-query';
import type { MasterArea } from '../types';

interface MasterAreaDialogProps {
  area?: MasterArea | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MasterAreaDialog({ area, open, onOpenChange }: MasterAreaDialogProps) {
  const t = useTranslations('platformAreas');
  const createMutation = useCreateMasterArea();
  const updateMutation = useUpdateMasterArea();

  const isEditing = Boolean(area);
  const [name, setName] = React.useState('');
  const [slug, setSlug] = React.useState('');
  const [sortOrder, setSortOrder] = React.useState(0);
  const [isActive, setIsActive] = React.useState(true);

  React.useEffect(() => {
    if (area) {
      setName(area.name);
      setSlug(area.slug);
      setSortOrder(area.sortOrder);
      setIsActive(area.isActive);
    } else {
      setName('');
      setSlug('');
      setSortOrder(0);
      setIsActive(true);
    }
  }, [area, open]);

  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Area name cannot be empty');
      return;
    }

    try {
      if (isEditing && area) {
        await updateMutation.mutateAsync({
          id: area.id,
          input: {
            name: name.trim(),
            slug: slug.trim() || undefined,
            sortOrder,
            isActive
          }
        });
        toast.success(t('areaUpdated'));
      } else {
        await createMutation.mutateAsync({
          name: name.trim(),
          slug: slug.trim() || undefined,
          sortOrder,
          isActive
        });
        toast.success(t('areaCreated'));
      }
      onOpenChange(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save delivery area';
      toast.error(msg);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <DialogHeader>
            <DialogTitle>{isEditing ? t('dialogEditTitle') : t('dialogCreateTitle')}</DialogTitle>
            <DialogDescription>
              {isEditing ? t('dialogEditDesc') : t('dialogCreateDesc')}
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-3 text-sm'>
            <div className='space-y-1.5'>
              <Label htmlFor='area-name'>{t('areaName')}</Label>
              <Input
                id='area-name'
                required
                placeholder={t('areaNamePlaceholder')}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='area-slug'>{t('slug')}</Label>
              <Input
                id='area-slug'
                placeholder={t('slugPlaceholder')}
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='area-sort'>{t('sortOrder')}</Label>
              <Input
                id='area-sort'
                type='number'
                value={sortOrder}
                onChange={(e) => setSortOrder(parseInt(e.target.value, 10) || 0)}
              />
            </div>

            <div className='flex items-center justify-between rounded-lg border p-3'>
              <Label htmlFor='area-active' className='text-xs font-normal text-muted-foreground'>
                {t('activeLabel')}
              </Label>
              <Switch id='area-active' checked={isActive} onCheckedChange={setIsActive} />
            </div>
          </div>

          <DialogFooter className='gap-2 sm:gap-0 pt-2'>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              {t('cancel')}
            </Button>
            <Button type='submit' disabled={isPending}>
              {isPending && <Spinner className='me-1.5 size-4' />}
              {isPending ? t('saving') : t('saveArea')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
