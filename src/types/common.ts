import type * as React from 'react';
import type { ComponentProps, ReactNode } from 'react';
import type { NextIntlClientProvider } from 'next-intl';
import type { IconProps } from '@tabler/icons-react';
import type { ActionId, ActionImpl } from 'kbar';

export interface AppearanceProviderProps {
  children: ReactNode;
}

export type I18nProviderProps = ComponentProps<typeof NextIntlClientProvider>;

export type Icon = React.ComponentType<IconProps>;

export interface KBarProps {
  children: ReactNode;
}

export interface KBarComponentProps {
  children: ReactNode;
}

export interface ResultItemProps {
  action: ActionImpl;
  active: boolean;
  currentRootActionId: ActionId;
}

export type Surface = 'ios' | 'android' | 'desktop';

export interface InstallPromptProps {
  variant?: 'banner' | 'menu' | 'both';
  className?: string;
}

export interface PwaShellProps {
  children: ReactNode;
}

export type ThemeContextType = {
  activeTheme: string;
  setActiveTheme: (theme: string) => void;
};

export interface ActiveThemeProviderProps {
  children: ReactNode;
  initialTheme?: string;
}

export interface UseControllableStateParams<T> {
  prop?: T | undefined;
  defaultProp?: T | undefined;
  onChange?: (state: T) => void;
}

export type SetStateFn<T> = (prevState?: T) => T;

export interface ThemeTransitionOrigin {
  clientX: number;
  clientY: number;
}

export interface InstallPromptUserChoice {
  outcome: 'accepted' | 'dismissed';
}

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<InstallPromptUserChoice>;
}

export interface RelatedApp {
  platform: string;
  url?: string;
  id?: string;
}

export interface NavigatorWithRelatedApps extends Navigator {
  getInstalledRelatedApps?: () => Promise<RelatedApp[]>;
}

export type IdKeyed = { id: string };

export interface NotFoundViewProps {
  onBack: () => void;
  onHome: () => void;
}

export interface DateFieldShellProps {
  name: string;
  label: string;
  description?: string;
  required?: boolean;
  isInvalid: boolean;
  errors?: unknown[];
  hasValue: boolean;
  displayText: ReactNode;
  children: ReactNode;
}

export interface RowAction {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: React.ComponentType<{ className?: string }>;
  variant?: 'default' | 'destructive';
  className?: string;
  disabled?: boolean;
}

export interface RowActionsMenuProps {
  actions: RowAction[];
}

export interface ErrorContentProps {
  error: Error & { digest?: string };
  reset: () => void;
  t: (key: string) => string;
}

export interface AppErrorViewProps {
  error: Error & { digest?: string };
  reset: () => void;
  staticFallback?: boolean;
}

export interface NotFoundContentProps extends NotFoundViewProps {
  t: (key: string) => string;
}

export interface NotFoundViewRootProps extends NotFoundViewProps {
  staticFallback?: boolean;
}

export interface RestaurantNameAvailabilityProps {
  name: string;
  onAvailabilityChange?: (isAvailable: boolean) => void;
  className?: string;
}

export interface TrialBadgeProps {
  subscriptionEndsAt?: string | null;
  className?: string;
}

export interface LocaleOption {
  code: 'en' | 'ur' | 'ps';
  label: string;
  nativeName: string;
}
