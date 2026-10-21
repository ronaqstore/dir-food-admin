import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { AppHeader } from '@/components/layout/app-header';
import { cookies } from 'next/headers';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get('sidebar_state')?.value !== 'false';

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar />
      <SidebarInset className='flex h-dvh max-h-dvh min-h-0 min-w-0 flex-col overflow-x-clip overflow-y-hidden scroll-mt-16 bg-background'>
        <AppHeader />
        <main className='flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden p-4 md:p-6'>{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
