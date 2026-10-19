'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { LocaleSwitcher } from './locale-switcher';
import { ThemeModeToggle } from '@/components/themes/theme-mode-toggle';
import { UserNav } from './user-nav';

export function AppHeader() {
  return (
    <header className='sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b border-border/60 bg-background/95 px-4 backdrop-blur-sm'>
      <div className='flex items-center gap-2'>
        <SidebarTrigger className='-ml-1' />
        <Separator orientation='vertical' className='mr-2 h-4' />
      </div>

      <div className='flex items-center gap-2'>
        <LocaleSwitcher />
        <ThemeModeToggle />
        <Separator orientation='vertical' className='h-4' />
        <UserNav />
      </div>
    </header>
  );
}
