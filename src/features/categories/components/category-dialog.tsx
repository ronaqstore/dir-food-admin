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
import { useCreateCategory, useUpdateCategory } from '../api/categories-query';
import type { CategoryWithCount } from '../types';

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: CategoryWithCount | null;
}

export function CategoryDialog({ open, onOpenChange, category }: CategoryDialogProps) {
  const t = useTranslations();
  const [name, setName] = React.useState('');
  const [isActive, setIsActive] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const isEditing = Boolean(category);
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();

  React.useEffect(() => {
    if (category) {
      setName(category.name);
      setIsActive(category.isActive);
    } else {
      setName('');
      setIsActive(true);
    }
    setError(null);
  }, [category, open]);

  const isPending = createCategory.isPending || updateCategory.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();

    if (trimmed.length < 2) {
      setError(t('validation.minLength', { min: 2 }));
      return;
    }

    if (trimmed.length > 60) {
      setError(t('validation.maxLength', { max: 60 }));
      return;
    }

    setError(null);

    try {
      if (isEditing && category) {
        await updateCategory.mutateAsync({
          id: category.id,
          input: {
            name: trimmed,
            isActive
          }
        });
        toast.success(t('menuCategories.updateSuccess'));
      } else {
        await createCategory.mutateAsync({
          name: trimmed
        });
        toast.success(t('menuCategories.createSuccess'));
      }
      onOpenChange(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : t('common.unexpectedError');
      toast.error(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? t('menuCategories.editCategory') : t('menuCategories.newCategory')}
            </DialogTitle>
            <DialogDescription>{t('menuCategories.description')}</DialogDescription>
          </DialogHeader>

          <div className='space-y-3 py-2'>
            <div className='space-y-1.5'>
              <Label htmlFor='category-name'>
                {t('menuCategories.name')}
                <span className='text-destructive ms-1'>*</span>
              </Label>
              <Input
                id='category-name'
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError(null);
                }}
                placeholder={t('menuCategories.namePlaceholder')}
                disabled={isPending}
                autoFocus
                className={error ? 'border-destructive focus-visible:ring-destructive' : ''}
              />
              {error ? <p className='text-xs text-destructive'>{error}</p> : null}
            </div>

            {isEditing ? (
              <div className='flex items-center justify-between rounded-lg border p-3'>
                <div className='space-y-0.5'>
                  <Label htmlFor='category-active' className='text-sm font-medium'>
                    {t('menuCategories.status')}
                  </Label>
                  <p className='text-xs text-muted-foreground'>
                    {isActive ? t('menuCategories.active') : t('menuCategories.inactive')}
                  </p>
                </div>
                <Switch
                  id='category-active'
                  checked={isActive}
                  onCheckedChange={setIsActive}
                  disabled={isPending}
                />
              </div>
            ) : null}
          </div>

          <DialogFooter className='gap-2 sm:gap-0'>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              {t('common.cancel')}
            </Button>
            <Button type='submit' disabled={isPending || !name.trim()}>
              {isPending ? (
                <>
                  <Spinner className='me-2 size-4' aria-hidden />
                  {t('common.saving')}
                </>
              ) : (
                t('common.save')
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
