export interface SetupPasswordPayload {
  token: string;
  password: string;
}

export interface SetupPasswordResponse {
  message?: string;
  success?: boolean;
}

export interface RegisterRestaurantPayload {
  restaurantName: string;
  ownerName: string;
  phone: string;
  password: string;
  whatsappNumber?: string;
  description?: string;
  cuisines?: string[];
  cityId?: string;
}

export interface RegisteredUser {
  id: string;
  name: string;
  phone: string;
  role: string;
  status: string;
}

export interface RegisteredRestaurant {
  id: string;
  name: string;
  slug: string;
  status: string;
}

export interface RegisterRestaurantResponse {
  user: RegisteredUser;
  restaurant: RegisteredRestaurant;
}

export interface ExistingRestaurantInfo {
  name: string;
  addressText?: string | null;
}

export interface CheckRestaurantNameResult {
  available: boolean;
  baseSlug: string;
  suggestedSlug: string;
  collision: boolean;
  existingRestaurant?: ExistingRestaurantInfo;
}

