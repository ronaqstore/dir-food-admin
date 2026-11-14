import type { MenuItemDTO } from '@/features/menu/types';

export interface DishComboboxProps {
  value?: string;
  onSelect: (dish: MenuItemDTO) => void;
  dishes: MenuItemDTO[];
  disabled?: boolean;
}

export interface DealBuilderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deal?: MenuItemDTO | null;
  onSuccess?: () => void;
}

export interface ComboRow {
  id: string;
  menuItemId?: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface DishGroup {
  categoryName: string;
  items: MenuItemDTO[];
}

export interface DealComboSectionProps {
  comboRows: ComboRow[];
  availableDishes: MenuItemDTO[];
  calculatedTotalValue: number;
  isPending: boolean;
  onSelectDish: (index: number, dishId: string) => void;
  onQtyChange: (index: number, delta: number) => void;
  onRemoveRow: (index: number) => void;
  onAddDish: () => void;
  onSetOriginalPrice: (value: number) => void;
}

export interface DealCardProps {
  deal: MenuItemDTO;
  isPending: boolean;
  onToggleAvailability: (deal: MenuItemDTO) => void;
  onEdit: (deal: MenuItemDTO) => void;
  onDelete: (deal: MenuItemDTO) => void;
}
