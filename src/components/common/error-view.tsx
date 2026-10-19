'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import { Button } from '@/components/ui/button';
import { useT } from '@/i18n/use-t';
import type { AppErrorProps } from '@/types/pages';

import { t as staticT } from '@/i18n/static-t';

function isChunkLoadError(error: Error): boolean {
  return (
    error.name === 'ChunkLoadError' ||
    /Loading chunk [\d]+ failed/i.test(error.message) ||
    /Failed to fetch dynamically imported module/i.test(error.message)
  );
}

interface ErrorContentProps extends AppErrorProps {
  t: (key: string) => string;
}

function ErrorViewContent({ error, reset, t }: ErrorContentProps) {
  useEffect(() => {
    Sentry.captureException(error);
    if (isChunkLoadError(error)) {
      const key = 'pwa-chunk-reload';
      try {
        if (!sessionStorage.getItem(key)) {
          sessionStorage.setItem(key, '1');
          window.location.reload();
          return;
        }
      } catch (storageErr) {
        Sentry.captureException(storageErr);
      }
    }
  }, [error]);

  return (
    <div className='flex h-[calc(100vh-4rem)] flex-col items-center justify-center gap-4 text-center'>
      <div className='space-y-2'>
        <h1 className='text-2xl font-bold tracking-tight'>{t('common.somethingWentWrong')}</h1>
        <p className='text-muted-foreground text-sm max-w-md'>
          {error.message || t('common.unexpectedError')}
        </p>
      </div>
      <div className='flex gap-2'>
        <Button type='button' onClick={reset} variant='default'>
          {t('common.tryAgain')}
        </Button>
        <Button type='button' onClick={() => window.location.reload()} variant='outline'>
          {t('common.reloadPage')}
        </Button>
      </div>
    </div>
  );
}

function LocalizedErrorView({ error, reset }: AppErrorProps) {
  const t = useT();
  return <ErrorViewContent error={error} reset={reset} t={(key) => t(key as never)} />;
}

function StaticErrorView({ error, reset }: AppErrorProps) {
  return <ErrorViewContent error={error} reset={reset} t={staticT} />;
}

export function ErrorView({
  error,
  reset,
  staticFallback = false
}: AppErrorProps & { staticFallback?: boolean }) {
  if (staticFallback) {
    return <StaticErrorView error={error} reset={reset} />;
  }
  return <LocalizedErrorView error={error} reset={reset} />;
}
