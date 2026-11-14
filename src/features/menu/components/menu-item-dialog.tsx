'use client';

import * as React from 'react';
import Image from 'next/image';
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
import { Spinner } from '@/components/ui/spinner';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { IconPhoto, IconUpload } from '@tabler/icons-react';
import { toPaisa, fromPaisa } from '@/lib/money';
import { useCategories } from '@/features/categories/api/categories-query';
import {
  useCreateMenuItem,
  useUpdateMenuItem,
  useUploadItemImage,
  useDeleteItemImage,
  useReplaceVariants
} from '../api/menu-query';
import { MenuItemPricing } from './menu-item-pricing';
import type {
  MenuItemDialogProps,
  VariantField,
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
  const [originalPrice, setOriginalPrice] = React.useState('');
  const [isDeal, setIsDeal] = React.useState(false);
  const [variants, setVariants] = React.useState<VariantField[]>([
    { name: 'Half', price: '' },
    { name: 'Full', price: '' }
  ]);
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const isEditing = Boolean(item);
  const createItem = useCreateMenuItem();
  const updateItem = useUpdateMenuItem();
  const uploadImage = useUploadItemImage();
  const deleteImage = useDeleteItemImage();
  const replaceVariants = useReplaceVariants();

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
        setOriginalPrice('');
      } else {
        setPricingMode('fixed');
        setBasePrice(item.basePrice != null ? String(fromPaisa(item.basePrice)) : '');
        setOriginalPrice(item.originalPrice != null ? String(fromPaisa(item.originalPrice)) : '');
        setVariants([
          { name: 'Half', price: '' },
          { name: 'Full', price: '' }
        ]);
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
      setOriginalPrice('');
      setIsDeal(false);
      setVariants([
        { name: 'Half', price: '' },
        { name: 'Full', price: '' }
      ]);
      setImagePreview(null);
      setImageFile(null);
    }
    setErrors({});
  }, [item, defaultCategoryId, categories, open]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      toast.error(t('menuItems.imageSizeLimit'));
      return;
    }

    setImageFile(file);
    const objectUrl = URL.createObjectURL(file);
    setImagePreview(objectUrl);
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

  const isPending =
    createItem.isPending ||
    updateItem.isPending ||
    uploadImage.isPending ||
    deleteImage.isPending ||
    replaceVariants.isPending;

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

      if (originalPrice) {
        const origNum = Number(originalPrice);
        if (isNaN(origNum) || origNum < 0) {
          newErrors.originalPrice = 'Invalid original price';
        } else if (!isNaN(priceNum) && priceNum >= 0 && origNum <= priceNum) {
          newErrors.originalPrice = 'Original price must be greater than selling price';
        }
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
            originalPrice:
              pricingMode === 'fixed' && originalPrice ? toPaisa(Number(originalPrice)) : null,
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
        toast.success(t('menuItems.updateSuccess'));
      } else {
        const created = await createItem.mutateAsync({
          categoryId,
          name: name.trim(),
          description: description.trim() || undefined,
          basePrice: pricingMode === 'fixed' ? toPaisa(Number(basePrice)) : undefined,
          originalPrice:
            pricingMode === 'fixed' && originalPrice ? toPaisa(Number(originalPrice)) : undefined,
          isDeal,
          variants:
            pricingMode === 'variants'
              ? variants.map((v) => ({
                  name: v.name.trim(),
                  price: toPaisa(Number(v.price))
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
      <DialogContent className='sm:max-w-xl max-h-[90vh] overflow-y-auto'>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? t('menuItems.editItem') : t('menuItems.newItem')}
            </DialogTitle>
            <DialogDescription>{t('menuItems.description')}</DialogDescription>
          </DialogHeader>

          <div className='space-y-4 py-2'>
            {}
            <div className='space-y-1.5'>
              <Label htmlFor='item-category'>
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
                options={
                  categories?.map((cat) => ({
                    value: cat.id,
                    label: cat.name
                  })) ?? []
                }
                pageSize={20}
                required
              />
              {errors.categoryId ? (
                <p className='text-xs text-destructive'>{errors.categoryId}</p>
              ) : null}
            </div>

            {}
            <div className='space-y-1.5'>
              <Label htmlFor='item-name'>
                {t('menuItems.name')}
                <span className='text-destructive ms-1'>*</span>
              </Label>
              <Input
                id='item-name'
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('menuItems.namePlaceholder')}
                disabled={isPending}
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name ? <p className='text-xs text-destructive'>{errors.name}</p> : null}
            </div>

            {}
            <div className='space-y-1.5'>
              <Label htmlFor='item-description'>{t('menuItems.descriptionLabel')}</Label>
              <Textarea
                id='item-description'
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('menuItems.descriptionPlaceholder')}
                rows={2}
                disabled={isPending}
              />
            </div>

            {}
            <div className='space-y-1.5'>
              <Label>{t('menuItems.image')}</Label>
              <input
                ref={fileInputRef}
                type='file'
                accept='image/jpeg,image/png,image/webp'
                className='hidden'
                onChange={handleFileChange}
              />
              <div className='flex items-center gap-4'>
                <div className='relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted'>
                  {imagePreview ? (
                    <Image
                      src={imagePreview}
                      alt={name || t('menuItems.previewAlt')}
                      fill
                      unoptimized
                      className='object-cover'
                    />
                  ) : (
                    <IconPhoto className='size-8 text-muted-foreground/40' />
                  )}
                </div>
                <div className='flex flex-wrap gap-2'>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isPending}
                    className='gap-1.5'
                  >
                    <IconUpload className='size-3.5' />
                    <span>
                      {imagePreview ? t('menuItems.changeImage') : t('menuItems.uploadImage')}
                    </span>
                  </Button>
                  {imagePreview ? (
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      onClick={handleRemovePhoto}
                      disabled={isPending}
                      className='text-destructive hover:text-destructive'
                    >
                      {t('menuItems.removeImage')}
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>

            {}
            <MenuItemPricing
              pricingMode={pricingMode}
              onPricingModeChange={setPricingMode}
              basePrice={basePrice}
              onBasePriceChange={setBasePrice}
              originalPrice={originalPrice}
              onOriginalPriceChange={setOriginalPrice}
              variants={variants}
              onAddVariant={handleAddVariant}
              onRemoveVariant={handleRemoveVariant}
              onVariantChange={handleVariantChange}
              errors={errors}
              isPending={isPending}
              t={t}
            />
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
            <Button type='submit' disabled={isPending}>
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
