import KBar from '@/components/kbar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { AppHeader } from '@/components/layout/app-header';
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav';
import { cookies } from 'next/headers';
import { getTranslations } from 'next-intl/server';
import type { DashboardLayoutProps } from '@/types';

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const cookieStore = await cookies();
  const t = await getTranslations();
  const defaultOpen = cookieStore.get('sidebar_state')?.value !== 'false';

  return (
    <KBar>
      <SidebarProvider defaultOpen={defaultOpen}>
        <a
          href='#main-content'
          className='bg-background ring-ring sr-only rounded-md px-3 py-2 text-sm font-medium shadow focus:not-sr-only focus:absolute focus:top-2 focus:start-2 focus:z-50 focus:ring-2'
        >
          {t('aria.skipToContent')}
        </a>
        <AppSidebar />
        <SidebarInset
          id='main-content'
          tabIndex={-1}
          className='bg-background flex h-dvh max-h-dvh min-h-0 min-w-0 flex-col overflow-x-clip overflow-y-hidden scroll-mt-16'
        >
          <AppHeader />
          <main className='flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden p-4 pb-[max(1rem,calc(4.5rem+env(safe-area-inset-bottom)))] md:p-6 lg:pb-6'>
            {children}
          </main>
          <MobileBottomNav />
        </SidebarInset>
      </SidebarProvider>
    </KBar>
  );
}
