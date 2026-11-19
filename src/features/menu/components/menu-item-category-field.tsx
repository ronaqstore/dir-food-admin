'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { CategoryDialog } from '@/components/common/category-dialog';
import type { CategoryWithCount } from '@/features/categories/types';
import type { MenuItemCategoryFieldProps } from '../types';

export function MenuItemCategoryField({
  value,
  onChange,
  categories,
  disabled,
  error
}: MenuItemCategoryFieldProps) {
  const t = useTranslations();
  const [categoryDialogOpen, setCategoryDialogOpen] = React.useState(false);
  const [initialCategoryName, setInitialCategoryName] = React.useState('');

  const options = React.useMemo(() => {
    return categories?.map((cat) => ({ value: cat.id, label: cat.name })) ?? [];
  }, [categories]);

  const handleOpenAddCategory = (currentSearch: string) => {
    setInitialCategoryName(currentSearch);
    setCategoryDialogOpen(true);
  };

  const handleCategoryCreated = (newCategory: CategoryWithCount) => {
    onChange(newCategory.id);
  };

  const action = React.useMemo(
    () => ({
      label: t('menuCategories.newCategory'),
      onClick: handleOpenAddCategory
    }),
    [t]
  );

  return (
    <div className='space-y-1.5'>
      <Label htmlFor='item-category' className='text-xs font-semibold text-foreground'>
        {t('menuItems.category')}
        <span className='text-destructive ms-1'>*</span>
      </Label>
      <SearchableSelect
        id='item-category'
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={t('menuItems.selectCategory')}
        searchPlaceholder={t('menuItems.searchCategories') || 'Search...'}
        options={options}
        pageSize={20}
        required
        action={action}
      />
      {error ? <p className='text-xs text-destructive'>{error}</p> : null}
      <CategoryDialog
        open={categoryDialogOpen}
        onOpenChange={setCategoryDialogOpen}
        initialName={initialCategoryName}
        onSuccess={handleCategoryCreated}
      />
    </div>
  );
}
