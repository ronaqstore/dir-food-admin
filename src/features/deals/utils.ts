import { fromPaisa } from '@/lib/money';
import type { MenuItemDTO, MenuItemVariantDTO } from '@/lib/api/types';
import type { ComboRow } from './types';

export function getDishUnitPrice(dish: MenuItemDTO, variantId?: string): number {
  if (variantId && dish.variants && dish.variants.length > 0) {
    const matched = dish.variants.find((v) => v.id === variantId);
    if (matched && matched.price > 0) {
      return fromPaisa(matched.price);
    }
  }
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

export function parseDealComboRows(
  description: string | null | undefined,
  menuItems?: MenuItemDTO[]
): ComboRow[] {
  if (!description || !description.trim()) {
    return [];
  }

  const parts = description.split('+').map((p) => p.trim()).filter(Boolean);
  return parts.map((part, idx) => {
    const qtyMatch = part.match(/^(\d+)x?\s*(.+)$/i);
    const qty = qtyMatch && qtyMatch[1] ? Number(qtyMatch[1]) : 1;
    const cleanName = qtyMatch && qtyMatch[2] ? qtyMatch[2].trim() : part;

    const variantMatch = cleanName.match(/^(.+?)\s*\((.+?)\)$/);
    let matchedDish: MenuItemDTO | undefined;
    let matchedVariant: MenuItemVariantDTO | undefined;

    if (variantMatch && variantMatch[1] && variantMatch[2]) {
      const baseDishName = variantMatch[1].trim();
      const vName = variantMatch[2].trim();
      matchedDish = Array.isArray(menuItems)
        ? menuItems.find((d) => d.name.toLowerCase() === baseDishName.toLowerCase())
        : undefined;
      if (matchedDish && matchedDish.variants) {
        matchedVariant = matchedDish.variants.find(
          (v) => v.name.toLowerCase() === vName.toLowerCase()
        );
      }
    }

    if (!matchedDish) {
      matchedDish = Array.isArray(menuItems)
        ? menuItems.find((d) => d.name.toLowerCase() === cleanName.toLowerCase())
        : undefined;
      if (matchedDish && matchedDish.variants && matchedDish.variants.length > 0) {
        const activeVariants = matchedDish.variants.filter((v) => v.isActive !== false);
        matchedVariant = activeVariants.length > 0 ? activeVariants[0] : matchedDish.variants[0];
      }
    }

    if (matchedDish && matchedVariant) {
      return {
        id: `row-${idx}-${cleanName}`,
        menuItemId: matchedDish.id,
        variantId: matchedVariant.id,
        variantName: matchedVariant.name,
        name: `${matchedDish.name} (${matchedVariant.name})`,
        quantity: isNaN(qty) ? 1 : qty,
        unitPrice: fromPaisa(matchedVariant.price)
      };
    }

    return {
      id: `row-${idx}-${cleanName}`,
      menuItemId: matchedDish?.id,
      name: matchedDish?.name || cleanName,
      quantity: isNaN(qty) ? 1 : qty,
      unitPrice: matchedDish ? getDishUnitPrice(matchedDish) : 0
    };
  });
}

export function syncComboDescription(rows: ComboRow[]): string {
  const valid = rows.filter((r) => r.name.trim().length > 0);
  if (valid.length === 0) return '';
  return valid
    .map((r) => `${r.quantity > 1 ? `${r.quantity}x ` : '1x '}${r.name.trim()}`)
    .join(' + ');
}
