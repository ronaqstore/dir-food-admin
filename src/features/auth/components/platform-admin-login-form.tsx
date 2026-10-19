'use client';

import { signIn, getSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { PLATFORM_ADMIN_DEFAULT_REDIRECT } from '@/lib/auth/routes';
import type { LoginValues } from '@/types/auth';
import { BaseLoginForm } from './base-login-form';

export function PlatformAdminLoginForm() {
  const t = useTranslations();
  const router = useRouter();

  const handleLogin = async (values: LoginValues): Promise<string | null> => {
    const result = await signIn('credentials', {
      identifier: values.phone.trim(),
      password: values.password,
      loginType: 'platform-admin',
      redirect: false
    });

    if (result?.error) {
      return t('auth.platformAdminError');
    }

    await getSession();
    router.replace(PLATFORM_ADMIN_DEFAULT_REDIRECT);
    router.refresh();
    return null;
  };

  return (
    <BaseLoginForm
      title={t('auth.platformAdminSignInTitle')}
      description={t('auth.platformAdminSignInDesc')}
      minPasswordLength={8}
      onSubmit={handleLogin}
      footer={
        <div className='space-y-2 text-center text-xs leading-relaxed'>
          <p className='text-muted-foreground'>
            {t('auth.platformAdminNotice')}
          </p>
          <p className='text-muted-foreground'>
            <Link
              href='/login'
              className='text-foreground font-medium underline-offset-4 hover:underline'
            >
              {t('auth.signIn')}
            </Link>
          </p>
        </div>
      }
    />
  );
}
