import type { MenuCategoryDTO } from '@/lib/api/types';

export interface CategoryWithCount extends MenuCategoryDTO {
  _count?: {
    items: number;
  };
}

export interface CreateCategoryInput {
  name: string;
}

export interface UpdateCategoryInput {
  name?: string;
  isActive?: boolean;
}

export interface ReorderCategoriesInput {
  ids: string[];
}

export interface UpdateCategoryMutationPayload {
  id: string;
  input: UpdateCategoryInput;
}

export interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: CategoryWithCount | null;
}

export interface CategoriesFilter {
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CategoriesResponse {
  data: CategoryWithCount[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages?: number;
  };
}
