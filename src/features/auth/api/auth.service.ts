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
