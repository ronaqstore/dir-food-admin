'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { IconBuildingStore, IconClock, IconTruckDelivery } from '@tabler/icons-react';
import { ProfileTab } from './profile-tab';
import { HoursTab } from './hours-tab';
import { DeliveryAreasTab } from './delivery-areas-tab';

export function SettingsView() {
  const t = useTranslations();
  const [activeTab, setActiveTab] = React.useState<'profile' | 'hours' | 'delivery'>('profile');

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold tracking-tight text-foreground'>
          {t('restaurantSettings.title')}
        </h1>
        <p className='text-sm text-muted-foreground'>{t('restaurantSettings.description')}</p>
      </div>

      {/* Tabs navigation */}
      <div className='flex items-center gap-2 border-b pb-2 overflow-x-auto'>
        <Button
          variant={activeTab === 'profile' ? 'default' : 'ghost'}
          size='sm'
          onClick={() => setActiveTab('profile')}
          className='gap-2 text-xs'
        >
          <IconBuildingStore className='size-4' />
          <span>{t('restaurantSettings.tabProfile')}</span>
        </Button>

        <Button
          variant={activeTab === 'hours' ? 'default' : 'ghost'}
          size='sm'
          onClick={() => setActiveTab('hours')}
          className='gap-2 text-xs'
        >
          <IconClock className='size-4' />
          <span>{t('restaurantSettings.tabHours')}</span>
        </Button>

        <Button
          variant={activeTab === 'delivery' ? 'default' : 'ghost'}
          size='sm'
          onClick={() => setActiveTab('delivery')}
          className='gap-2 text-xs'
        >
          <IconTruckDelivery className='size-4' />
          <span>{t('restaurantSettings.tabDelivery')}</span>
        </Button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'profile' ? <ProfileTab /> : null}
      {activeTab === 'hours' ? <HoursTab /> : null}
      {activeTab === 'delivery' ? <DeliveryAreasTab /> : null}
    </div>
  );
}
