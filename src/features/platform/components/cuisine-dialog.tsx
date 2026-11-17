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
import { IconPlus, IconCheck, IconX } from '@tabler/icons-react';
import { useCreateMasterCuisine, useUpdateMasterCuisine } from '../api/cuisines-query';
import type { CuisineDialogProps } from '../cuisines.types';

export function CuisineDialog({ cuisine, open, onOpenChange }: CuisineDialogProps) {
  const t = useTranslations('platformCuisines');
  const tCommon = useTranslations('common');
  const createMutation = useCreateMasterCuisine();
  const updateMutation = useUpdateMasterCuisine();

  const isEditing = Boolean(cuisine);
  const [name, setName] = React.useState('');
  const [slug, setSlug] = React.useState('');
  const [sortOrder, setSortOrder] = React.useState(0);
  const [isActive, setIsActive] = React.useState(true);

  React.useEffect(() => {
    if (cuisine) {
      setName(cuisine.name);
      setSlug(cuisine.slug);
      setSortOrder(cuisine.sortOrder);
      setIsActive(cuisine.isActive);
    } else {
      setName('');
      setSlug('');
      setSortOrder(0);
      setIsActive(true);
    }
  }, [cuisine, open]);

  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error(t('nameEmpty'));
      return;
    }

    try {
      if (isEditing && cuisine) {
        await updateMutation.mutateAsync({
          id: cuisine.id,
          input: {
            name: name.trim(),
            slug: slug.trim() || undefined,
            sortOrder,
            isActive
          }
        });
        onOpenChange(false);
        toast.success(t('cuisineUpdated'));
      } else {
        await createMutation.mutateAsync({
          name: name.trim(),
          slug: slug.trim() || undefined,
          sortOrder,
          isActive
        });
        onOpenChange(false);
        toast.success(t('cuisineCreated'));
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : t('saveFailed');
      toast.error(msg);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <DialogHeader>
            <DialogTitle>{isEditing ? t('editCuisine') : t('addCuisine')}</DialogTitle>
            <DialogDescription>
              {isEditing ? t('editCuisineDesc') : t('addCuisineDesc')}
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-3 text-sm'>
            <div className='space-y-1.5'>
              <Label htmlFor='cuisine-name'>{t('colName')}</Label>
              <Input
                id='cuisine-name'
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('namePlaceholder')}
                required
                disabled={isPending}
                className='h-9'
              />
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='cuisine-slug'>{t('colSlug')}</Label>
              <Input
                id='cuisine-slug'
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder={t('slugPlaceholder')}
                disabled={isPending}
                className='h-9'
              />
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='cuisine-sort'>{t('colSort')}</Label>
              <Input
                id='cuisine-sort'
                type='number'
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                disabled={isPending}
                className='h-9'
              />
            </div>

            <div className='flex items-center justify-between rounded-lg border p-3'>
              <div className='space-y-0.5'>
                <Label htmlFor='cuisine-active'>{t('colStatus')}</Label>
                <p className='text-xs text-muted-foreground'>
                  {isActive ? t('active') : t('inactive')}
                </p>
              </div>
              <Switch
                id='cuisine-active'
                checked={isActive}
                onCheckedChange={setIsActive}
                disabled={isPending}
              />
            </div>
          </div>

          <DialogFooter className='gap-2 sm:gap-0'>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className='h-9'
            >
              <IconX className='size-4 me-1.5' />
              {tCommon('cancel')}
            </Button>
            <Button type='submit' disabled={isPending} className='h-9'>
              {isEditing ? (
                <IconCheck className='size-4 me-1.5' />
              ) : (
                <IconPlus className='size-4 me-1.5' />
              )}
              {isEditing ? tCommon('save') : tCommon('add')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
