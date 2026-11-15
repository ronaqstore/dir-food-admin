import type { ParsedSort } from '../types';

export function parseSortParam(sortBy: string): ParsedSort {
  switch (sortBy) {
    case 'name-asc':
      return { sortBy: 'name', sortOrder: 'asc' };
    case 'name-desc':
      return { sortBy: 'name', sortOrder: 'desc' };
    case 'price-asc':
      return { sortBy: 'price', sortOrder: 'asc' };
    case 'price-desc':
      return { sortBy: 'price', sortOrder: 'desc' };
    case 'newest':
      return { sortBy: 'createdAt', sortOrder: 'desc' };
    default:
      return {};
  }
}
