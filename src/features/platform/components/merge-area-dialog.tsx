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
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Spinner } from '@/components/ui/spinner';
import { useMergeMasterArea } from '../api/platform-query';
import type { MergeAreaDialogProps } from '../types';

export function MergeAreaDialog({
  sourceArea,
  allAreas,
  open,
  onOpenChange
}: MergeAreaDialogProps) {
  const t = useTranslations('platformAreas');
  const mergeMutation = useMergeMasterArea();
  const [targetAreaId, setTargetAreaId] = React.useState('');

  const candidateTargetAreas = React.useMemo(() => {
    if (!sourceArea) return [];
    return allAreas.filter((a) => {
      if (a.id === sourceArea.id) return false;
      if (sourceArea.cityId && a.cityId && a.cityId !== sourceArea.cityId) return false;
      return a.isVerified !== false;
    });
  }, [allAreas, sourceArea]);

  React.useEffect(() => {
    if (open) {
      setTargetAreaId(candidateTargetAreas[0]?.id || '');
    } else {
      setTargetAreaId('');
    }
  }, [open, candidateTargetAreas]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceArea) return;
    if (!targetAreaId) {
      toast.error(t('selectTargetAreaPrompt'));
      return;
    }

    const targetArea = allAreas.find((a) => a.id === targetAreaId);

    try {
      await mergeMutation.mutateAsync({
        sourceAreaId: sourceArea.id,
        targetAreaId
      });
      toast.success(
        t('mergeSuccess', {
          from: sourceArea.name,
          to: targetArea?.name || 'canonical area'
        })
      );
      onOpenChange(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to merge area';
      toast.error(msg);
    }
  };

  if (!sourceArea) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <DialogHeader>
            <DialogTitle>{t('dialogMergeTitle', { name: sourceArea.name })}</DialogTitle>
            <DialogDescription>
              {t('dialogMergeDesc')}
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-4 text-sm'>
            <div className='rounded-lg bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50'>
              <p className='font-semibold mb-1'>{t('mergeWhatHappens')}</p>
              <ul className='list-disc ps-4 space-y-0.5'>
                <li>
                  {t('mergeStep1')}
                </li>
                <li>
                  <strong>&ldquo;{sourceArea.name}&rdquo;</strong> {t('mergeStep2')}
                </li>
                <li>{t('mergeStep3')}</li>
              </ul>
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='target-area'>{t('selectCanonicalArea')}</Label>
              {candidateTargetAreas.length === 0 ? (
                <p className='text-xs text-destructive'>
                  {t('noOtherVerifiedAreas')}
                </p>
              ) : (
                <SearchableSelect
                  id='target-area'
                  value={targetAreaId}
                  onChange={setTargetAreaId}
                  placeholder={t('selectDestinationArea')}
                  searchPlaceholder={t('searchPlaceholder')}
                  options={candidateTargetAreas.map((area) => ({
                    value: area.id,
                    label: area.name,
                    sublabel: area.cityName || 'Area'
                  }))}
                  pageSize={20}
                  required
                />
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type='button'
              variant='ghost'
              onClick={() => onOpenChange(false)}
              disabled={mergeMutation.isPending}
            >
              {t('cancel')}
            </Button>
            <Button
              type='submit'
              disabled={mergeMutation.isPending || !targetAreaId || candidateTargetAreas.length === 0}
            >
              {mergeMutation.isPending && <Spinner className='me-1.5 size-4' />}
              {t('confirmMerge')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
