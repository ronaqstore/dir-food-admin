'use client';

import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { usePathname, Link } from '@/i18n/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail
} from '@/components/ui/sidebar';
import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import type { SessionUserShape } from '@/types/auth';

export function AppSidebar() {
  const { data: session } = useSession();
  const t = useTranslations();
  const pathname = usePathname();
  const user = session?.user as SessionUserShape | undefined;
  const isPlatformAdmin = user?.role === 'PLATFORM_ADMIN';

  const ownerNavItems = [
    {
      title: t('nav.dashboard'),
      href: '/dashboard/overview',
      icon: Icons.dashboard
    },
    {
      title: t('nav.orders'),
      href: '/dashboard/orders',
      icon: Icons.receipt
    },
    {
      title: t('nav.menuItems'),
      href: '/dashboard/menu',
      icon: Icons.pizza
    },
    {
      title: t('nav.menuCategories'),
      href: '/dashboard/categories',
      icon: Icons.tag
    },
    {
      title: t('nav.tables'),
      href: '/dashboard/tables',
      icon: Icons.building
    },
    {
      title: t('nav.settings'),
      href: '/dashboard/settings',
      icon: Icons.settings
    }
  ];

  const adminNavItems = [
    {
      title: t('nav.platformOverview'),
      href: '/dashboard/platform',
      icon: Icons.dashboard
    },
    {
      title: t('nav.restaurants'),
      href: '/dashboard/platform/restaurants',
      icon: Icons.building
    },
    {
      title: t('nav.subscriptions'),
      href: '/dashboard/platform/subscriptions',
      icon: Icons.creditCard
    },
    {
      title: t('nav.settings'),
      href: '/dashboard/platform/settings',
      icon: Icons.settings
    }
  ];

  const navItems = isPlatformAdmin ? adminNavItems : ownerNavItems;

  return (
    <Sidebar collapsible='icon'>
      <SidebarHeader className='border-b border-sidebar-border px-4 py-3'>
        <div className='flex items-center gap-3'>
          <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold shadow-sm'>
            <Icons.pizza className='h-5 w-5' />
          </div>
          <div className='flex flex-col truncate leading-tight'>
            <span className='font-semibold text-sm truncate text-sidebar-foreground'>
              {isPlatformAdmin ? 'Dir Food Admin' : user?.restaurantName || 'Dir Food'}
            </span>
            <span className='text-[11px] text-muted-foreground truncate'>
              {isPlatformAdmin ? t('auth.platformAdminTitle') : t('nav.restaurantOwner')}
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className='text-xs font-medium text-muted-foreground uppercase tracking-wider px-3'>
            {isPlatformAdmin ? t('nav.group.management') : t('nav.group.overview')}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== '/dashboard/overview' &&
                    item.href !== '/dashboard/platform' &&
                    pathname.startsWith(item.href));
                const IconComponent = item.icon;

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      isActive={isActive}
                      tooltip={item.title}
                      className={
                        isActive
                          ? 'font-medium bg-sidebar-accent text-sidebar-accent-foreground'
                          : ''
                      }
                    >
                      <IconComponent className='h-4 w-4 shrink-0' />
                      <span className='truncate'>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className='border-t border-sidebar-border p-3'>
        <div className='flex items-center justify-between text-xs text-muted-foreground px-1'>
          <span className='truncate'>{user?.name}</span>
          <Badge variant='outline' className='text-[10px] px-1.5 py-0'>
            {isPlatformAdmin ? 'Admin' : 'Owner'}
          </Badge>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
