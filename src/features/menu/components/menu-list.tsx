'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Spinner } from '@/components/ui/spinner';
import {
  IconPlus,
  IconPencil,
  IconSearch,
  IconPhoto,
  IconSalad,
  IconFolderPlus
} from '@tabler/icons-react';
import { formatPkr } from '@/lib/money';
import { useCategories } from '@/features/categories/api/categories-query';
import { useMenuItems, useUpdateMenuItem } from '../api/menu-query';
import { MenuItemDialog } from './menu-item-dialog';
import type { MenuItemDTO } from '../types';

export function MenuList() {
  const t = useTranslations();
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');
  const [search, setSearch] = React.useState('');
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<MenuItemDTO | null>(null);

  const { data: categories, isLoading: isCategoriesLoading } = useCategories();
  const {
    data: items,
    isLoading: isItemsLoading,
    error,
    refetch
  } = useMenuItems(selectedCategory !== 'all' ? { categoryId: selectedCategory } : undefined);

  const updateItem = useUpdateMenuItem();

  const handleOpenCreate = () => {
    setEditingItem(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (item: MenuItemDTO) => {
    setEditingItem(item);
    setDialogOpen(true);
  };

  const handleToggleAvailability = async (item: MenuItemDTO) => {
    try {
      await updateItem.mutateAsync({
        id: item.id,
        input: { isAvailable: !item.isAvailable }
      });
      toast.success(t('menuItems.statusToggleSuccess'));
    } catch (err) {
      const msg = err instanceof Error ? err.message : t('common.unexpectedError');
      toast.error(msg);
    }
  };

  const filteredItems = React.useMemo(() => {
    if (!items) return [];
    if (!search.trim()) return items;
    const lower = search.toLowerCase();
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(lower) ||
        (item.description && item.description.toLowerCase().includes(lower))
    );
  }, [items, search]);

  const hasNoCategories = !isCategoriesLoading && (!categories || categories.length === 0);

  if (isCategoriesLoading || isItemsLoading) {
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

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight text-foreground'>
            {t('menuItems.title')}
          </h1>
          <p className='text-sm text-muted-foreground'>{t('menuItems.description')}</p>
        </div>
        <div>
          <Button onClick={handleOpenCreate} disabled={hasNoCategories} className='gap-1.5'>
            <IconPlus className='size-4' />
            <span>{t('menuItems.newItem')}</span>
          </Button>
        </div>
      </div>

      {/* Warning if no categories */}
      {hasNoCategories ? (
        <div className='rounded-lg border border-amber-500/20 bg-amber-500/10 p-4 text-amber-800 dark:text-amber-300 flex items-center justify-between'>
          <p className='text-sm'>{t('menuItems.noCategoryWarning')}</p>
        </div>
      ) : null}

      {/* Filters: Search & Category tabs */}
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0'>
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            size='sm'
            onClick={() => setSelectedCategory('all')}
            className='rounded-full text-xs shrink-0'
          >
            {t('menuItems.filterByCategory')}
          </Button>
          {categories?.map((cat) => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? 'default' : 'outline'}
              size='sm'
              onClick={() => setSelectedCategory(cat.id)}
              className='rounded-full text-xs shrink-0'
            >
              {cat.name}
            </Button>
          ))}
        </div>

        <div className='relative w-full sm:w-64'>
          <IconSearch className='absolute start-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground' />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('menuItems.searchPlaceholder')}
            className='ps-9 h-9 text-sm'
          />
        </div>
      </div>

      {/* Menu items display */}
      {filteredItems.length === 0 ? (
        <div className='flex min-h-[320px] flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center animate-in fade-in-50'>
          <div className='flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary mb-4'>
            <IconSalad className='size-7' />
          </div>
          <h3 className='text-lg font-semibold text-foreground mb-1'>
            {t('menuItems.emptyTitle')}
          </h3>
          <p className='text-sm text-muted-foreground max-w-sm mb-5'>
            {t('menuItems.emptyDescription')}
          </p>
          <Button onClick={handleOpenCreate} disabled={hasNoCategories} className='gap-1.5'>
            <IconPlus className='size-4' />
            <span>{t('menuItems.newItem')}</span>
          </Button>
        </div>
      ) : (
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {filteredItems.map((item) => {
            const hasVariants = item.variants && item.variants.length > 0;
            const categoryName =
              item.category?.name || categories?.find((c) => c.id === item.categoryId)?.name;

            return (
              <div
                key={item.id}
                className='flex flex-col justify-between rounded-xl border bg-card p-4 shadow-xs hover:border-primary/40 transition-all'
              >
                <div>
                  <div className='flex gap-3 items-start mb-3'>
                    <div className='relative size-16 shrink-0 overflow-hidden rounded-lg border bg-muted'>
                      {item.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className='size-full object-cover'
                        />
                      ) : (
                        <div className='flex size-full items-center justify-center text-muted-foreground/40'>
                          <IconPhoto className='size-6' />
                        </div>
                      )}
                    </div>

                    <div className='min-w-0 flex-1'>
                      <div className='flex items-center gap-1.5 mb-1'>
                        {categoryName ? (
                          <Badge variant='outline' className='text-[10px] font-normal px-1.5 py-0'>
                            {categoryName}
                          </Badge>
                        ) : null}
                      </div>
                      <h4 className='font-semibold text-foreground text-sm truncate'>
                        {item.name}
                      </h4>
                      {item.description ? (
                        <p className='text-xs text-muted-foreground line-clamp-2 mt-0.5'>
                          {item.description}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  {/* Pricing info */}
                  <div className='mb-4'>
                    {hasVariants ? (
                      <div className='flex flex-wrap gap-1.5'>
                        {item.variants.map((v) => (
                          <Badge key={v.id} variant='secondary' className='text-xs font-medium'>
                            {v.name}: {formatPkr(v.price)}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className='text-base font-bold text-foreground'>
                        {item.basePrice != null ? formatPkr(item.basePrice) : 'Rs. 0'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer Actions: Availability switch & Edit button */}
                <div className='flex items-center justify-between border-t pt-3'>
                  <div className='flex items-center gap-2'>
                    <Switch
                      checked={item.isAvailable}
                      onCheckedChange={() => handleToggleAvailability(item)}
                      disabled={updateItem.isPending}
                      aria-label={item.name}
                    />
                    <span
                      className={`text-xs font-medium ${item.isAvailable ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}
                    >
                      {item.isAvailable ? t('menuItems.available') : t('menuItems.soldOut')}
                    </span>
                  </div>

                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => handleOpenEdit(item)}
                    className='h-8 gap-1.5 text-xs'
                  >
                    <IconPencil className='size-3.5' />
                    <span>{t('common.edit')}</span>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <MenuItemDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        item={editingItem}
        defaultCategoryId={selectedCategory !== 'all' ? selectedCategory : undefined}
      />
    </div>
  );
}
