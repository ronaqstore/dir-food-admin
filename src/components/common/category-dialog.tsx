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
import { useCreateCategory, useUpdateCategory } from '@/features/categories/api/categories-query';
import { DEFAULT_CATEGORY_PRESETS, type CategoryDialogProps } from '@/features/categories/types';

export function CategoryDialog({
  open,
  onOpenChange,
  category,
  initialName,
  onSuccess
}: CategoryDialogProps) {
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
      setName(initialName || '');
      setIsActive(true);
    }
    setError(null);
  }, [category, initialName, open]);

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
        const updated = await updateCategory.mutateAsync({
          id: category.id,
          input: {
            name: trimmed,
            isActive
          }
        });
        toast.success(t('menuCategories.updateSuccess'));
        onSuccess?.(updated);
      } else {
        const created = await createCategory.mutateAsync({
          name: trimmed
        });
        toast.success(t('menuCategories.createSuccess'));
        onSuccess?.(created);
      }
      onOpenChange(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : t('common.unexpectedError');
      toast.error(message);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    if (error) setError(null);
  };

  const handleSelectPreset = (preset: string) => {
    setName(preset);
    if (error) setError(null);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md z-[70]' overlayClassName='z-[69]'>
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
                onChange={handleNameChange}
                placeholder={t('menuCategories.namePlaceholder')}
                disabled={isPending}
                autoFocus
                className={error ? 'border-destructive focus-visible:ring-destructive' : ''}
              />
              {error ? <p className='text-xs text-destructive'>{error}</p> : null}
            </div>

            {!isEditing ? (
              <div className='space-y-1.5 pt-1'>
                <div className='flex items-center justify-between'>
                  <Label className='text-xs font-semibold text-muted-foreground'>
                    {t('menuCategories.presetsLabel')}
                  </Label>
                  <span className='text-[10px] text-muted-foreground'>
                    {t('menuCategories.presetsHint')}
                  </span>
                </div>
                <div className='flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 rounded-lg border bg-muted/20'>
                  {DEFAULT_CATEGORY_PRESETS.map((preset) => {
                    const isSelected = name.trim().toLowerCase() === preset.toLowerCase();
                    return (
                      <button
                        key={preset}
                        type='button'
                        disabled={isPending}
                        onClick={() => handleSelectPreset(preset)}
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                            : 'border border-border/70 bg-background text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                      >
                        {preset}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

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

          <DialogFooter className='gap-2 sm:gap-2 pt-3 border-t border-border/60'>
            <Button
              type='button'
              variant='outline'
              onClick={handleCancel}
              disabled={isPending}
              className='h-9 gap-1.5 rounded-lg px-4 text-xs font-semibold'
            >
              <IconX className='size-4' />
              <span>{t('common.cancel')}</span>
            </Button>
            <Button
              type='submit'
              disabled={isPending || !name.trim()}
              className='h-9 gap-1.5 rounded-lg px-5 text-xs font-semibold shadow-xs'
            >
              {isEditing ? (
                <>
                  <IconCheck className='size-4' />
                  <span>{t('common.save')}</span>
                </>
              ) : (
                <>
                  <IconPlus className='size-4' />
                  <span>{t('common.add')}</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
