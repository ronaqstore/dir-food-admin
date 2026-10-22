import type { MetadataRoute } from 'next';
import {
  APP_DESCRIPTION,
  APP_ID,
  APP_NAME,
  APP_SHORT_NAME,
  PWA_BACKGROUND_COLOR,
  PWA_THEME_COLOR_LIGHT
} from '@/config/site';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: APP_NAME,
    short_name: APP_SHORT_NAME,
    description: APP_DESCRIPTION,
    id: APP_ID,
    lang: 'en',
    dir: 'auto',
    start_url: '/?source=pwa',
    scope: '/',
    display: 'standalone',
    display_override: ['standalone', 'minimal-ui'],
    orientation: 'any',
    theme_color: PWA_THEME_COLOR_LIGHT,
    background_color: PWA_BACKGROUND_COLOR,
    categories: ['business', 'food', 'productivity'],

    prefer_related_applications: false,
    related_applications: [
      {
        platform: 'webapp',
        url: '/manifest.webmanifest',
        id: APP_ID
      }
    ],
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icons/icon-512-maskable.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable'
      }
    ],
    screenshots: [
      {
        src: '/screenshots/wide.png',
        sizes: '1280x720',
        type: 'image/png',
        form_factor: 'wide',
        label: `${APP_NAME} desktop`
      },
      {
        src: '/screenshots/narrow.png',
        sizes: '750x1334',
        type: 'image/png',
        form_factor: 'narrow',
        label: `${APP_NAME} mobile`
      }
    ],

    shortcuts: [
      {
        name: 'Orders',
        short_name: 'Orders',
        description: 'View incoming WhatsApp order requests',
        url: '/?source=pwa&to=orders',
        icons: [{ src: '/icons/shortcut-sale.png', sizes: '96x96', type: 'image/png' }]
      },
      {
        name: 'Menu Items',
        short_name: 'Menu',
        description: 'Manage restaurant menu items',
        url: '/?source=pwa&to=menu',
        icons: [{ src: '/icons/shortcut-inventory.png', sizes: '96x96', type: 'image/png' }]
      },
      {
        name: 'Settings',
        short_name: 'Settings',
        description: 'Open restaurant settings',
        url: '/?source=pwa&to=settings',
        icons: [{ src: '/icons/shortcut-customer.png', sizes: '96x96', type: 'image/png' }]
      }
    ]
  };
}

