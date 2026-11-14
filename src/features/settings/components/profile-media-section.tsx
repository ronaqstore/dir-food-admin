'use client';

import * as React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { IconPhoto, IconUpload } from '@tabler/icons-react';
import type { ProfileMediaSectionProps } from '../types';

export function ProfileMediaSection({
  logoUrl,
  coverUrl,
  isPending,
  onUploadImage,
  onDeleteImage,
  t
}: ProfileMediaSectionProps) {
  const logoInputRef = React.useRef<HTMLInputElement>(null);
  const coverInputRef = React.useRef<HTMLInputElement>(null);

  const handleLogoClick = () => {
    logoInputRef.current?.click();
  };

  const handleCoverClick = () => {
    coverInputRef.current?.click();
  };

  const handleDeleteLogo = () => {
    onDeleteImage('logo');
  };

  const handleDeleteCover = () => {
    onDeleteImage('cover');
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUploadImage(e, 'logo');
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUploadImage(e, 'cover');
  };

  return (
    <div className='rounded-xl border bg-card p-6 shadow-xs space-y-6'>
      <h3 className='text-base font-semibold text-foreground border-b pb-3'>
        {t('restaurantSettings.mediaTitle')}
      </h3>

      <div className='grid gap-6 sm:grid-cols-2'>
        <div className='space-y-3'>
          <Label>{t('restaurantSettings.logo')}</Label>
          <input
            ref={logoInputRef}
            type='file'
            accept='image/jpeg,image/png,image/webp'
            className='hidden'
            onChange={handleLogoChange}
          />
          <div className='flex items-center gap-4'>
            <div className='relative size-20 shrink-0 overflow-hidden rounded-full border bg-muted flex items-center justify-center'>
              {logoUrl ? (
                <Image src={logoUrl} alt={t('logo')} fill unoptimized className='object-cover' />
              ) : (
                <IconPhoto className='size-8 text-muted-foreground/40' />
              )}
            </div>
            <div className='flex flex-wrap gap-2'>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={handleLogoClick}
                disabled={isPending}
                className='gap-1.5'
              >
                <IconUpload className='size-3.5' />
                <span>
                  {logoUrl
                    ? t('restaurantSettings.changeLogo')
                    : t('restaurantSettings.uploadLogo')}
                </span>
              </Button>
              {logoUrl ? (
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  onClick={handleDeleteLogo}
                  disabled={isPending}
                  className='text-destructive hover:text-destructive'
                >
                  {t('restaurantSettings.removePhoto')}
                </Button>
              ) : null}
            </div>
          </div>
        </div>

        <div className='space-y-3'>
          <Label>{t('restaurantSettings.cover')}</Label>
          <input
            ref={coverInputRef}
            type='file'
            accept='image/jpeg,image/png,image/webp'
            className='hidden'
            onChange={handleCoverChange}
          />
          <div className='flex items-center gap-4'>
            <div className='relative h-20 w-32 shrink-0 overflow-hidden rounded-lg border bg-muted flex items-center justify-center'>
              {coverUrl ? (
                <Image src={coverUrl} alt={t('cover')} fill unoptimized className='object-cover' />
              ) : (
                <IconPhoto className='size-8 text-muted-foreground/40' />
              )}
            </div>
            <div className='flex flex-wrap gap-2'>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={handleCoverClick}
                disabled={isPending}
                className='gap-1.5'
              >
                <IconUpload className='size-3.5' />
                <span>
                  {coverUrl
                    ? t('restaurantSettings.changeCover')
                    : t('restaurantSettings.uploadCover')}
                </span>
              </Button>
              {coverUrl ? (
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  onClick={handleDeleteCover}
                  disabled={isPending}
                  className='text-destructive hover:text-destructive'
                >
                  {t('restaurantSettings.removePhoto')}
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
