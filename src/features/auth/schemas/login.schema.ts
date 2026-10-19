import { z } from 'zod';
import { isValidPkMobile } from '@/lib/auth/phone';

export function createLoginSchema(t: (key: string) => string, minPasswordLength = 1) {
  return z.object({
    phone: z
      .string()
      .min(1, t('auth.phoneRequired'))
      .refine(isValidPkMobile, t('auth.phoneInvalid')),
    password: z.string().min(minPasswordLength, t('auth.passwordRequired'))
  });
}

export type LoginSchemaType = z.infer<ReturnType<typeof createLoginSchema>>;
