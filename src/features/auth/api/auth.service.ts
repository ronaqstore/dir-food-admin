import { apiRequest } from '@/lib/api/client';
import type {
  SetupPasswordPayload,
  SetupPasswordResponse,
  RegisterRestaurantPayload,
  RegisterRestaurantResponse,
  CheckRestaurantNameResult
} from '../types';

export type {
  SetupPasswordPayload,
  SetupPasswordResponse,
  RegisterRestaurantPayload,
  RegisterRestaurantResponse,
  CheckRestaurantNameResult
};

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
