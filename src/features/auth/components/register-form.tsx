'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { toast } from 'sonner';
import { useAppForm } from '@/lib/form';
import { FieldGroup } from '@/components/ui/field';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Icons } from '@/components/icons';
import { createRegisterSchema, type RegisterFormValues } from '../schemas/register.schema';
import { registerRestaurant } from '../api/auth.service';
import { normalizePhone } from '@/lib/auth/phone';
import { RestaurantNameAvailability } from './restaurant-name-availability';

export function RegisterForm() {
  const t = useTranslations();
  const router = useRouter();

  const [error, setError] = useState<string | null>(null);

  const registerSchema = createRegisterSchema(t);

  const form = useAppForm({
    defaultValues: {
      restaurantName: '',
      ownerName: '',
      phone: '',
      password: '',
      whatsappNumber: '',
      description: ''
    } as RegisterFormValues,
    validators: {
      onSubmit: registerSchema
    },
    onSubmit: async ({ value }) => {
      setError(null);
      try {
        const payload = {
          restaurantName: value.restaurantName.trim(),
          ownerName: value.ownerName.trim(),
          phone: normalizePhone(value.phone),
          password: value.password,
          whatsappNumber: value.whatsappNumber?.trim()
            ? normalizePhone(value.whatsappNumber)
            : undefined,
          description: value.description?.trim() || undefined
        };

        await registerRestaurant(payload);

        toast.success(
          t('auth.registerSuccess') ??
            'Restaurant registered successfully! Your account is pending admin approval.'
        );

        router.push('/login');
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : (t('auth.registerFailed') ?? 'Registration failed. Please check your details.');
        setError(message);
      }
    }
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    form.handleSubmit();
  };

  return (
    <Card className='w-full max-w-lg border-border/60 shadow-sm'>
      <CardHeader className='space-y-1'>
        <CardTitle className='text-2xl font-semibold tracking-tight'>
          {t('auth.registerTitle')}
        </CardTitle>
        <CardDescription>{t('auth.registerHint')}</CardDescription>
      </CardHeader>

      <CardContent>
        <form className='flex flex-col gap-6' onSubmit={handleSubmit}>
          {error ? (
            <Alert variant='destructive'>
              <Icons.warning className='size-4' />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <FieldGroup className='gap-4'>
            {/* Restaurant Name */}
            <form.AppField
              name='restaurantName'
              children={(field) => (
                <div className='flex flex-col gap-1.5'>
                  <field.TextField
                    label={t('auth.restaurantName')}
                    placeholder={t('auth.restaurantNamePlaceholder')}
                    startIcon={Icons.building}
                    required
                  />
                  <RestaurantNameAvailability name={field.state.value} />
                </div>
              )}
            />

            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              {/* Owner Name */}
              <form.AppField
                name='ownerName'
                children={(field) => (
                  <field.TextField
                    label={t('auth.ownerName')}
                    placeholder={t('auth.ownerNamePlaceholder')}
                    startIcon={Icons.user}
                    autoComplete='name'
                    required
                  />
                )}
              />

              {/* Owner Mobile Phone */}
              <form.AppField
                name='phone'
                children={(field) => (
                  <field.TextField
                    label={t('auth.phone')}
                    type='tel'
                    inputMode='numeric'
                    autoComplete='tel'
                    placeholder='03001234567'
                    startIcon={Icons.phone}
                    required
                  />
                )}
              />
            </div>

            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              {/* Password */}
              <form.AppField
                name='password'
                children={(field) => (
                  <field.TextField
                    label={t('auth.password')}
                    type='password'
                    autoComplete='new-password'
                    placeholder='••••••••'
                    startIcon={Icons.lock}
                    required
                  />
                )}
              />

              {/* WhatsApp Number (Optional) */}
              <form.AppField
                name='whatsappNumber'
                children={(field) => (
                  <field.TextField
                    label={t('auth.whatsappNumber')}
                    type='tel'
                    inputMode='numeric'
                    autoComplete='tel'
                    placeholder='03001234567 (optional)'
                    startIcon={Icons.whatsapp}
                  />
                )}
              />
            </div>

            {/* Short Description */}
            <form.AppField
              name='description'
              children={(field) => (
                <field.TextField
                  label={t('auth.description')}
                  placeholder={t('auth.descriptionPlaceholder')}
                  startIcon={Icons.post}
                />
              )}
            />
          </FieldGroup>

          <form.AppForm>
            <form.SubmitButton size='lg' className='w-full'>
              {t('auth.registerButton')}
            </form.SubmitButton>
          </form.AppForm>

          <div className='text-center text-xs leading-relaxed text-muted-foreground'>
            <p>
              {t('auth.haveAccountPrompt')}{' '}
              <Link
                href='/login'
                className='text-foreground font-medium underline-offset-4 hover:underline'
              >
                {t('auth.signInLink')}
              </Link>
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
