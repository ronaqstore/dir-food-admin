import { NavGroup } from '@/types';

export const platformNavGroups: NavGroup[] = [
  {
    label: 'Platform Control',
    items: [
      {
        title: 'Overview',
        url: '/dashboard/platform',
        icon: 'dashboard',
        isActive: true,
        shortcut: ['p', 'o'],
        items: []
      },
      {
        title: 'Restaurants',
        url: '/dashboard/platform/restaurants',
        icon: 'building',
        isActive: false,
        shortcut: ['p', 'r'],
        items: []
      },
      {
        title: 'Areas & Cities',
        url: '/dashboard/platform/areas',
        icon: 'page',
        isActive: false,
        shortcut: ['p', 'a'],
        items: []
      },
      {
        title: 'Audit Logs',
        url: '/dashboard/platform/audit',
        icon: 'history',
        isActive: false,
        shortcut: ['p', 'l'],
        items: []
      }
    ]
  }
];
