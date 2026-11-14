export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3011').replace(
  /\/+$/,
  ''
);

export const APP_BASE_URL =
  typeof window !== 'undefined'
    ? ''
    : (process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3012').replace(/\/+$/, '');

export const WHATSAPP_BASE_URL = 'https://wa.me';
export const STOREFRONT_BASE_URL = 'https://dirfood.pk';
