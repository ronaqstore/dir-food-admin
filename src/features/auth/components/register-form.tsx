'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { toast } from 'sonner';
import { useAppForm } from '@/lib/form';
import { FieldGroup } from '@/components/ui/field';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { createRegisterSchema, type RegisterFormValues } from '../schemas/register.schema';
import { registerRestaurant } from '../api/auth.service';
import { normalizePhone } from '@/lib/auth/phone';

const POPULAR_CUISINES = [
  'Shinwari & Karahi',
  'BBQ & Grill',
  'Fast Food & Pizza',
  'Chapli Kabab',
  'Biryani & Pulao',
  'Traditional Desi',
  'Chinese'
];

export function RegisterForm() {
  const t = useTranslations();
  const router = useRouter();

  const [error, setError] = useState<string | null>(null);
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);

  const registerSchema = createRegisterSchema(t);

  const toggleCuisine = (cuisine: string) => {
    setSelectedCuisines((prev) => {
      if (prev.includes(cuisine)) {
        return prev.filter((c) => c !== cuisine);
      }
      if (prev.length >= 5) {
        return prev;
      }
      return [...prev, cuisine];
    });
  };

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
          description: value.description?.trim() || undefined,
          cuisines: selectedCuisines.length > 0 ? selectedCuisines : undefined
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
      <CardHeader className='space-y-1 text-center'>
        <div className='mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary'>
          <Icons.building className='h-6 w-6' />
        </div>
        <CardTitle className='text-2xl font-bold tracking-tight'>
          {t('auth.registerTitle')}
        </CardTitle>
        <CardDescription>
          {t('auth.registerHint')}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form className='space-y-5' onSubmit={handleSubmit}>
          {error ? (
            <Alert variant='destructive'>
              <Icons.warning className='h-4 w-4' />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <FieldGroup className='space-y-4'>
            {/* Restaurant Name */}
            <form.AppField
              name='restaurantName'
              children={(field) => (
                <field.TextField
                  label={t('auth.restaurantName')}
                  placeholder={t('auth.restaurantNamePlaceholder')}
                  startIcon={Icons.building}
                  required
                />
              )}
            />

            {/* Owner Name */}
            <form.AppField
              name='ownerName'
              children={(field) => (
                <field.TextField
                  label={t('auth.ownerName')}
                  placeholder={t('auth.ownerNamePlaceholder')}
                  startIcon={Icons.user}
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
                  placeholder='03001234567'
                  startIcon={Icons.phone}
                  required
                />
              )}
            />

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
                  placeholder='03001234567 (optional)'
                  startIcon={Icons.chat}
                />
              )}
            />

            {/* Short Description */}
            <form.AppField
              name='description'
              children={(field) => (
                <field.TextField
                  label={t('auth.description')}
                  placeholder={t('auth.descriptionPlaceholder')}
                />
              )}
            />

            {/* Popular Cuisines Selector */}
            <div className='space-y-2'>
              <label className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
                {t('auth.cuisines')}
              </label>
              <div className='flex flex-wrap gap-1.5'>
                {POPULAR_CUISINES.map((cuisine) => {
                  const isSelected = selectedCuisines.includes(cuisine);
                  return (
                    <Badge
                      key={cuisine}
                      variant={isSelected ? 'default' : 'outline'}
                      className='cursor-pointer select-none transition-colors'
                      onClick={() => toggleCuisine(cuisine)}
                    >
                      {isSelected ? '✓ ' : '+ '}
                      {cuisine}
                    </Badge>
                  );
                })}
              </div>
              <p className='text-xs text-muted-foreground'>
                {t('auth.cuisinesHint')}
              </p>
            </div>
          </FieldGroup>

          <form.AppForm>
            <form.SubmitButton className='w-full text-base font-semibold py-2.5'>
              {t('auth.registerButton')}
            </form.SubmitButton>
          </form.AppForm>

          <div className='text-center text-xs text-muted-foreground space-y-1'>
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
