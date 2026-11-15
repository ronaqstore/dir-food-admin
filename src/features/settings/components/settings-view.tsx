'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import {
  IconBuildingStore,
  IconClock,
  IconTruck,
  IconQrcode
} from '@tabler/icons-react';
import { ProfileTab } from './profile-tab';
import { HoursTab } from './hours-tab';
import { DeliveryAreasTab } from './delivery-areas-tab';
import { QrCodeTab } from './qr-code-tab';

export function SettingsView() {
  const t = useTranslations();
  const [activeTab, setActiveTab] = React.useState<'profile' | 'hours' | 'delivery' | 'qrcode'>('profile');

  const tabs = [
    {
      id: 'profile' as const,
      label: t('restaurantSettings.tabProfile'),
      icon: IconBuildingStore
    },
    {
      id: 'hours' as const,
      label: t('restaurantSettings.tabHours'),
      icon: IconClock
    },
    {
      id: 'delivery' as const,
      label: t('restaurantSettings.tabDelivery'),
      icon: IconTruck
    },
    {
      id: 'qrcode' as const,
      label: t('restaurantSettings.tabQrCode'),
      icon: IconQrcode
    }
  ];

  return (
    <div className='flex min-h-0 min-w-0 flex-1 flex-col space-y-6 overflow-y-auto overscroll-y-contain pb-12'>
      <div className='w-full min-w-0 space-y-6'>
        <div className='space-y-1'>
          <h1 className='text-2xl font-bold tracking-tight text-foreground'>
            {t('restaurantSettings.title')}
          </h1>
          <p className='text-sm text-muted-foreground'>{t('restaurantSettings.description')}</p>
        </div>

        <div className='flex items-center gap-1.5 p-1 rounded-xl bg-muted/60 border border-border/60 max-w-full overflow-x-auto no-scrollbar'>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type='button'
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-background text-foreground shadow-xs font-semibold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/40 font-medium'
                }`}
              >
                <tab.icon className={`size-4 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {activeTab === 'profile' ? <ProfileTab /> : null}
        {activeTab === 'hours' ? <HoursTab /> : null}
        {activeTab === 'delivery' ? <DeliveryAreasTab /> : null}
        {activeTab === 'qrcode' ? <QrCodeTab /> : null}
      </div>
    </div>
  );
}
