'use client';

import { useKBar } from 'kbar';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Breadcrumbs } from '@/components/breadcrumbs';
import SearchInput from '@/components/search-input';
import { LocaleSwitcher } from './locale-switcher';
import { ThemeSelector } from '@/components/themes/theme-selector';
import { ThemeModeToggle } from '@/components/themes/theme-mode-toggle';
import { UserNav } from './user-nav';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { useTranslations } from 'next-intl';
import { pageTitleKeyFromPath } from '@/lib/i18n/path-titles';
import { usePathname, useRouter } from '@/i18n/navigation';

function isDetailPath(pathname: string): boolean {
  const parts = pathname.split('/').filter(Boolean);
  if (parts[0] !== 'dashboard') return false;
  return parts.length >= 3;
}

export function AppHeader() {
  const t = useTranslations();
  const { query } = useKBar();
  const pathname = usePathname();
  const router = useRouter();
  const titleKey = pageTitleKeyFromPath(pathname);
  const title = titleKey ? t(titleKey) : t('common.appName');
  const showBack = isDetailPath(pathname);

  return (
    <header className='border-border/60 bg-background/95 sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-2 border-b pt-[env(safe-area-inset-top)] backdrop-blur-md'>
      <div className='flex min-w-0 flex-1 items-center gap-2 px-4'>
        {showBack ? (
          <Button
            type='button'
            variant='ghost'
            size='icon'
            className='size-9 shrink-0'
            aria-label={t('nav.back')}
            onClick={() => router.back()}
          >
            <Icons.chevronLeft className='size-5 rtl:rotate-180' />
          </Button>
        ) : (
          <SidebarTrigger className='-ms-1' aria-label={t('nav.menu')} />
        )}
        <Separator orientation='vertical' className='me-2 hidden h-4 sm:block' />
        <p className='truncate text-sm font-semibold sm:hidden'>{title}</p>
        <div className='hidden sm:block'>
          <Breadcrumbs />
        </div>
      </div>

      <div className='flex shrink-0 items-center gap-1 px-4 sm:gap-2'>
        <Button
          type='button'
          variant='ghost'
          size='icon'
          className='size-9 sm:hidden'
          aria-label={t('nav.search')}
          onClick={query.toggle}
        >
          <Icons.search className='size-5' />
        </Button>
        <div className='hidden md:flex'>
          <SearchInput />
        </div>
        <LocaleSwitcher />
        <ThemeModeToggle />
        <div className='hidden lg:block'>
          <ThemeSelector />
        </div>
        <Separator orientation='vertical' className='hidden h-4 sm:block' />
        <UserNav />
      </div>
    </header>
  );
}
