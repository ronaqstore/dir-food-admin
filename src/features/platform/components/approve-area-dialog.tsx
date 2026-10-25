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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { useApproveMasterArea } from '../api/platform-query';
import type { MasterArea } from '../types';

interface ApproveAreaDialogProps {
  area: MasterArea | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ApproveAreaDialog({
  area,
  open,
  onOpenChange
}: ApproveAreaDialogProps) {
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
      toast.error('Area name cannot be empty');
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
      toast.success(`Area "${name.trim()}" approved and published to storefront!`);
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
            <DialogTitle>Approve Area: &ldquo;{area.name}&rdquo;</DialogTitle>
            <DialogDescription>
              Verify this area and publish it to the customer storefront discovery. You can clean up the spelling or slug before approving.
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-3 text-sm'>
            <div className='space-y-1.5'>
              <Label htmlFor='approve-name'>Area Name *</Label>
              <Input
                id='approve-name'
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder='e.g. Fizagat'
                required
              />
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='approve-slug'>URL Slug (optional)</Label>
              <Input
                id='approve-slug'
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder='e.g. fizagat'
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
              Cancel
            </Button>
            <Button type='submit' disabled={approveMutation.isPending}>
              {approveMutation.isPending && <Spinner className='mr-1.5 size-4' />}
              Approve & Publish
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

