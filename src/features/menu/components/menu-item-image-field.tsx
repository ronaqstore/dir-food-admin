'use client';

import * as React from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { IconPhoto, IconUpload, IconTrash } from '@tabler/icons-react';
import type { MenuItemImageFieldProps } from '../types';

export function MenuItemImageField({
  imagePreview,
  name,
  isPending,
  onFileSelect,
  onRemovePhoto,
  t
}: MenuItemImageFieldProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      toast.error(t('menuItems.imageSizeLimit'));
      return;
    }

    onFileSelect(file);
  };

  return (
    <div className='space-y-1.5'>
      <div className='flex items-center justify-between'>
        <Label className='text-xs font-semibold text-foreground'>{t('menuItems.image')}</Label>
        <span className='text-[11px] text-muted-foreground'>{t('common.optional')}</span>
      </div>
      <input
        ref={fileInputRef}
        type='file'
        accept='image/jpeg,image/png,image/webp'
        className='hidden'
        onChange={handleFileChange}
      />
      <div className='flex items-center gap-4 rounded-xl border border-border/80 bg-muted/20 p-3 transition-colors hover:border-border'>
        <div className='relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border/80 bg-background shadow-2xs'>
          {imagePreview ? (
            <Image
              src={imagePreview}
              alt={name || t('menuItems.previewAlt')}
              fill
              unoptimized
              className='object-cover'
            />
          ) : (
            <div className='flex flex-col items-center justify-center text-muted-foreground/50'>
              <IconPhoto className='size-7 stroke-[1.5]' />
            </div>
          )}
        </div>
        <div className='min-w-0 flex-1 space-y-1.5'>
          <div className='flex flex-wrap items-center gap-2'>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={() => fileInputRef.current?.click()}
              disabled={isPending}
              className='h-8 gap-1.5 rounded-lg text-xs font-medium shadow-2xs'
            >
              <IconUpload className='size-3.5' />
              <span>
                {imagePreview ? t('menuItems.changeImage') : t('menuItems.uploadImage')}
              </span>
            </Button>
            {imagePreview ? (
              <Button
                type='button'
                variant='ghost'
                size='sm'
                onClick={onRemovePhoto}
                disabled={isPending}
                className='h-8 gap-1 rounded-lg text-xs text-destructive hover:bg-destructive/10 hover:text-destructive'
              >
                <IconTrash className='size-3.5' />
                <span>{t('menuItems.removeImage')}</span>
              </Button>
            ) : null}
          </div>
          <p className='text-[11px] text-muted-foreground'>
            {t('menuItems.photoHint')}
          </p>
        </div>
      </div>
    </div>
  );
}
