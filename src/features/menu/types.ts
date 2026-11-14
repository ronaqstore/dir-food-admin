import type { MenuItemDTO, MenuCategoryDTO } from '@/lib/api/types';

export type { MenuItemDTO, MenuCategoryDTO };

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
}

export interface CreateItemVariantInput {
  name: string;
  price: number;
}

export interface CreateMenuItemInput {
  categoryId?: string;
  name: string;
  description?: string;
  basePrice?: number;
  originalPrice?: number | null;
  isDeal?: boolean;
  variants?: CreateItemVariantInput[];
}

export interface UpdateMenuItemInput {
  categoryId?: string;
  name?: string;
  description?: string;
  basePrice?: number | null;
  originalPrice?: number | null;
  isDeal?: boolean;
  isAvailable?: boolean;
  isActive?: boolean;
}

export interface ReplaceVariantsInput {
  variants: CreateItemVariantInput[];
}

export interface MenuItemsFilter {
  categoryId?: string;
  search?: string;
  page?: number;
  limit?: number;
  isDeal?: boolean;
  isAvailable?: boolean;
}

export interface MenuItemsResponse {
  data: MenuItemDTO[];
  meta: PaginationMeta;
}

export interface UpdateMenuItemPayload {
  id: string;
  input: UpdateMenuItemInput;
}

export interface ReplaceVariantsPayload {
  id: string;
  input: ReplaceVariantsInput;
}

export interface UploadItemImagePayload {
  id: string;
  file: File;
}

export interface MenuItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: MenuItemDTO | null;
  defaultCategoryId?: string;
}

export interface VariantField {
  name: string;
  price: string;
}

export type PricingMode = 'fixed' | 'variants';

export interface MenuItemPricingProps {
  pricingMode: PricingMode;
  onPricingModeChange: (mode: PricingMode) => void;
  basePrice: string;
  onBasePriceChange: (val: string) => void;
  originalPrice: string;
  onOriginalPriceChange: (val: string) => void;
  variants: VariantField[];
  onAddVariant: () => void;
  onRemoveVariant: (index: number) => void;
  onVariantChange: (index: number, field: 'name' | 'price', val: string) => void;
  errors: Record<string, string>;
  isPending: boolean;
  t: (key: string) => string;
}

export type ViewMode = 'grid' | 'list';
export type StatusFilter = 'all' | 'available' | 'soldOut';

export interface FoodCardProps {
  item: MenuItemDTO;
  categories?: MenuCategoryDTO[];
  onEdit: (item: MenuItemDTO) => void;
  onToggleAvailability: (item: MenuItemDTO) => void;
  isPending: boolean;
  t: (key: string) => string;
}

export interface MenuHeaderControlsProps {
  search: string;
  onSearchChange: (val: string) => void;
  statusFilter: StatusFilter;
  onStatusFilterChange: (status: StatusFilter) => void;
  totalCount: number;
  availableCount: number;
  soldOutCount: number;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  selectedCategory: string;
  onSelectCategory: (catId: string) => void;
  categories: MenuCategoryDTO[] | undefined;
  categoryCounts: Record<string, number>;
  allCategoriesTotal: number;
  categoryPillsRef: React.RefObject<HTMLDivElement | null>;
  t: (key: string) => string;
}

export interface MenuMobileSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
  categories: MenuCategoryDTO[] | undefined;
  categoryCounts: Record<string, number>;
  allCategoriesTotal: number;
  t: (key: string) => string;
}
