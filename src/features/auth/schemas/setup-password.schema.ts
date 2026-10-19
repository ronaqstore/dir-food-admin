import { z } from 'zod';

export function createSetupPasswordSchema(t: (key: string) => string) {
  return z
    .object({
      password: z.string().min(8, t('auth.passwordRequired')),
      confirmPassword: z.string().min(1, t('auth.confirmPasswordRequired'))
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('auth.passwordMismatch'),
      path: ['confirmPassword']
    });
}

export type SetupPasswordSchemaType = z.infer<ReturnType<typeof createSetupPasswordSchema>>;
