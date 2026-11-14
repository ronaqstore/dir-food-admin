import type { ReactNode } from 'react';

export interface AppErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export interface RootLayoutProps {
  children: ReactNode;
}

export interface LocaleDashboardErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export interface DashboardLayoutProps {
  children: ReactNode;
}

export interface LocaleAppErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export type LocaleParam = {
  locale: string;
};

export type ToSearchParam = {
  to?: string;
};

export type TokenSearchParam = {
  token?: string;
};

export interface LocaleLayoutProps {
  children: ReactNode;
  params: Promise<LocaleParam>;
}

export interface RootPageProps {
  searchParams: Promise<ToSearchParam>;
}

export interface SetupPasswordPageProps {
  searchParams: Promise<TokenSearchParam>;
}

export interface DashboardPageProps {
  params: Promise<LocaleParam>;
}
