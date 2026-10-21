import { apiRequest } from '@/lib/api/client';

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
}

export interface RegisterRestaurantResponse {
  user: {
    id: string;
    name: string;
    phone: string;
    role: string;
    status: string;
  };
  restaurant: {
    id: string;
    name: string;
    slug: string;
    status: string;
  };
}

export interface CheckRestaurantNameResult {
  available: boolean;
  baseSlug: string;
  suggestedSlug: string;
  collision: boolean;
  existingRestaurant?: {
    name: string;
    addressText?: string | null;
  };
}

export async function checkRestaurantName(name: string): Promise<CheckRestaurantNameResult> {
  const query = new URLSearchParams({ name: name.trim() });
  return apiRequest<CheckRestaurantNameResult>(`/auth/check-restaurant-name?${query.toString()}`, {
    method: 'GET'
  });
}

export async function setupPassword(payload: SetupPasswordPayload): Promise<SetupPasswordResponse> {
  return apiRequest<SetupPasswordResponse>('/auth/setup-password', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function registerRestaurant(
  payload: RegisterRestaurantPayload
): Promise<RegisterRestaurantResponse> {
  return apiRequest<RegisterRestaurantResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}
