import { NavGroup } from '@/types';
import { platformNavGroups } from './platform-nav-config';

export const navGroups: NavGroup[] = [
  {
    label: 'nav.group.overview',
    items: [
      {
        title: 'nav.dashboard',
        url: '/dashboard/overview',
        icon: 'dashboard',
        isActive: false,
        shortcut: ['d', 'd'],
        items: []
      },
      {
        title: 'nav.orders',
        url: '/dashboard/orders',
        icon: 'receipt',
        isActive: false,
        shortcut: ['o', 'r'],
        items: []
      }
    ]
  },
  {
    label: 'nav.group.catalog',
    items: [
      {
        title: 'nav.menuItems',
        url: '/dashboard/menu',
        icon: 'pizza',
        isActive: false,
        shortcut: ['m', 'i'],
        items: []
      },
      {
        title: 'nav.deals',
        url: '/dashboard/deals',
        icon: 'sparkles',
        isActive: false,
        shortcut: ['d', 'l'],
        items: []
      },
      {
        title: 'nav.menuCategories',
        url: '/dashboard/categories',
        icon: 'tag',
        isActive: false,
        shortcut: ['c', 't'],
        items: []
      }
    ]
  },
  {
    label: 'nav.group.settings',
    items: [
      {
        title: 'nav.settings',
        url: '/dashboard/settings',
        icon: 'settings',
        isActive: false,
        shortcut: ['s', 's'],
        items: []
      },
      {
        title: 'nav.appearance',
        url: '/dashboard/settings/appearance',
        icon: 'palette',
        isActive: false,
        shortcut: ['a', 'p'],
        items: []
      }
    ]
  }
];

export function getNavGroupsForRole(role?: string): NavGroup[] {
  if (role === 'PLATFORM_ADMIN') {
    return platformNavGroups;
  }
  return navGroups;
}
