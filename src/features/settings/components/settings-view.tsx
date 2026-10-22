'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { ProfileTab } from './profile-tab';
import { HoursTab } from './hours-tab';
import { DeliveryAreasTab } from './delivery-areas-tab';
import { QrCodeTab } from './qr-code-tab';
import { AppearanceSettings } from '@/features/appearance/components/appearance-settings';

export function SettingsView() {
  const t = useTranslations();
  const [activeTab, setActiveTab] = React.useState<
    'profile' | 'hours' | 'delivery' | 'qrcode' | 'appearance'
  >('profile');

  return (
    <div className='flex min-h-0 min-w-0 flex-1 flex-col space-y-6 overflow-y-auto overscroll-y-contain pb-6'>
      <div>
        <h1 className='text-2xl font-bold tracking-tight text-foreground'>
          {t('restaurantSettings.title')}
        </h1>
        <p className='text-sm text-muted-foreground'>{t('restaurantSettings.description')}</p>
      </div>

      <div className='flex shrink-0 items-center gap-2 overflow-x-auto border-b pb-2'>
        <Button
          type='button'
          variant={activeTab === 'profile' ? 'default' : 'ghost'}
          size='sm'
          onClick={() => setActiveTab('profile')}
          className='gap-2 text-xs'
        >
          <Icons.building className='size-4' />
          <span>{t('restaurantSettings.tabProfile')}</span>
        </Button>

        <Button
          type='button'
          variant={activeTab === 'hours' ? 'default' : 'ghost'}
          size='sm'
          onClick={() => setActiveTab('hours')}
          className='gap-2 text-xs'
        >
          <Icons.clock className='size-4' />
          <span>{t('restaurantSettings.tabHours')}</span>
        </Button>

        <Button
          type='button'
          variant={activeTab === 'delivery' ? 'default' : 'ghost'}
          size='sm'
          onClick={() => setActiveTab('delivery')}
          className='gap-2 text-xs'
        >
          <Icons.truck className='size-4' />
          <span>{t('restaurantSettings.tabDelivery')}</span>
        </Button>

        <Button
          type='button'
          variant={activeTab === 'qrcode' ? 'default' : 'ghost'}
          size='sm'
          onClick={() => setActiveTab('qrcode')}
          className='gap-2 text-xs'
        >
          <Icons.qrCode className='size-4' />
          <span>{t('restaurantSettings.tabQrCode')}</span>
        </Button>

        <Button
          type='button'
          variant={activeTab === 'appearance' ? 'default' : 'ghost'}
          size='sm'
          onClick={() => setActiveTab('appearance')}
          className='gap-2 text-xs'
        >
          <Icons.palette className='size-4' />
          <span>{t('nav.appearance')}</span>
        </Button>
      </div>

      {activeTab === 'profile' ? <ProfileTab /> : null}
      {activeTab === 'hours' ? <HoursTab /> : null}
      {activeTab === 'delivery' ? <DeliveryAreasTab /> : null}
      {activeTab === 'qrcode' ? <QrCodeTab /> : null}
      {activeTab === 'appearance' ? <AppearanceSettings /> : null}
    </div>
  );
}
