import type { MenuItemDTO, MenuItemVariantDTO } from '@/lib/api/types';

export type { MenuItemDTO, MenuItemVariantDTO };

export interface CreateItemVariantInput {
  name: string;
  price: number; // in paisa
}

export interface CreateMenuItemInput {
  categoryId: string;
  name: string;
  description?: string;
  basePrice?: number; // in paisa
  variants?: CreateItemVariantInput[];
}

export interface UpdateMenuItemInput {
  categoryId?: string;
  name?: string;
  description?: string;
  basePrice?: number | null; // in paisa
  isAvailable?: boolean;
  isActive?: boolean;
}

export interface ReplaceVariantsInput {
  variants: CreateItemVariantInput[];
}

export interface ReorderMenuItemsInput {
  categoryId: string;
  ids: string[];
}

export interface MenuItemsFilter {
  categoryId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface MenuItemsResponse {
  data: MenuItemDTO[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}
