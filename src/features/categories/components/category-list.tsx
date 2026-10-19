'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Spinner } from '@/components/ui/spinner';
import { Icons } from '@/components/icons';
import {
  IconPlus,
  IconPencil,
  IconChevronUp,
  IconChevronDown,
  IconFolder,
  IconArrowsSort
} from '@tabler/icons-react';
import { useCategories, useUpdateCategory, useReorderCategories } from '../api/categories-query';
import { CategoryDialog } from './category-dialog';
import type { CategoryWithCount } from '../types';

export function CategoryList() {
  const t = useTranslations();
  const { data: categories, isLoading, error, refetch } = useCategories();
  const updateCategory = useUpdateCategory();
  const reorderCategories = useReorderCategories();

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = React.useState<CategoryWithCount | null>(null);
  const [isReordering, setIsReordering] = React.useState(false);

  const handleOpenCreate = () => {
    setSelectedCategory(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (category: CategoryWithCount) => {
    setSelectedCategory(category);
    setDialogOpen(true);
  };

  const handleToggleActive = async (category: CategoryWithCount) => {
    try {
      await updateCategory.mutateAsync({
        id: category.id,
        input: { isActive: !category.isActive }
      });
      toast.success(t('menuCategories.updateSuccess'));
    } catch (err) {
      const msg = err instanceof Error ? err.message : t('common.unexpectedError');
      toast.error(msg);
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    if (!categories) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= categories.length) return;

    const reordered = [...categories];
    const [moved] = reordered.splice(index, 1);
    if (!moved) return;
    reordered.splice(targetIndex, 0, moved);

    try {
      setIsReordering(true);
      await reorderCategories.mutateAsync({
        ids: reordered.map((c) => c.id)
      });
      toast.success(t('menuCategories.saveOrder'));
    } catch (err) {
      const msg = err instanceof Error ? err.message : t('common.unexpectedError');
      toast.error(msg);
    } finally {
      setIsReordering(false);
    }
  };

  if (isLoading) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <Spinner className='size-8 text-primary' />
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex h-64 flex-col items-center justify-center gap-3 text-center'>
        <p className='text-sm text-destructive font-medium'>
          {error instanceof Error ? error.message : t('common.unexpectedError')}
        </p>
        <Button variant='outline' size='sm' onClick={() => refetch()}>
          {t('common.tryAgain')}
        </Button>
      </div>
    );
  }

  const items = categories ?? [];

  return (
    <div className='space-y-6'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight text-foreground'>
            {t('menuCategories.title')}
          </h1>
          <p className='text-sm text-muted-foreground'>{t('menuCategories.description')}</p>
        </div>
        <div className='flex items-center gap-2'>
          <Button onClick={handleOpenCreate} className='gap-1.5'>
            <IconPlus className='size-4' />
            <span>{t('menuCategories.newCategory')}</span>
          </Button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className='flex min-h-[320px] flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center animate-in fade-in-50'>
          <div className='flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary mb-4'>
            <IconFolder className='size-7' />
          </div>
          <h3 className='text-lg font-semibold text-foreground mb-1'>
            {t('menuCategories.emptyTitle')}
          </h3>
          <p className='text-sm text-muted-foreground max-w-sm mb-5'>
            {t('menuCategories.emptyDescription')}
          </p>
          <Button onClick={handleOpenCreate} className='gap-1.5'>
            <IconPlus className='size-4' />
            <span>{t('menuCategories.newCategory')}</span>
          </Button>
        </div>
      ) : (
        <div className='overflow-hidden rounded-xl border bg-card shadow-xs'>
          <div className='divide-y divide-border'>
            {items.map((cat, index) => (
              <div
                key={cat.id}
                className='flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between hover:bg-muted/40 transition-colors'
              >
                <div className='flex items-center gap-3 min-w-0'>
                  <div className='flex flex-col gap-0.5'>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-6 w-6 text-muted-foreground hover:text-foreground'
                      disabled={index === 0 || isReordering}
                      onClick={() => handleMove(index, 'up')}
                      aria-label='Move category up'
                    >
                      <IconChevronUp className='size-4' />
                    </Button>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-6 w-6 text-muted-foreground hover:text-foreground'
                      disabled={index === items.length - 1 || isReordering}
                      onClick={() => handleMove(index, 'down')}
                      aria-label='Move category down'
                    >
                      <IconChevronDown className='size-4' />
                    </Button>
                  </div>

                  <div className='flex items-center gap-2.5 truncate'>
                    <span className='font-mono text-xs text-muted-foreground/70 w-5 text-center'>
                      {index + 1}
                    </span>
                    <span className='font-semibold text-foreground truncate'>{cat.name}</span>
                  </div>
                </div>

                <div className='flex items-center justify-between sm:justify-end gap-4'>
                  <div className='flex items-center gap-2'>
                    <Badge variant='secondary' className='text-xs font-normal'>
                      {cat['_count']?.items ?? 0} {t('menuCategories.itemsCount')}
                    </Badge>
                    <Badge
                      variant={cat.isActive ? 'default' : 'outline'}
                      className={
                        cat.isActive
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                          : 'text-muted-foreground'
                      }
                    >
                      {cat.isActive ? t('menuCategories.active') : t('menuCategories.inactive')}
                    </Badge>
                  </div>

                  <div className='flex items-center gap-2'>
                    <Switch
                      checked={cat.isActive}
                      onCheckedChange={() => handleToggleActive(cat)}
                      disabled={updateCategory.isPending}
                      aria-label={cat.name}
                    />
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => handleOpenEdit(cat)}
                      className='gap-1.5'
                    >
                      <IconPencil className='size-3.5' />
                      <span className='hidden sm:inline'>{t('common.edit')}</span>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <CategoryDialog open={dialogOpen} onOpenChange={setDialogOpen} category={selectedCategory} />
    </div>
  );
}
