'use client';

import { useTranslations } from 'next-intl';
import { Button, type ButtonProps } from '@/components/ui/button';

export interface LoadingButtonProps extends ButtonProps {
  loading?: boolean;
  loadingLabel?: string;
}

export function LoadingButton({
  loading = false,
  isLoading,
  loadingLabel,
  children,
  ...props
}: LoadingButtonProps) {
  const t = useTranslations();
  const busy = isLoading || loading;
  const resolvedLoadingLabel = loadingLabel ?? t('common.loading');

  return (
    <>
      <Button type='button' {...props} isLoading={busy}>
        {children}
      </Button>
      <span role='status' aria-live='polite' className='sr-only'>
        {busy ? resolvedLoadingLabel : ''}
      </span>
    </>
  );
}
