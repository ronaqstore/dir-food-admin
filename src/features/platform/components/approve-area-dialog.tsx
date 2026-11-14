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
import { useApproveMasterArea } from '../api/platform-query';
import type { ApproveAreaDialogProps } from '../types';

export function ApproveAreaDialog({
  area,
  open,
  onOpenChange
}: ApproveAreaDialogProps) {
  const t = useTranslations('platformAreas');
  const approveMutation = useApproveMasterArea();
  const [name, setName] = React.useState('');
  const [slug, setSlug] = React.useState('');

  React.useEffect(() => {
    if (area) {
      setName(area.name);
      setSlug(area.slug);
    } else {
      setName('');
      setSlug('');
    }
  }, [area, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!area) return;
    if (!name.trim()) {
      toast.error(t('areaNameEmpty'));
      return;
    }

    try {
      await approveMutation.mutateAsync({
        id: area.id,
        input: {
          name: name.trim(),
          slug: slug.trim() || undefined
        }
      });
      toast.success(t('areaApproved', { name: name.trim() }));
      onOpenChange(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to approve area';
      toast.error(msg);
    }
  };

  if (!area) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <DialogHeader>
            <DialogTitle>{t('dialogApproveTitle', { name: area.name })}</DialogTitle>
            <DialogDescription>
              {t('dialogApproveDesc')}
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-3 text-sm'>
            <div className='space-y-1.5'>
              <Label htmlFor='approve-name'>{t('areaName')}</Label>
              <Input
                id='approve-name'
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('areaNamePlaceholder')}
                required
              />
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='approve-slug'>{t('slug')}</Label>
              <Input
                id='approve-slug'
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder={t('slugPlaceholder')}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type='button'
              variant='ghost'
              onClick={() => onOpenChange(false)}
              disabled={approveMutation.isPending}
            >
              {t('cancel')}
            </Button>
            <Button type='submit' disabled={approveMutation.isPending}>
              {approveMutation.isPending && <Spinner className='me-1.5 size-4' />}
              {t('approveAndPublish')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
