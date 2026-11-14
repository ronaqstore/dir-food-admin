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
import { Textarea } from '@/components/ui/textarea';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { IconToolsKitchen2, IconPlus, IconCheck, IconX } from '@tabler/icons-react';
import { toPaisa, fromPaisa } from '@/lib/money';
import { useCategories } from '@/features/categories/api/categories-query';
import {
  useCreateMenuItem,
  useUpdateMenuItem,
  useUploadItemImage,
  useDeleteItemImage,
  useReplaceVariants,
  useReplaceAddons
} from '../api/menu-query';
import { MenuItemPricing } from './menu-item-pricing';
import { MenuItemImageField } from './menu-item-image-field';
import type {
  MenuItemDialogProps,
  VariantField,
  AddonField,
  PricingMode
} from '../types';

export function MenuItemDialog({
  open,
  onOpenChange,
  item,
  defaultCategoryId
}: MenuItemDialogProps) {
  const t = useTranslations();
  const { data: categories } = useCategories();

  const [categoryId, setCategoryId] = React.useState('');
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [pricingMode, setPricingMode] = React.useState<PricingMode>('fixed');
  const [basePrice, setBasePrice] = React.useState('');
  const [isDeal, setIsDeal] = React.useState(false);
  const [variants, setVariants] = React.useState<VariantField[]>([
    { name: 'Half', price: '' },
    { name: 'Full', price: '' }
  ]);
  const [addons, setAddons] = React.useState<AddonField[]>([]);
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const isEditing = Boolean(item);
  const createItem = useCreateMenuItem();
  const updateItem = useUpdateMenuItem();
  const uploadImage = useUploadItemImage();
  const deleteImage = useDeleteItemImage();
  const replaceVariants = useReplaceVariants();
  const replaceAddons = useReplaceAddons();

  React.useEffect(() => {
    if (item) {
      setCategoryId(item.categoryId);
      setName(item.name);
      setDescription(item.description || '');
      setImagePreview(item.imageUrl || null);
      setImageFile(null);

      if (item.variants && item.variants.length > 0) {
        setPricingMode('variants');
        setVariants(
          item.variants.map((v) => ({
            name: v.name,
            price: String(fromPaisa(v.price))
          }))
        );
        setBasePrice('');
      } else {
        setPricingMode('fixed');
        setBasePrice(item.basePrice != null ? String(fromPaisa(item.basePrice)) : '');
        setVariants([
          { name: 'Half', price: '' },
          { name: 'Full', price: '' }
        ]);
      }

      if (item.addons && item.addons.length > 0) {
        setAddons(
          item.addons.map((a) => ({
            name: a.name,
            price: String(fromPaisa(a.price))
          }))
        );
      } else {
        setAddons([]);
      }

      setIsDeal(Boolean(item.isDeal));
    } else {
      const initialCatId =
        defaultCategoryId || (categories && categories.length > 0 ? categories[0]?.id || '' : '');
      setCategoryId(initialCatId);
      setName('');
      setDescription('');
      setPricingMode('fixed');
      setBasePrice('');
      setIsDeal(false);
      setVariants([
        { name: 'Half', price: '' },
        { name: 'Full', price: '' }
      ]);
      setAddons([]);
      setImagePreview(null);
      setImageFile(null);
    }
    setErrors({});
  }, [item, defaultCategoryId, categories, open]);

  const handleFileSelect = (file: File) => {
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleAddVariant = () => {
    setVariants((prev) => [...prev, { name: '', price: '' }]);
  };

  const handleRemoveVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const handleVariantChange = (index: number, field: 'name' | 'price', value: string) => {
    setVariants((prev) => {
      const copy = [...prev];
      const target = copy[index];
      if (target) {
        copy[index] = { ...target, [field]: value };
      }
      return copy;
    });
  };

  const handleAddAddon = () => {
    setAddons((prev) => [...prev, { name: '', price: '' }]);
  };

  const handleRemoveAddon = (index: number) => {
    setAddons((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddonChange = (index: number, field: 'name' | 'price', value: string) => {
    setAddons((prev) => {
      const copy = [...prev];
      const target = copy[index];
      if (target) {
        copy[index] = { ...target, [field]: value };
      }
      return copy;
    });
  };

  const isPending =
    createItem.isPending ||
    updateItem.isPending ||
    uploadImage.isPending ||
    deleteImage.isPending ||
    replaceVariants.isPending ||
    replaceAddons.isPending;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!categoryId) {
      newErrors.categoryId = t('menuItems.selectCategory');
    }

    if (!name.trim() || name.trim().length < 2) {
      newErrors.name = t('validation.minLength', { min: 2 });
    }

    if (pricingMode === 'fixed') {
      const priceNum = Number(basePrice);
      if (!basePrice || isNaN(priceNum) || priceNum < 0) {
        newErrors.basePrice = t('validation.required');
      }
    } else {
      if (variants.length === 0) {
        newErrors.variants = 'At least one variant is required';
      } else {
        const invalidVariant = variants.some(
          (v) => !v.name.trim() || isNaN(Number(v.price)) || Number(v.price) < 0
        );
        if (invalidVariant) {
          newErrors.variants = 'All variants must have a name and non-negative price';
        }
      }
    }

    if (addons.length > 0) {
      const invalidAddon = addons.some(
        (a) => !a.name.trim() || isNaN(Number(a.price)) || Number(a.price) < 0
      );
      if (invalidAddon) {
        newErrors.addons = 'All extras must have a name and non-negative price';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      let savedItemId = item?.id;

      if (isEditing && item) {
        await updateItem.mutateAsync({
          id: item.id,
          input: {
            categoryId,
            name: name.trim(),
            description: description.trim() || undefined,
            basePrice: pricingMode === 'fixed' ? toPaisa(Number(basePrice)) : null,
            originalPrice: null,
            isDeal
          }
        });

        if (pricingMode === 'variants') {
          await replaceVariants.mutateAsync({
            id: item.id,
            input: {
              variants: variants.map((v) => ({
                name: v.name.trim(),
                price: toPaisa(Number(v.price))
              }))
            }
          });
        }

        await replaceAddons.mutateAsync({
          id: item.id,
          input: {
            addons: addons.map((a) => ({
              name: a.name.trim(),
              price: toPaisa(Number(a.price))
            }))
          }
        });

        toast.success(t('menuItems.updateSuccess'));
      } else {
        const created = await createItem.mutateAsync({
          categoryId,
          name: name.trim(),
          description: description.trim() || undefined,
          basePrice: pricingMode === 'fixed' ? toPaisa(Number(basePrice)) : undefined,
          isDeal,
          variants:
            pricingMode === 'variants'
              ? variants.map((v) => ({
                  name: v.name.trim(),
                  price: toPaisa(Number(v.price))
                }))
              : undefined,
          addons:
            addons.length > 0
              ? addons.map((a) => ({
                  name: a.name.trim(),
                  price: toPaisa(Number(a.price))
                }))
              : undefined
        });
        savedItemId = created.id;
        toast.success(t('menuItems.createSuccess'));
      }

      if (savedItemId && imageFile) {
        await uploadImage.mutateAsync({
          id: savedItemId,
          file: imageFile
        });
        toast.success(t('menuItems.imageUploadSuccess'));
      }

      onOpenChange(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : t('common.unexpectedError');
      toast.error(msg);
    }
  };

  const handleRemovePhoto = async () => {
    if (isEditing && item?.imageUrl) {
      try {
        await deleteImage.mutateAsync(item.id);
        setImagePreview(null);
        setImageFile(null);
        toast.success(t('menuItems.deleteSuccess'));
      } catch (err) {
        const msg = err instanceof Error ? err.message : t('common.unexpectedError');
        toast.error(msg);
      }
    } else {
      setImagePreview(null);
      setImageFile(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-xl max-h-[90vh] overflow-y-auto p-6'>
        <form onSubmit={handleSubmit} className='space-y-5'>
          <DialogHeader className='flex flex-row items-center gap-3.5 space-y-0 pb-3 border-b border-border/60'>
            <div className='flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary'>
              <IconToolsKitchen2 className='size-5' />
            </div>
            <div className='min-w-0 flex-1'>
              <DialogTitle className='text-lg font-bold text-foreground'>
                {isEditing ? t('menuItems.editItem') : t('menuItems.newItem')}
              </DialogTitle>
              <DialogDescription className='sr-only'>
                {t('menuItems.description')}
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className='space-y-4 pt-1'>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3.5'>
              <div className='space-y-1.5'>
                <Label htmlFor='item-name' className='text-xs font-semibold text-foreground'>
                  {t('menuItems.name')}
                  <span className='text-destructive ms-1'>*</span>
                </Label>
                <Input
                  id='item-name'
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('menuItems.namePlaceholder')}
                  disabled={isPending}
                  className={`h-10 rounded-xl text-sm ${errors.name ? 'border-destructive' : ''}`}
                />
                {errors.name ? <p className='text-xs text-destructive'>{errors.name}</p> : null}
              </div>

              <div className='space-y-1.5'>
                <Label htmlFor='item-category' className='text-xs font-semibold text-foreground'>
                  {t('menuItems.category')}
                  <span className='text-destructive ms-1'>*</span>
                </Label>
                <SearchableSelect
                  id='item-category'
                  value={categoryId}
                  onChange={setCategoryId}
                  disabled={isPending}
                  placeholder={t('menuItems.selectCategory')}
                  searchPlaceholder='Search categories...'
                  options={categories?.map((cat) => ({ value: cat.id, label: cat.name })) ?? []}
                  pageSize={20}
                  required
                />
                {errors.categoryId ? (
                  <p className='text-xs text-destructive'>{errors.categoryId}</p>
                ) : null}
              </div>
            </div>

            <div className='space-y-1.5'>
              <div className='flex items-center justify-between'>
                <Label htmlFor='item-description' className='text-xs font-semibold text-foreground'>
                  {t('menuItems.descriptionLabel')}
                </Label>
                <span className='text-[11px] text-muted-foreground'>{t('common.optional')}</span>
              </div>
              <Textarea
                id='item-description'
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('menuItems.descriptionPlaceholder')}
                rows={2}
                disabled={isPending}
                className='rounded-xl resize-none text-xs leading-relaxed'
              />
            </div>

            <MenuItemImageField
              imagePreview={imagePreview}
              name={name}
              isPending={isPending}
              onFileSelect={handleFileSelect}
              onRemovePhoto={handleRemovePhoto}
              t={t}
            />

            <MenuItemPricing
              pricingMode={pricingMode}
              onPricingModeChange={setPricingMode}
              basePrice={basePrice}
              onBasePriceChange={setBasePrice}
              variants={variants}
              onAddVariant={handleAddVariant}
              onRemoveVariant={handleRemoveVariant}
              onVariantChange={handleVariantChange}
              addons={addons}
              onAddAddon={handleAddAddon}
              onRemoveAddon={handleRemoveAddon}
              onAddonChange={handleAddonChange}
              errors={errors}
              isPending={isPending}
              t={t}
            />
          </div>

          <DialogFooter className='gap-2 sm:gap-2 pt-3 border-t border-border/60'>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className='h-10 gap-1.5 rounded-xl px-4 text-xs font-semibold'
            >
              <IconX className='size-4' />
              <span>{t('common.cancel')}</span>
            </Button>
            <Button
              type='submit'
              disabled={isPending}
              className='h-10 gap-1.5 rounded-xl px-5 text-xs font-semibold shadow-xs'
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
