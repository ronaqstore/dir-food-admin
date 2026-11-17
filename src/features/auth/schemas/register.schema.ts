import { z } from 'zod';
import { isValidPkMobile, isReservedPhoneNumber } from '@/lib/auth/phone';

export function createRegisterSchema(t: (key: string) => string) {
  return z
    .object({
      restaurantName: z.string().min(2, t('auth.restaurantNameRequired')).max(80),
      ownerName: z.string().min(2, t('auth.ownerNameRequired')).max(60),
      phone: z
        .string()
        .min(1, t('auth.phoneRequired'))
        .refine(isValidPkMobile, t('auth.phoneInvalid'))
        .refine((val) => !isReservedPhoneNumber(val), 'This phone number is already in use'),
      password: z.string().min(8, t('auth.passwordMinLength')),
      confirmPassword: z.string().min(1, t('auth.confirmPasswordRequired')),
      whatsappNumber: z
        .string()
        .refine(
          (val) => !val || val.trim() === '' || isValidPkMobile(val),
          t('auth.whatsappInvalid')
        )
        .refine(
          (val) => !val || val.trim() === '' || !isReservedPhoneNumber(val),
          'This phone number is already in use'
        ),
      cityId: z.string().optional(),
      description: z.string().max(500)
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('auth.passwordMismatch'),
      path: ['confirmPassword']
    });
}

export type RegisterFormValues = z.infer<ReturnType<typeof createRegisterSchema>>;
