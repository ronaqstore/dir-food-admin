'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
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
import { IconFlame, IconPlus, IconCheck, IconX } from '@tabler/icons-react';
import { toPaisa, fromPaisa } from '@/lib/money';
import { useCategories } from '@/features/categories/api/categories-query';
import {
  useCreateMenuItem,
  useUpdateMenuItem,
  useUploadItemImage,
  useDeleteItemImage,
  useMenuItems
} from '@/features/menu/api/menu-query';
import { ApiError } from '@/lib/api/types';
import { DealComboSection, getDishUnitPrice } from './deal-combo-section';
import { DealPricingSection } from './deal-pricing-section';
import { DealPhotoField } from './deal-photo-field';
import type { DealBuilderDialogProps, ComboRow } from '../types';

export function DealBuilderDialog({
  open,
  onOpenChange,
  deal,
  onSuccess
}: DealBuilderDialogProps) {
  const t = useTranslations();
  const queryClient = useQueryClient();
  const { data: categories } = useCategories();
  const { data: menuItems } = useMenuItems({ limit: 500 });

  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [basePrice, setBasePrice] = React.useState('');
  const [originalPrice, setOriginalPrice] = React.useState('');
  const [comboRows, setComboRows] = React.useState<ComboRow[]>([]);
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

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
      setComboRows([
        {
          id: `row-${Date.now()}-0`,
          menuItemId: undefined,
          name: '',
          quantity: 1,
          unitPrice: 0
        }
      ]);
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
    const newRow: ComboRow = {
      id: `row-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      menuItemId: undefined,
      name: '',
      quantity: 1,
      unitPrice: 0
    };
    setComboRows((prev) => {
      const next = [...prev, newRow];
      syncDescription(next);
      return next;
    });
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

  const handleSetOriginalPrice = (value: number) => {
    setOriginalPrice(String(value));
  };

  const handleFileSelect = (file: File) => {
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemovePhoto = () => {
    setImageFile(null);
    setImagePreview(null);
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
        toast.success(t('deals.dealUpdated'));
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
        toast.success(t('deals.dealCreated'));
      }

      if (savedId && imageFile) {
        await uploadImage.mutateAsync({
          id: savedId,
          file: imageFile
        });
      } else if (savedId && !imagePreview && deal?.imageUrl) {
        await deleteImage.mutateAsync(savedId);
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

  const calculatedSavings = React.useMemo(() => {
    const orig = Number(originalPrice);
    const curr = Number(basePrice);
    if (orig > 0 && curr > 0 && orig > curr) {
      return orig - curr;
    }
    return 0;
  }, [originalPrice, basePrice]);

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
      <DialogContent className='max-h-[90vh] overflow-y-auto overflow-x-hidden w-full max-w-[calc(100vw-2rem)] sm:max-w-2xl rounded-2xl p-6'>
        <DialogHeader>
          <div className='flex items-center gap-3'>
            <div className='flex size-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 shrink-0 shadow-2xs'>
              <IconFlame className='size-5' />
            </div>
            <div className='space-y-0.5 text-start'>
              <DialogTitle className='text-base sm:text-lg font-bold tracking-tight'>
                {isEditing ? t('deals.dialogEditTitle') : t('deals.dialogCreateTitle')}
              </DialogTitle>
              <DialogDescription className='sr-only'>
                {t('deals.dialogDesc')}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4 pt-2 w-full min-w-0'>
          <div className='space-y-1.5'>
            <Label htmlFor='deal-name' className='text-xs font-semibold text-foreground'>
              {t('deals.dealTitleLabel')}
            </Label>
            <Input
              id='deal-name'
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('deals.dealTitlePlaceholder')}
              disabled={isPending}
              className='h-10 rounded-xl bg-background text-sm font-medium'
            />
            {errors.name ? <p className='text-xs text-destructive'>{errors.name}</p> : null}
          </div>

          <DealComboSection
            comboRows={comboRows}
            availableDishes={availableDishes}
            calculatedTotalValue={calculatedTotalValue}
            isPending={isPending}
            onSelectDish={handleSelectDish}
            onQtyChange={handleQtyChange}
            onRemoveRow={handleRemoveRow}
            onAddDish={handleAddDish}
            onSetOriginalPrice={handleSetOriginalPrice}
          />

          <DealPricingSection
            basePrice={basePrice}
            onBasePriceChange={setBasePrice}
            originalPrice={originalPrice}
            onOriginalPriceChange={setOriginalPrice}
            discountPercent={discountPercent}
            calculatedSavings={calculatedSavings}
            errors={errors}
            isPending={isPending}
            t={t}
          />

          <div className='space-y-1.5'>
            <div className='flex items-center justify-between'>
              <Label htmlFor='deal-description' className='text-xs font-semibold text-foreground'>
                {t('deals.dealDescLabel')}
              </Label>
              <span className='text-[10px] text-muted-foreground'>{t('common.optional')}</span>
            </div>
            <Textarea
              id='deal-description'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('deals.dealDescPlaceholder')}
              rows={2}
              dir='auto'
              disabled={isPending}
              className='rounded-xl bg-background text-xs leading-relaxed resize-none'
            />
          </div>

          <DealPhotoField
            imagePreview={imagePreview}
            name={name}
            isPending={isPending}
            onFileSelect={handleFileSelect}
            onRemovePhoto={handleRemovePhoto}
            t={t}
          />

          <DialogFooter
            showCloseButton={false}
            className='mx-0 mb-0 mt-5 p-0 pt-4 border-t border-border/80 bg-transparent flex flex-row items-center justify-end gap-2.5'
          >
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className='h-10 gap-1.5 rounded-xl px-4 text-xs font-medium'
            >
              <IconX className='size-4' />
              <span>{t('common.cancel')}</span>
            </Button>
            <Button
              type='submit'
              disabled={isPending}
              className='h-10 gap-1.5 rounded-xl px-5 text-xs font-bold shadow-sm'
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
