import { Suspense } from 'react';
import { SetupPasswordForm } from '@/features/auth/components/setup-password-form';
import type { Metadata } from 'next';
import { APP_NAME } from '@/config/site';

export const metadata: Metadata = {
  title: `Set Up Password | ${APP_NAME}`,
  description: 'Set your initial restaurant owner password via your one-time link.'
};

export default function SetupPasswordPage() {
  return (
    <div className='bg-background relative flex min-h-svh flex-col items-center justify-center overflow-hidden p-6'>
      <div
        aria-hidden
        className='pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(0.7_0.05_250_/_0.12),transparent_55%)]'
      />
      <div className='relative z-10 mb-8 text-center'>
        <p className='text-muted-foreground text-sm font-medium tracking-wide uppercase'>
          {APP_NAME}
        </p>
        <h1 className='mt-1 text-3xl font-semibold tracking-tight'>Account Setup</h1>
      </div>
      <div className='relative z-10 w-full max-w-md'>
        <Suspense fallback={<div className='bg-muted h-80 animate-pulse rounded-xl' />}>
          <SetupPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
