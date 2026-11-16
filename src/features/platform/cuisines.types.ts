export interface MasterCuisine {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CuisinesPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface MasterCuisinesEnvelope {
  data?: MasterCuisine[];
  meta?: CuisinesPaginationMeta;
}

export type PublicCuisinesResponse =
  | MasterCuisine[]
  | {
      data?: MasterCuisine[];
    };

export interface QueryPlatformCuisinesParams {
  page?: number;
  limit?: number;
  q?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: string;
}

export interface CreateCuisineInput {
  name: string;
  slug?: string;
  icon?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateCuisineInput {
  name?: string;
  slug?: string;
  icon?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateMasterCuisinePayload {
  id: string;
  input: UpdateCuisineInput;
}

export interface CuisineDialogProps {
  cuisine: MasterCuisine | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DEFAULT_MASTER_CUISINE_NAMES = [
  'Fast Food',
  'Karahi',
  'BBQ',
  'Biryani',
  'Pizza',
  'Burgers',
  'Chai & Cafe',
  'Traditional',
  'Kabab',
  'Pulao',
  'Shawarma',
  'Chinese',
  'Fish & Seafood',
  'Breakfast',
  'Beverages',
  'Desserts',
  'Shinwari',
  'Tikka'
] as const;
