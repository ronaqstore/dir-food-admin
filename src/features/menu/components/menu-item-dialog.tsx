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
import { Switch } from '@/components/ui/switch';
import { IconPlus, IconTrash, IconPhoto, IconUpload, IconMinus, IconSparkles } from '@tabler/icons-react';
import { toPaisa, fromPaisa, formatPkr } from '@/lib/money';
import { useCategories } from '@/features/categories/api/categories-query';
import {
  useCreateMenuItem,
  useUpdateMenuItem,
  useUploadItemImage,
  useDeleteItemImage,
  useReplaceVariants,
  useMenuItems
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

interface ComboItemRow {
  id: string;
  isCustom: boolean;
  menuItemId?: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

export function MenuItemDialog({
  open,
  onOpenChange,
  item,
  defaultCategoryId
}: MenuItemDialogProps) {
  const t = useTranslations();
  const { data: categories } = useCategories();
  const { data: menuItems } = useMenuItems({ limit: 100 });

  const [categoryId, setCategoryId] = React.useState('');
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [pricingMode, setPricingMode] = React.useState<'fixed' | 'variants'>('fixed');
  const [basePrice, setBasePrice] = React.useState('');
  const [originalPrice, setOriginalPrice] = React.useState('');
  const [isDeal, setIsDeal] = React.useState(false);
  const [comboRows, setComboRows] = React.useState<ComboItemRow[]>([]);
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
      if (item.isDeal && item.description) {
        const parts = item.description.split('+').map((p) => p.trim()).filter(Boolean);
        const parsedRows: ComboItemRow[] = parts.map((part, idx) => {
          const qtyMatch = part.match(/^(\d+)x?\s*(.+)$/i);
          const qty = qtyMatch && qtyMatch[1] ? Number(qtyMatch[1]) : 1;
          const cleanName = qtyMatch && qtyMatch[2] ? qtyMatch[2].trim() : part;
          const matchedDish = Array.isArray(menuItems)
            ? menuItems.find((d) => d.name.toLowerCase() === cleanName.toLowerCase())
            : undefined;
          return {
            id: `row-${idx}-${cleanName}`,
            isCustom: !matchedDish,
            menuItemId: matchedDish?.id,
            name: matchedDish?.name || cleanName,
            quantity: isNaN(qty) ? 1 : qty,
            unitPrice: matchedDish?.basePrice ? fromPaisa(matchedDish.basePrice) : 0
          };
        });
        setComboRows(parsedRows);
      } else {
        setComboRows([]);
      }
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
      setComboRows([]);
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

  const availableDishes = React.useMemo(() => {
    return Array.isArray(menuItems) ? menuItems.filter((i) => i.id !== item?.id) : [];
  }, [menuItems, item?.id]);

  const groupedDishes = React.useMemo(() => {
    const map = new Map<string, { categoryName: string; items: MenuItemDTO[] }>();
    if (!Array.isArray(menuItems)) return [];

    for (const dish of menuItems) {
      if (dish.id === item?.id) continue;
      const catName =
        dish.category?.name ||
        categories?.find((c) => c.id === dish.categoryId)?.name ||
        'Menu Dishes';
      if (!map.has(catName)) {
        map.set(catName, { categoryName: catName, items: [] });
      }
      map.get(catName)?.items.push(dish);
    }
    return Array.from(map.values());
  }, [menuItems, item?.id, categories]);

  const syncDescriptionFromCombo = (rows: ComboItemRow[]) => {
    const valid = rows.filter((r) => r.name.trim().length > 0);
    if (valid.length > 0) {
      const generated = valid
        .map((r) => `${r.quantity > 1 ? `${r.quantity}x ` : '1x '}${r.name.trim()}`)
        .join(' + ');
      setDescription(generated);
    }
  };

  const handleAddComboMenuDish = () => {
    const firstDish = availableDishes[0];
    const newRow: ComboItemRow = {
      id: `row-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      isCustom: false,
      menuItemId: firstDish?.id,
      name: firstDish?.name || '',
      quantity: 1,
      unitPrice: firstDish?.basePrice ? fromPaisa(firstDish.basePrice) : 0
    };
    setComboRows((prev) => {
      const next = [...prev, newRow];
      syncDescriptionFromCombo(next);
      return next;
    });
  };

  const handleAddComboCustomItem = () => {
    const newRow: ComboItemRow = {
      id: `row-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      isCustom: true,
      name: '',
      quantity: 1,
      unitPrice: 0
    };
    setComboRows((prev) => {
      const next = [...prev, newRow];
      return next;
    });
  };

  const handleSelectComboDish = (index: number, dishId: string) => {
    const dish = availableDishes.find((d) => d.id === dishId);
    if (!dish) return;
    setComboRows((prev) => {
      const updated = [...prev];
      const target = updated[index];
      if (target) {
        updated[index] = {
          ...target,
          menuItemId: dish.id,
          name: dish.name,
          unitPrice: dish.basePrice ? fromPaisa(dish.basePrice) : 0
        };
      }
      syncDescriptionFromCombo(updated);
      return updated;
    });
  };

  const handleUpdateCustomName = (index: number, val: string) => {
    setComboRows((prev) => {
      const updated = [...prev];
      const target = updated[index];
      if (target) {
        updated[index] = { ...target, name: val };
      }
      syncDescriptionFromCombo(updated);
      return updated;
    });
  };

  const handleUpdateComboQty = (index: number, delta: number) => {
    setComboRows((prev) => {
      const updated = [...prev];
      const target = updated[index];
      if (target) {
        const nextQty = Math.max(1, target.quantity + delta);
        updated[index] = { ...target, quantity: nextQty };
      }
      syncDescriptionFromCombo(updated);
      return updated;
    });
  };

  const handleRemoveComboRow = (index: number) => {
    setComboRows((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      syncDescriptionFromCombo(updated);
      return updated;
    });
  };

  const calculatedComboValue = React.useMemo(() => {
    return comboRows.reduce((acc, row) => {
      return acc + (row.unitPrice || 0) * row.quantity;
    }, 0);
  }, [comboRows]);

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
                  <p className='text-xs text-muted-foreground mt-0.5'>
                    {t('menuItems.fixedPriceDesc')}
                  </p>
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
                  <p className='text-xs text-muted-foreground mt-0.5'>
                    {t('menuItems.hasVariantsDesc')}
                  </p>
                </button>
              </div>
            </div>

            {/* Price inputs */}
            {pricingMode === 'fixed' ? (
              <div className='space-y-3'>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
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

                  <div className='space-y-1.5'>
                    <div className='flex items-center justify-between'>
                      <Label htmlFor='original-price'>Original / Cut Price</Label>
                      <span className='text-[10px] text-muted-foreground'>Optional</span>
                    </div>
                    <div className='relative'>
                      <span className='absolute start-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium'>
                        Rs.
                      </span>
                      <Input
                        id='original-price'
                        type='number'
                        min='0'
                        step='1'
                        value={originalPrice}
                        onChange={(e) => setOriginalPrice(e.target.value)}
                        placeholder='e.g. 2000'
                        disabled={isPending}
                        className='ps-11'
                      />
                    </div>
                    {errors.originalPrice ? (
                      <p className='text-xs text-destructive'>{errors.originalPrice}</p>
                    ) : null}
                  </div>
                </div>

                {originalPrice && basePrice && Number(originalPrice) > Number(basePrice) ? (
                  <div className='rounded-lg bg-muted/50 p-2.5 text-xs text-muted-foreground'>
                    Display price: <span className='line-through'>Rs. {originalPrice}</span>{' '}
                    <span className='font-semibold text-foreground'>Rs. {basePrice}</span>{' '}
                    ({Math.round(((Number(originalPrice) - Number(basePrice)) / Number(originalPrice)) * 100)}% off)
                  </div>
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
                        placeholder={t('menuItems.variantPlaceholder')}
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
                          placeholder={t('menuItems.amountPlaceholder')}
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
                        aria-label={t('menuItems.removeVariant')}
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
