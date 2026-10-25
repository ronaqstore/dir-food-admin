'use client';

import * as React from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { useMergeMasterArea } from '../api/platform-query';
import type { MasterArea } from '../types';

interface MergeAreaDialogProps {
  sourceArea: MasterArea | null;
  allAreas: MasterArea[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MergeAreaDialog({
  sourceArea,
  allAreas,
  open,
  onOpenChange
}: MergeAreaDialogProps) {
  const mergeMutation = useMergeMasterArea();
  const [targetAreaId, setTargetAreaId] = React.useState('');

  // Available target areas: in the same district/city (or all if not scoped), verified, excluding sourceArea
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
      toast.error('Please select a target canonical area to merge into');
      return;
    }

    const targetArea = allAreas.find((a) => a.id === targetAreaId);

    try {
      await mergeMutation.mutateAsync({
        sourceAreaId: sourceArea.id,
        targetAreaId
      });
      toast.success(
        `Merged "${sourceArea.name}" into "${targetArea?.name || 'canonical area'}". Future entries will auto-alias!`
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
            <DialogTitle>Merge Area: &ldquo;{sourceArea.name}&rdquo;</DialogTitle>
            <DialogDescription>
              Merge this duplicate or misspelled area into a verified standard area.
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-4 text-sm'>
            <div className='rounded-lg bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50'>
              <p className='font-semibold mb-1'>What happens during merge:</p>
              <ul className='list-disc pl-4 space-y-0.5'>
                <li>
                  Any restaurant delivery links will be re-pointed to the selected canonical area.
                </li>
                <li>
                  <strong>&ldquo;{sourceArea.name}&rdquo;</strong> will be saved as a permanent alias.
                  If any restaurant enters this name in the future, our system will automatically map it to the canonical area!
                </li>
                <li>The duplicate entry will be safely removed.</li>
              </ul>
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='target-area'>Select Canonical (Target) Area *</Label>
              {candidateTargetAreas.length === 0 ? (
                <p className='text-xs text-destructive'>
                  No other verified areas available in this district to merge into.
                </p>
              ) : (
                <Select value={targetAreaId} onValueChange={(val) => setTargetAreaId(val || '')}>
                  <SelectTrigger id='target-area' className='w-full'>
                    <SelectValue placeholder='Select destination area...' />
                  </SelectTrigger>
                  <SelectContent>
                    {candidateTargetAreas.map((area) => (
                      <SelectItem key={area.id} value={area.id}>
                        {area.name} <span className='text-muted-foreground'>({area.cityName || 'Area'})</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              Cancel
            </Button>
            <Button
              type='submit'
              disabled={mergeMutation.isPending || !targetAreaId || candidateTargetAreas.length === 0}
            >
              {mergeMutation.isPending && <Spinner className='mr-1.5 size-4' />}
              Confirm Merge
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
