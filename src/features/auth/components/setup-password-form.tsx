'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { toast } from 'sonner';
import { useAppForm } from '@/lib/form';
import { FieldGroup } from '@/components/ui/field';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Icons } from '@/components/icons';
import { createSetupPasswordSchema } from '../schemas/setup-password.schema';
import { setupPassword } from '../api/auth.service';
import type { SetupPasswordValues } from '@/types';

export function SetupPasswordForm() {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [error, setError] = useState<string | null>(null);

  const setupPasswordSchema = createSetupPasswordSchema(t);

  const form = useAppForm({
    defaultValues: {
      password: '',
      confirmPassword: ''
    } as SetupPasswordValues,
    validators: {
      onSubmit: setupPasswordSchema
    },
    onSubmit: async ({ value }) => {
      setError(null);
      if (!token) {
        setError(t('auth.invalidSetupToken'));
        return;
      }

      try {
        await setupPassword({
          token,
          password: value.password
        });
        toast.success(t('auth.passwordSetupSuccess'));
        router.push('/login');
      } catch (err) {
        const message = err instanceof Error ? err.message : t('common.somethingWentWrong');
        setError(message);
      }
    }
  });

  if (!token) {
    return (
      <Card className='w-full max-w-md border-border/60 shadow-sm'>
        <CardHeader className='space-y-1'>
          <CardTitle className='text-2xl font-semibold tracking-tight'>
            {t('auth.setupPasswordTitle')}
          </CardTitle>
          <CardDescription>{t('auth.setupPasswordDesc')}</CardDescription>
        </CardHeader>
        <CardContent className='flex flex-col gap-4'>
          <Alert variant='destructive'>
            <Icons.warning className='size-4' />
            <AlertDescription>{t('auth.missingToken')}</AlertDescription>
          </Alert>
          <div className='text-center'>
            <Link
              href='/login'
              className='text-primary text-sm font-medium underline-offset-4 hover:underline'
            >
              {t('auth.backToSignIn')}
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    form.handleSubmit();
  };

  return (
    <Card className='w-full max-w-md border-border/60 shadow-sm'>
      <CardHeader className='space-y-1'>
        <CardTitle className='text-2xl font-semibold tracking-tight'>
          {t('auth.setupPasswordTitle')}
        </CardTitle>
        <CardDescription>{t('auth.setupPasswordDesc')}</CardDescription>
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
            <form.AppField
              name='confirmPassword'
              children={(field) => (
                <field.TextField
                  label={t('auth.confirmPassword')}
                  type='password'
                  autoComplete='new-password'
                  placeholder='••••••••'
                  startIcon={Icons.lock}
                  required
                />
              )}
            />
          </FieldGroup>

          <form.AppForm>
            <form.SubmitButton size='lg' className='w-full'>
              {t('auth.setPasswordButton')}
            </form.SubmitButton>
          </form.AppForm>

          <div className='text-center'>
            <Link
              href='/login'
              className='text-muted-foreground hover:text-foreground text-xs underline-offset-4 hover:underline'
            >
              {t('auth.backToSignIn')}
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
