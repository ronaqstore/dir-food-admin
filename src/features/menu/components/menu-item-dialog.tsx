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
import { Spinner } from '@/components/ui/spinner';
import { IconPlus, IconTrash, IconPhoto, IconUpload } from '@tabler/icons-react';
import { toPaisa, fromPaisa } from '@/lib/money';
import { useCategories } from '@/features/categories/api/categories-query';
import {
  useCreateMenuItem,
  useUpdateMenuItem,
  useUploadItemImage,
  useDeleteItemImage,
  useReplaceVariants
} from '../api/menu-query';
import type { MenuItemDTO } from '../types';

interface MenuItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: MenuItemDTO | null;
  defaultCategoryId?: string;
}

interface VariantField {
  name: string;
  price: string;
}

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
  const [pricingMode, setPricingMode] = React.useState<'fixed' | 'variants'>('fixed');
  const [basePrice, setBasePrice] = React.useState('');
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
      } else {
        setPricingMode('fixed');
        setBasePrice(item.basePrice != null ? String(fromPaisa(item.basePrice)) : '');
        setVariants([
          { name: 'Half', price: '' },
          { name: 'Full', price: '' }
        ]);
      }
    } else {
      const initialCatId =
        defaultCategoryId || (categories && categories.length > 0 ? categories[0]?.id || '' : '');
      setCategoryId(initialCatId);
      setName('');
      setDescription('');
      setPricingMode('fixed');
      setBasePrice('');
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
      toast.error('Image size must be less than 3MB');
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
            basePrice: pricingMode === 'fixed' ? toPaisa(Number(basePrice)) : null
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
            {/* Category selection */}
            <div className='space-y-1.5'>
              <Label htmlFor='item-category'>
                {t('menuItems.category')}
                <span className='text-destructive ms-1'>*</span>
              </Label>
              <select
                id='item-category'
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                disabled={isPending}
                className='w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus:border-ring focus:outline-hidden focus:ring-1 focus:ring-ring'
              >
                <option value='' disabled>
                  {t('menuItems.selectCategory')}
                </option>
                {categories?.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.categoryId ? (
                <p className='text-xs text-destructive'>{errors.categoryId}</p>
              ) : null}
            </div>

            {/* Dish name */}
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

            {/* Description */}
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

            {/* Image upload */}
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
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={imagePreview}
                      alt={name || 'Preview'}
                      className='size-full object-cover'
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

            {/* Pricing mode selector */}
            <div className='space-y-2 pt-1'>
              <Label>{t('menuItems.pricingType')}</Label>
              <div className='grid grid-cols-2 gap-2'>
                <button
                  type='button'
                  onClick={() => setPricingMode('fixed')}
                  className={`rounded-lg border p-3 text-start transition-all cursor-pointer ${
                    pricingMode === 'fixed'
                      ? 'border-primary bg-primary/5 ring-1 ring-primary'
                      : 'border-border hover:bg-muted/50'
                  }`}
                >
                  <p className='text-sm font-semibold'>{t('menuItems.fixedPrice')}</p>
                  <p className='text-xs text-muted-foreground mt-0.5'>Single standard price</p>
                </button>
                <button
                  type='button'
                  onClick={() => setPricingMode('variants')}
                  className={`rounded-lg border p-3 text-start transition-all cursor-pointer ${
                    pricingMode === 'variants'
                      ? 'border-primary bg-primary/5 ring-1 ring-primary'
                      : 'border-border hover:bg-muted/50'
                  }`}
                >
                  <p className='text-sm font-semibold'>{t('menuItems.hasVariants')}</p>
                  <p className='text-xs text-muted-foreground mt-0.5'>e.g., Half / Full</p>
                </button>
              </div>
            </div>

            {/* Price inputs */}
            {pricingMode === 'fixed' ? (
              <div className='space-y-1.5'>
                <Label htmlFor='base-price'>
                  {t('menuItems.price')}
                  <span className='text-destructive ms-1'>*</span>
                </Label>
                <div className='relative'>
                  <span className='absolute start-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium'>
                    Rs.
                  </span>
                  <Input
                    id='base-price'
                    type='number'
                    min='0'
                    step='1'
                    value={basePrice}
                    onChange={(e) => setBasePrice(e.target.value)}
                    placeholder={t('menuItems.pricePlaceholder')}
                    disabled={isPending}
                    className='ps-11'
                  />
                </div>
                {errors.basePrice ? (
                  <p className='text-xs text-destructive'>{errors.basePrice}</p>
                ) : null}
              </div>
            ) : (
              <div className='space-y-3'>
                <div className='flex items-center justify-between'>
                  <Label>{t('menuItems.variants')}</Label>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={handleAddVariant}
                    disabled={isPending || variants.length >= 8}
                    className='h-7 gap-1 text-xs'
                  >
                    <IconPlus className='size-3.5' />
                    <span>{t('menuItems.addVariant')}</span>
                  </Button>
                </div>

                <div className='space-y-2'>
                  {variants.map((v, index) => (
                    <div key={index} className='flex items-center gap-2'>
                      <Input
                        value={v.name}
                        onChange={(e) => handleVariantChange(index, 'name', e.target.value)}
                        placeholder='e.g., Half / Full'
                        disabled={isPending}
                        className='flex-1'
                      />
                      <div className='relative w-36'>
                        <span className='absolute start-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium'>
                          Rs.
                        </span>
                        <Input
                          type='number'
                          min='0'
                          step='1'
                          value={v.price}
                          onChange={(e) => handleVariantChange(index, 'price', e.target.value)}
                          placeholder='Amount'
                          disabled={isPending}
                          className='ps-10'
                        />
                      </div>
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        onClick={() => handleRemoveVariant(index)}
                        disabled={isPending || variants.length <= 1}
                        className='h-9 w-9 text-muted-foreground hover:text-destructive'
                        aria-label='Remove variant'
                      >
                        <IconTrash className='size-4' />
                      </Button>
                    </div>
                  ))}
                </div>
                {errors.variants ? (
                  <p className='text-xs text-destructive'>{errors.variants}</p>
                ) : null}
              </div>
            )}
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
