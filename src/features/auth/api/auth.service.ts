import { apiRequest } from '@/lib/api/client';

export interface SetupPasswordPayload {
  token: string;
  password: string;
}

export interface SetupPasswordResponse {
  message?: string;
  success?: boolean;
}

export async function setupPassword(payload: SetupPasswordPayload): Promise<SetupPasswordResponse> {
  return apiRequest<SetupPasswordResponse>('/auth/setup-password', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}
