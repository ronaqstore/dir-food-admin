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
