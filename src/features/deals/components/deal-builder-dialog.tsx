'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
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
import { IconPlus, IconTrash, IconPhoto, IconMinus, IconUpload } from '@tabler/icons-react';
import { toPaisa, fromPaisa, formatPkr } from '@/lib/money';
import { useCategories } from '@/features/categories/api/categories-query';
import {
  useCreateMenuItem,
  useUpdateMenuItem,
  useUploadItemImage,
  useDeleteItemImage,
  useMenuItems
} from '@/features/menu/api/menu-query';
import type { MenuItemDTO } from '@/features/menu/types';
import { ApiError } from '@/lib/api/types';
import { DishCombobox } from './dish-combobox';

interface DealBuilderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deal?: MenuItemDTO | null;
  onSuccess?: () => void;
}

interface ComboRow {
  id: string;
  isCustom: boolean;
  menuItemId?: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

// Safely extract price from either basePrice or first active variant
function getDishUnitPrice(dish: MenuItemDTO): number {
  if (dish.basePrice != null && dish.basePrice > 0) {
    return fromPaisa(dish.basePrice);
  }
  if (dish.variants && dish.variants.length > 0) {
    const firstActive = dish.variants.find((v) => v.isActive !== false) || dish.variants[0];
    if (firstActive && firstActive.price > 0) {
      return fromPaisa(firstActive.price);
    }
  }
  return 0;
}

export function DealBuilderDialog({
  open,
  onOpenChange,
  deal,
  onSuccess
}: DealBuilderDialogProps) {
  const queryClient = useQueryClient();
  const { data: categories } = useCategories();
  // Fetch all menu dishes without pagination cutoff
  const { data: menuItems } = useMenuItems({ limit: 500 });

  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [basePrice, setBasePrice] = React.useState('');
  const [originalPrice, setOriginalPrice] = React.useState('');
  const [comboRows, setComboRows] = React.useState<ComboRow[]>([]);
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const isEditing = Boolean(deal);
  const createItem = useCreateMenuItem();
  const updateItem = useUpdateMenuItem();
  const uploadImage = useUploadItemImage();
  const deleteImage = useDeleteItemImage();

  const isPending =
    createItem.isPending ||
    updateItem.isPending ||
    uploadImage.isPending ||
    deleteImage.isPending;

  // Dishes available for combo (excluding deals and current item)
  const availableDishes = React.useMemo(() => {
    if (!Array.isArray(menuItems)) return [];
    return menuItems.filter((i) => i.id !== deal?.id && !i.isDeal && i.isActive !== false);
  }, [menuItems, deal?.id]);

  React.useEffect(() => {
    if (deal) {
      setName(deal.name);
      setDescription(deal.description || '');
      setBasePrice(deal.basePrice != null ? String(fromPaisa(deal.basePrice)) : '');
      setOriginalPrice(deal.originalPrice != null ? String(fromPaisa(deal.originalPrice)) : '');
      setImagePreview(deal.imageUrl || null);
      setImageFile(null);

      if (deal.description) {
        const parts = deal.description.split('+').map((p) => p.trim()).filter(Boolean);
        const parsed: ComboRow[] = parts.map((part, idx) => {
          const qtyMatch = part.match(/^(\d+)x?\s*(.+)$/i);
          const qty = qtyMatch && qtyMatch[1] ? Number(qtyMatch[1]) : 1;
          const cleanName = qtyMatch && qtyMatch[2] ? qtyMatch[2].trim() : part;
          const matched = Array.isArray(menuItems)
            ? menuItems.find((d) => d.name.toLowerCase() === cleanName.toLowerCase())
            : undefined;
          return {
            id: `row-${idx}-${cleanName}`,
            isCustom: !matched,
            menuItemId: matched?.id,
            name: matched?.name || cleanName,
            quantity: isNaN(qty) ? 1 : qty,
            unitPrice: matched ? getDishUnitPrice(matched) : 0
          };
        });
        setComboRows(parsed);
      } else {
        setComboRows([]);
      }
    } else {
      setName('');
      setDescription('');
      setBasePrice('');
      setOriginalPrice('');
      setComboRows([]);
      setImagePreview(null);
      setImageFile(null);
    }
    setErrors({});
  }, [deal, menuItems, open]);

  const syncDescription = (rows: ComboRow[]) => {
    const valid = rows.filter((r) => r.name.trim().length > 0);
    if (valid.length > 0) {
      const generated = valid
        .map((r) => `${r.quantity > 1 ? `${r.quantity}x ` : '1x '}${r.name.trim()}`)
        .join(' + ');
      setDescription(generated);
    }
  };

  const handleAddDish = () => {
    const first = availableDishes[0];
    const newRow: ComboRow = {
      id: `row-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      isCustom: false,
      menuItemId: first?.id,
      name: first?.name || '',
      quantity: 1,
      unitPrice: first ? getDishUnitPrice(first) : 0
    };
    setComboRows((prev) => {
      const next = [...prev, newRow];
      syncDescription(next);
      return next;
    });
  };

  const handleAddCustomPerk = () => {
    const newRow: ComboRow = {
      id: `row-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      isCustom: true,
      name: '',
      quantity: 1,
      unitPrice: 0
    };
    setComboRows((prev) => [...prev, newRow]);
  };

  const handleSelectDish = (index: number, dishId: string) => {
    const dish = availableDishes.find((d) => d.id === dishId);
    if (!dish) return;
    setComboRows((prev) => {
      const next = [...prev];
      const target = next[index];
      if (target) {
        next[index] = {
          ...target,
          menuItemId: dish.id,
          name: dish.name,
          unitPrice: getDishUnitPrice(dish)
        };
      }
      syncDescription(next);
      return next;
    });
  };

  const handleCustomNameChange = (index: number, val: string) => {
    setComboRows((prev) => {
      const next = [...prev];
      const target = next[index];
      if (target) {
        next[index] = { ...target, name: val };
      }
      syncDescription(next);
      return next;
    });
  };

  const handleQtyChange = (index: number, delta: number) => {
    setComboRows((prev) => {
      const next = [...prev];
      const target = next[index];
      if (target) {
        next[index] = { ...target, quantity: Math.max(1, target.quantity + delta) };
      }
      syncDescription(next);
      return next;
    });
  };

  const handleRemoveRow = (index: number) => {
    setComboRows((prev) => {
      const next = prev.filter((_, i) => i !== index);
      syncDescription(next);
      return next;
    });
  };

  const calculatedTotalValue = React.useMemo(() => {
    return comboRows.reduce((acc, row) => acc + (row.unitPrice || 0) * row.quantity, 0);
  }, [comboRows]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      toast.error('Image size must be less than 3MB');
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim() || name.trim().length < 2) {
      newErrors.name = 'Deal title must be at least 2 characters';
    }

    const priceNum = Number(basePrice);
    if (!basePrice || isNaN(priceNum) || priceNum <= 0) {
      newErrors.basePrice = 'Please enter a valid deal price';
    }

    if (originalPrice) {
      const origNum = Number(originalPrice);
      if (isNaN(origNum) || origNum <= 0) {
        newErrors.originalPrice = 'Invalid original price';
      } else if (!isNaN(priceNum) && origNum <= priceNum) {
        newErrors.originalPrice = 'Original price must be greater than the deal price';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      let savedId = deal?.id;

      // Automatically assign to a Deals category or fallback to undefined so backend auto-creates 'Deals & Combos'
      const dealsCat = categories?.find(
        (c) =>
          c.name.toLowerCase().includes('deal') ||
          c.name.toLowerCase().includes('combo') ||
          c.name.includes('ڈیل')
      );
      const targetCatId = deal?.categoryId || dealsCat?.id || undefined;

      if (isEditing && deal) {
        await updateItem.mutateAsync({
          id: deal.id,
          input: {
            categoryId: targetCatId,
            name: name.trim(),
            description: description.trim() || undefined,
            basePrice: toPaisa(Number(basePrice)),
            originalPrice: originalPrice ? toPaisa(Number(originalPrice)) : null,
            isDeal: true
          }
        });
        toast.success('Deal updated successfully');
      } else {
        const created = await createItem.mutateAsync({
          categoryId: targetCatId,
          name: name.trim(),
          description: description.trim() || undefined,
          basePrice: toPaisa(Number(basePrice)),
          originalPrice: originalPrice ? toPaisa(Number(originalPrice)) : undefined,
          isDeal: true
        });
        savedId = created.id;
        toast.success('Deal created successfully');
      }

      if (savedId && imageFile) {
        await uploadImage.mutateAsync({
          id: savedId,
          file: imageFile
        });
      }

      await queryClient.invalidateQueries({ queryKey: ['menu-items'] });
      await queryClient.refetchQueries({ queryKey: ['menu-items'] });
      onSuccess?.();
      onOpenChange(false);
    } catch (err: unknown) {
      const msg =
        err instanceof ApiError && err.message
          ? err.message
          : err instanceof Error && err.message
            ? err.message
            : 'An error occurred while saving the deal';
      toast.error(msg);
    }
  };

  const discountPercent = React.useMemo(() => {
    const orig = Number(originalPrice);
    const curr = Number(basePrice);
    if (orig > 0 && curr > 0 && orig > curr) {
      return Math.round(((orig - curr) / orig) * 100);
    }
    return 0;
  }, [originalPrice, basePrice]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90vh] overflow-y-auto overflow-x-hidden w-full max-w-[calc(100vw-2rem)] sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle className='text-base sm:text-lg'>
            {isEditing ? 'Edit Combo Deal' : 'Create Combo Deal'}
          </DialogTitle>
          <DialogDescription className='text-xs'>
            Bundle dishes from across your menu into a promotional package.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4 pt-1 w-full min-w-0'>
          {/* Section 1: Deal Title (No Category input needed) */}
          <div className='space-y-1.5'>
            <Label htmlFor='deal-name'>Deal Title *</Label>
            <Input
              id='deal-name'
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder='e.g. Mega Feast Combo (2 Burgers + 1 Pizza + Drinks)'
              disabled={isPending}
              className='text-sm'
            />
            {errors.name ? <p className='text-xs text-destructive'>{errors.name}</p> : null}
          </div>

          {/* Section 2: Combo Items from All Categories */}
          <div className='rounded-lg border border-border p-3 sm:p-3.5 space-y-3 bg-muted/20 w-full min-w-0'>
            <div className='flex flex-wrap items-center justify-between gap-2'>
              <div>
                <Label className='text-xs font-semibold'>Dishes in this Combo</Label>
                <p className='text-[11px] text-muted-foreground'>
                  Pick items from across your menu categories (Burgers, Pizzas, Karahi, Drinks, etc.)
                </p>
              </div>
              {calculatedTotalValue > 0 ? (
                <span className='text-xs font-medium text-muted-foreground whitespace-nowrap'>
                  Standard Value: <strong className='text-foreground'>{formatPkr(toPaisa(calculatedTotalValue))}</strong>
                </span>
              ) : null}
            </div>

            {comboRows.length === 0 ? (
              <div className='rounded-md border border-dashed border-border/80 p-4 text-center text-xs text-muted-foreground'>
                No items added yet. Click &ldquo;Add Dish from Menu&rdquo; to start bundling items.
              </div>
            ) : (
              <div className='space-y-2'>
                {comboRows.map((row, idx) => (
                  <div
                    key={row.id}
                    className='flex items-center gap-2 rounded-md border border-border bg-background p-2 text-xs w-full min-w-0'
                  >
                    <div className='flex-1 min-w-0'>
                      {!row.isCustom ? (
                        <DishCombobox
                          value={row.menuItemId}
                          onSelect={(dish) => handleSelectDish(idx, dish.id)}
                          dishes={availableDishes}
                          disabled={isPending}
                        />
                      ) : (
                        <Input
                          value={row.name}
                          onChange={(e) => handleCustomNameChange(idx, e.target.value)}
                          placeholder='e.g. Free 500ml Drink or Extra Raita'
                          disabled={isPending}
                          className='h-9 text-xs'
                        />
                      )}
                    </div>

                    <div className='flex items-center gap-1 rounded-md border border-input bg-background p-0.5 shrink-0'>
                      <button
                        type='button'
                        onClick={() => handleQtyChange(idx, -1)}
                        disabled={row.quantity <= 1 || isPending}
                        className='flex size-6 items-center justify-center rounded hover:bg-muted disabled:opacity-40 transition-colors cursor-pointer'
                        aria-label='Decrease quantity'
                      >
                        <IconMinus className='size-3' />
                      </button>
                      <span className='w-5 text-center font-semibold text-xs'>{row.quantity}</span>
                      <button
                        type='button'
                        onClick={() => handleQtyChange(idx, 1)}
                        disabled={isPending}
                        className='flex size-6 items-center justify-center rounded hover:bg-muted transition-colors cursor-pointer'
                        aria-label='Increase quantity'
                      >
                        <IconPlus className='size-3' />
                      </button>
                    </div>

                    {row.unitPrice > 0 ? (
                      <span className='text-[11px] font-semibold text-muted-foreground w-14 sm:w-16 text-end shrink-0 whitespace-nowrap'>
                        {formatPkr(toPaisa(row.unitPrice * row.quantity))}
                      </span>
                    ) : null}

                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      onClick={() => handleRemoveRow(idx)}
                      disabled={isPending}
                      className='size-7 text-muted-foreground hover:text-destructive shrink-0'
                      aria-label='Remove item'
                    >
                      <IconTrash className='size-3.5' />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className='flex flex-wrap items-center justify-between gap-2 pt-1 w-full min-w-0'>
              <div className='flex items-center gap-2'>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={handleAddDish}
                  disabled={isPending || availableDishes.length === 0}
                  className='h-7 gap-1 text-xs'
                >
                  <IconPlus className='size-3' />
                  <span>Add Dish from Menu</span>
                </Button>
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  onClick={handleAddCustomPerk}
                  disabled={isPending}
                  className='h-7 gap-1 text-xs text-muted-foreground hover:text-foreground'
                >
                  <IconPlus className='size-3' />
                  <span>Add Free Bonus</span>
                </Button>
              </div>

              {calculatedTotalValue > 0 ? (
                <Button
                  type='button'
                  variant='secondary'
                  size='sm'
                  onClick={() => setOriginalPrice(String(calculatedTotalValue))}
                  disabled={isPending}
                  className='h-7 text-xs font-medium'
                >
                  Set Original Price to {formatPkr(toPaisa(calculatedTotalValue))}
                </Button>
              ) : null}
            </div>
          </div>

          {/* Section 3: Pricing */}
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
            <div className='space-y-1.5'>
              <Label htmlFor='deal-price'>Deal Price *</Label>
              <div className='relative'>
                <span className='absolute start-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium'>
                  Rs.
                </span>
                <Input
                  id='deal-price'
                  type='number'
                  min='1'
                  step='1'
                  value={basePrice}
                  onChange={(e) => setBasePrice(e.target.value)}
                  placeholder='e.g. 1999'
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
                <Label htmlFor='deal-original-price'>Original / Regular Price</Label>
                <span className='text-[10px] text-muted-foreground'>Optional</span>
              </div>
              <div className='relative'>
                <span className='absolute start-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium'>
                  Rs.
                </span>
                <Input
                  id='deal-original-price'
                  type='number'
                  min='1'
                  step='1'
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value)}
                  placeholder='e.g. 2450'
                  disabled={isPending}
                  className='ps-11'
                />
              </div>
              {errors.originalPrice ? (
                <p className='text-xs text-destructive'>{errors.originalPrice}</p>
              ) : null}
            </div>
          </div>

          {discountPercent > 0 ? (
            <div className='rounded-md bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 p-2.5 text-xs text-emerald-800 dark:text-emerald-300 font-medium'>
              Customer saves {formatPkr(toPaisa(Number(originalPrice) - Number(basePrice)))}{' '}
              ({discountPercent}% off regular price)
            </div>
          ) : null}

          {/* Section 4: Description */}
          <div className='space-y-1.5'>
            <Label htmlFor='deal-description'>Deal Description</Label>
            <Textarea
              id='deal-description'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder='Auto-generated from combo items or enter custom details'
              rows={2}
              dir='auto'
              disabled={isPending}
              className='text-xs'
            />
          </div>

          {/* Section 5: Photo */}
          <div className='space-y-1.5'>
            <Label>Deal Photo</Label>
            <div className='flex items-center gap-3'>
              {imagePreview ? (
                <div className='relative size-16 rounded-md border overflow-hidden shrink-0 bg-muted'>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imagePreview} alt='Preview' className='size-full object-cover' />
                </div>
              ) : (
                <div className='flex size-16 items-center justify-center rounded-md border border-dashed text-muted-foreground shrink-0'>
                  <IconPhoto className='size-6 opacity-50' />
                </div>
              )}

              <div className='space-y-1'>
                <input
                  ref={fileInputRef}
                  type='file'
                  accept='image/jpeg,image/png,image/webp'
                  onChange={handleFileChange}
                  className='hidden'
                  disabled={isPending}
                />
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isPending}
                  className='h-8 text-xs gap-1.5'
                >
                  <IconUpload className='size-3.5' />
                  <span>{imagePreview ? 'Change Photo' : 'Upload Photo'}</span>
                </Button>
                <p className='text-[10px] text-muted-foreground'>JPG, PNG or WebP up to 3MB</p>
              </div>
            </div>
          </div>

          <DialogFooter
            showCloseButton={false}
            className='mx-0 mb-0 mt-4 p-0 pt-3 border-t bg-transparent flex flex-row items-center justify-end gap-2'
          >
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type='submit' disabled={isPending}>
              {isPending ? <Spinner className='mr-2 size-4' /> : null}
              {isEditing ? 'Save Changes' : 'Create Deal'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
