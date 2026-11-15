'use client';

import * as React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { IconPhoto, IconUpload, IconTrash } from '@tabler/icons-react';
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
      <div className='border-b pb-3 space-y-1'>
        <h3 className='text-base font-semibold text-foreground'>
          {t('restaurantSettings.mediaTitle')}
        </h3>
      </div>

      <div className='grid gap-6 sm:grid-cols-2'>
        <div className='space-y-3'>
          <div>
            <Label className='text-xs font-semibold text-foreground'>
              {t('restaurantSettings.logo')}
            </Label>
            <p className='text-[11px] text-muted-foreground mt-0.5'>
              {t('menuItems.photoHint')}
            </p>
          </div>
          <input
            ref={logoInputRef}
            type='file'
            accept='image/jpeg,image/png,image/webp'
            className='hidden'
            onChange={handleLogoChange}
          />
          <div className='flex items-center gap-4'>
            <div className='relative size-24 shrink-0 overflow-hidden rounded-2xl border-2 border-dashed border-border/80 bg-muted/30 shadow-xs flex items-center justify-center'>
              {logoUrl ? (
                <Image src={logoUrl} alt={t('logo')} fill unoptimized className='object-cover' />
              ) : (
                <IconPhoto className='size-8 text-muted-foreground/40' />
              )}
            </div>
            <div className='flex flex-col gap-2'>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={handleLogoClick}
                disabled={isPending}
                className='gap-1.5 h-8 text-xs'
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
                  className='h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5 justify-start'
                >
                  <IconTrash className='size-3.5' />
                  <span>{t('restaurantSettings.removePhoto')}</span>
                </Button>
              ) : null}
            </div>
          </div>
        </div>

        <div className='space-y-3'>
          <div>
            <Label className='text-xs font-semibold text-foreground'>
              {t('restaurantSettings.cover')}
            </Label>
            <p className='text-[11px] text-muted-foreground mt-0.5'>
              {t('menuItems.photoHint')}
            </p>
          </div>
          <input
            ref={coverInputRef}
            type='file'
            accept='image/jpeg,image/png,image/webp'
            className='hidden'
            onChange={handleCoverChange}
          />
          <div className='flex items-center gap-4'>
            <div className='relative h-24 w-36 sm:w-48 shrink-0 overflow-hidden rounded-2xl border-2 border-dashed border-border/80 bg-muted/30 shadow-xs flex items-center justify-center'>
              {coverUrl ? (
                <Image src={coverUrl} alt={t('cover')} fill unoptimized className='object-cover' />
              ) : (
                <IconPhoto className='size-8 text-muted-foreground/40' />
              )}
            </div>
            <div className='flex flex-col gap-2'>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={handleCoverClick}
                disabled={isPending}
                className='gap-1.5 h-8 text-xs'
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
                  className='h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5 justify-start'
                >
                  <IconTrash className='size-3.5' />
                  <span>{t('restaurantSettings.removePhoto')}</span>
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
