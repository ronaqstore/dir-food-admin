'use client';

import * as React from 'react';
import { useSession } from 'next-auth/react';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, Link } from '@/i18n/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar
} from '@/components/ui/sidebar';
import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { getNavGroupsForRole } from '@/config/nav-config';
import { isRtlLocale, type AppLocale } from '@/i18n/request';
import type { NavGroup, NavItem, SessionUserShape } from '@/types';

function translateMaybe(key: string, t: ReturnType<typeof useTranslations>): string {
  const translated = t(key);
  return translated.startsWith('MISSING_MESSAGE') ? key : translated;
}

function filterNavGroups(
  groups: NavGroup[],
  query: string,
  labelOf: (key: string) => string
): NavGroup[] {
  const q = query.trim().toLowerCase();
  if (!q) return groups;

  return groups
    .map((group) => {
      const items = group.items.flatMap((item): NavItem[] => {
        const titleMatch = labelOf(item.title).toLowerCase().includes(q);
        if (titleMatch) return [item];
        return [];
      });

      return { ...group, items };
    })
    .filter((group) => group.items.length > 0);
}

export function AppSidebar() {
  const { data: session } = useSession();
  const t = useTranslations();
  const locale = useLocale() as AppLocale;
  const isRtl = isRtlLocale(locale);
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();
  const user = session?.user as SessionUserShape | undefined;
  const isPlatformAdmin = user?.role === 'PLATFORM_ADMIN';

  const labelOf = React.useCallback((key: string) => translateMaybe(key, t), [t]);
  const groups = React.useMemo(() => getNavGroupsForRole(user?.role), [user?.role]);
  const [search, setSearch] = React.useState('');

  const visibleGroups = React.useMemo(
    () => filterNavGroups(groups, search, labelOf),
    [groups, search, labelOf]
  );
  const isSearching = search.trim().length > 0;

  const closeMobileNav = React.useCallback(() => {
    if (isMobile) setOpenMobile(false);
  }, [isMobile, setOpenMobile]);

  return (
    <Sidebar side={isRtl ? 'right' : 'left'} dir={isRtl ? 'rtl' : 'ltr'} collapsible='icon'>
      <SidebarHeader className='border-b border-sidebar-border px-3 py-3'>
        <div className='flex items-center gap-3 px-1'>
          <div className='bg-primary text-primary-foreground flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-bold shadow-sm'>
            <Icons.pizza className='h-5 w-5' />
          </div>
          <div className='flex flex-col truncate leading-tight group-data-[collapsible=icon]:hidden'>
            <span className='text-sidebar-foreground truncate text-sm font-semibold'>
              {isPlatformAdmin
                ? t('nav.platformAdminBrand')
                : user?.restaurantName || t('common.appName')}
            </span>
            <span className='text-muted-foreground truncate text-[11px]'>
              {isPlatformAdmin ? t('auth.platformAdminTitle') : t('nav.restaurantOwner')}
            </span>
          </div>
        </div>
        <div className='relative mt-2 group-data-[collapsible=icon]:hidden'>
          <Icons.search className='text-muted-foreground pointer-events-none absolute top-1/2 start-2 size-4 -translate-y-1/2' />
          <SidebarInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('nav.searchTabs')}
            aria-label={t('nav.search')}
            className='ps-8 pe-8'
          />
          {isSearching ? (
            <button
              type='button'
              aria-label={t('table.clear')}
              className='text-muted-foreground hover:text-foreground absolute top-1/2 end-2 -translate-y-1/2 cursor-pointer'
              onClick={() => setSearch('')}
            >
              <Icons.close className='size-4' />
            </button>
          ) : null}
        </div>
      </SidebarHeader>

      <SidebarContent className='overflow-x-hidden'>
        {visibleGroups.length === 0 ? (
          <div className='text-muted-foreground px-3 py-6 text-center text-sm group-data-[collapsible=icon]:hidden'>
            {t('nav.noMatchingTabs')}
          </div>
        ) : null}
        {visibleGroups.map((group) => (
          <SidebarGroup key={group.label || 'ungrouped'} className='py-1'>
            {group.label ? (
              <SidebarGroupLabel className='text-muted-foreground px-3 text-xs font-medium tracking-wider uppercase'>
                {labelOf(group.label)}
              </SidebarGroupLabel>
            ) : null}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const IconComponent = item.icon ? Icons[item.icon] : Icons.logo;
                  const title = labelOf(item.title);
                  const isActive =
                    pathname === item.url ||
                    (item.url !== '/dashboard/overview' &&
                      item.url !== '/dashboard/platform' &&
                      item.url !== '/dashboard/settings' &&
                      pathname.startsWith(`${item.url}/`));

                  return (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton
                        render={<Link href={item.url} aria-label={title} onClick={closeMobileNav} />}
                        isActive={isActive}
                        tooltip={title}
                        className={
                          isActive
                            ? 'bg-sidebar-accent text-sidebar-accent-foreground text-start font-medium'
                            : 'text-start'
                        }
                      >
                        <IconComponent className='h-4 w-4 shrink-0' />
                        <span className='truncate'>{title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className='border-t border-sidebar-border p-3 group-data-[collapsible=icon]:hidden'>
        <div className='text-muted-foreground flex items-center justify-between px-1 text-xs'>
          <span className='truncate'>{user?.name}</span>
          <Badge variant='outline' className='px-1.5 py-0 text-[10px]'>
            {isPlatformAdmin ? t('nav.adminBadge') : t('nav.ownerBadge')}
          </Badge>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
