'use client';

import { ErrorView } from '@/components/common/error-view';
import type { GlobalErrorProps } from '@/types/pages';

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html lang='en'>
      <body>
        <ErrorView error={error} reset={reset} staticFallback />
      </body>
    </html>
  );
}
