import { NavGroup } from '@/types';

export const platformNavGroups: NavGroup[] = [
  {
    label: 'nav.group.overview',
    items: [
      {
        title: 'nav.platformOverview',
        url: '/dashboard/platform',
        icon: 'dashboard',
        isActive: false,
        shortcut: ['p', 'o'],
        items: []
      }
    ]
  },
  {
    label: 'nav.group.management',
    items: [
      {
        title: 'nav.restaurants',
        url: '/dashboard/platform/restaurants',
        icon: 'building',
        isActive: false,
        shortcut: ['p', 'r'],
        items: []
      },
      {
        title: 'nav.subscriptions',
        url: '/dashboard/platform/subscriptions',
        icon: 'creditCard',
        isActive: false,
        shortcut: ['p', 's'],
        items: []
      },
      {
        title: 'nav.settings',
        url: '/dashboard/platform/settings',
        icon: 'settings',
        isActive: false,
        shortcut: ['p', 'a'],
        items: []
      }
    ]
  },
  {
    label: 'nav.group.settings',
    items: [
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
