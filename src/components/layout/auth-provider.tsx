'use client';

import { SessionProvider } from 'next-auth/react';
import type { AuthProviderProps } from '@/types';

export function AuthProvider({ children }: AuthProviderProps) {
  return (
    <SessionProvider refetchOnWindowFocus={true} refetchInterval={60}>
      {children}
    </SessionProvider>
  );
}
