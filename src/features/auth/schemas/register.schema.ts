import { z } from 'zod';
import { isValidPkMobile } from '@/lib/auth/phone';

export function createRegisterSchema(t: (key: string) => string) {
  return z.object({
    restaurantName: z.string().min(2, t('auth.restaurantNameRequired')).max(80),
    ownerName: z.string().min(2, t('auth.ownerNameRequired')).max(60),
    phone: z
      .string()
      .min(1, t('auth.phoneRequired'))
      .refine(isValidPkMobile, t('auth.phoneInvalid')),
    password: z.string().min(8, t('auth.passwordMinLength')),
    whatsappNumber: z
      .string()
      .refine(
        (val) => !val || val.trim() === '' || isValidPkMobile(val),
        t('auth.whatsappInvalid')
      ),
    cityId: z.string().optional(),
    description: z.string().max(500)
  });
}

export type RegisterFormValues = z.infer<ReturnType<typeof createRegisterSchema>>;
