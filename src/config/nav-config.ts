import { NavGroup } from '@/types';
import { platformNavGroups } from './platform-nav-config';

export const navGroups: NavGroup[] = [
  {
    label: 'Restaurant',
    items: [
      {
        title: 'Overview',
        url: '/dashboard/overview',
        icon: 'dashboard',
        isActive: true,
        shortcut: ['o', 'o'],
        items: []
      },
      {
        title: 'Menu Items',
        url: '/dashboard/menu',
        icon: 'product',
        isActive: false,
        shortcut: ['m', 'i'],
        items: []
      },
      {
        title: 'Categories',
        url: '/dashboard/categories',
        icon: 'folder',
        isActive: false,
        shortcut: ['c', 't'],
        items: []
      }
    ]
  },
  {
    label: 'Operations',
    items: [
      {
        title: 'Delivery Coverage',
        url: '/dashboard/delivery',
        icon: 'truck',
        isActive: false,
        shortcut: ['d', 'c'],
        items: []
      },
      {
        title: 'Area Requests',
        url: '/dashboard/requests',
        icon: 'post',
        isActive: false,
        shortcut: ['a', 'r'],
        items: []
      }
    ]
  },
  {
    label: 'Settings',
    items: [
      {
        title: 'Restaurant Profile',
        url: '/dashboard/settings',
        icon: 'settings',
        isActive: false,
        shortcut: ['s', 's'],
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
