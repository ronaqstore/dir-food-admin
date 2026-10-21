'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { IconPhoto, IconUpload, IconCheck, IconAlertCircle, IconRocket } from '@tabler/icons-react';
import { toPaisa, fromPaisa } from '@/lib/money';
import {
  useRestaurantProfile,
  useUpdateProfile,
  useUpdateAvailability,
  useUploadRestaurantImage,
  useDeleteRestaurantImage,
  usePublishReadiness,
  usePublishRestaurant
} from '../api/restaurant-query';
import type { ManualAvailabilityStatus } from '../types';

export function ProfileTab() {
  const t = useTranslations();
  const { data: profile, isLoading } = useRestaurantProfile();
  const { data: readiness, refetch: refetchReadiness } = usePublishReadiness();

  const updateProfile = useUpdateProfile();
  const updateAvailability = useUpdateAvailability();
  const uploadImage = useUploadRestaurantImage();
  const deleteImage = useDeleteRestaurantImage();
  const publishRestaurant = usePublishRestaurant();

  // Form states
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [addressText, setAddressText] = React.useState('');
  const [contactPhone, setContactPhone] = React.useState('');
  const [whatsappNumber, setWhatsappNumber] = React.useState('');
  const [minOrder, setMinOrder] = React.useState('');

  // Availability states
  const [manualStatus, setManualStatus] = React.useState<ManualAvailabilityStatus>('AUTO');
  const [unavailableNote, setUnavailableNote] = React.useState('');

  const logoInputRef = React.useRef<HTMLInputElement>(null);
  const coverInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setDescription(profile.description || '');
      setAddressText(profile.addressText || '');
      setContactPhone(profile.contactPhone || '');
      setWhatsappNumber(profile.whatsappNumber || '');
      setMinOrder(profile.minOrderAmount != null ? String(fromPaisa(profile.minOrderAmount)) : '');
      setManualStatus(profile.manualStatus || 'AUTO');
      setUnavailableNote(profile.unavailableNote || '');
    }
  }, [profile]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile.mutateAsync({
        name: name.trim() || undefined,
        description: description.trim() || undefined,
        addressText: addressText.trim() || undefined,
        contactPhone: contactPhone.trim() || undefined,
        whatsappNumber: whatsappNumber.trim() || undefined,
        minOrderAmount: minOrder ? toPaisa(Number(minOrder)) : undefined
      });
      toast.success(t('restaurantSettings.profileSaved'));
      void refetchReadiness();
    } catch (err) {
      const msg = err instanceof Error ? err.message : t('common.unexpectedError');
      toast.error(msg);
    }
  };

  const handleSaveAvailability = async () => {
    try {
      await updateAvailability.mutateAsync({
        manualStatus,
        unavailableNote: unavailableNote.trim() || undefined
      });
      toast.success(t('restaurantSettings.availabilityUpdated'));
    } catch (err) {
      const msg = err instanceof Error ? err.message : t('common.unexpectedError');
      toast.error(msg);
    }
  };

  const handleUploadImage = async (
    e: React.ChangeEvent<HTMLInputElement>,
    kind: 'logo' | 'cover'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      toast.error('Image must be less than 3MB');
      return;
    }

    try {
      await uploadImage.mutateAsync({ kind, file });
      toast.success(t('menuItems.imageUploadSuccess'));
      void refetchReadiness();
    } catch (err) {
      const msg = err instanceof Error ? err.message : t('common.unexpectedError');
      toast.error(msg);
    }
  };

  const handleDeleteImage = async (kind: 'logo' | 'cover') => {
    try {
      await deleteImage.mutateAsync(kind);
      toast.success(t('menuItems.deleteSuccess'));
    } catch (err) {
      const msg = err instanceof Error ? err.message : t('common.unexpectedError');
      toast.error(msg);
    }
  };

  const handlePublish = async () => {
    try {
      await publishRestaurant.mutateAsync();
      toast.success(t('restaurantSettings.publishSuccess'));
      void refetchReadiness();
    } catch (err) {
      const msg = err instanceof Error ? err.message : t('common.unexpectedError');
      toast.error(msg);
    }
  };

  if (isLoading) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <Spinner className='size-8 text-primary' />
      </div>
    );
  }

  const isPending =
    updateProfile.isPending ||
    updateAvailability.isPending ||
    uploadImage.isPending ||
    deleteImage.isPending ||
    publishRestaurant.isPending;

  const isPendingPublish = profile?.status === 'PENDING';
  const isActive = profile?.status === 'ACTIVE';

  return (
    <div className='space-y-8'>
      {/* 1. Readiness / Launch Card (if PENDING) or Status Banner */}
      {isPendingPublish ? (
        <div className='rounded-xl border border-primary/20 bg-primary/5 p-5 shadow-xs'>
          <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
            <div className='space-y-1'>
              <div className='flex items-center gap-2'>
                <IconRocket className='size-5 text-primary' />
                <h3 className='font-semibold text-foreground text-base'>
                  {t('restaurantSettings.readinessTitle')}
                </h3>
              </div>
              <p className='text-xs text-muted-foreground'>
                {t('restaurantSettings.readinessDesc')}
              </p>
            </div>

            <div>
              <Button
                onClick={handlePublish}
                disabled={!readiness?.isReadyToPublish || isPending}
                className='gap-2 shadow-xs'
              >
                {publishRestaurant.isPending ? (
                  <>
                    <Spinner className='size-4' />
                    <span>{t('restaurantSettings.publishing')}</span>
                  </>
                ) : (
                  <>
                    <IconRocket className='size-4' />
                    <span>{t('restaurantSettings.publishButton')}</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Missing items checklist */}
          {readiness?.missingPrerequisites && readiness.missingPrerequisites.length > 0 ? (
            <div className='mt-4 flex flex-wrap gap-2 pt-2 border-t border-primary/10'>
              {readiness.missingPrerequisites.map((prereq) => (
                <Badge
                  key={prereq}
                  variant='outline'
                  className='bg-background text-amber-600 dark:text-amber-400 border-amber-500/30 text-xs py-1 gap-1'
                >
                  <IconAlertCircle className='size-3.5' />
                  <span>{prereq}</span>
                </Badge>
              ))}
            </div>
          ) : readiness?.isReadyToPublish ? (
            <div className='mt-3 flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium'>
              <IconCheck className='size-4' />
              <span>{t('restaurantSettings.readyToPublish')}</span>
            </div>
          ) : null}
        </div>
      ) : isActive ? (
        <div className='flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-emerald-700 dark:text-emerald-400'>
          <div className='flex items-center gap-2'>
            <IconCheck className='size-5 text-emerald-600' />
            <span className='font-semibold text-sm'>{t('restaurantSettings.activeBadge')}</span>
          </div>
          {profile?.subscriptionEndsAt ? (
            <span className='text-xs text-muted-foreground'>
              {t('restaurantSettings.trialDaysRemaining', {
                date: new Date(profile.subscriptionEndsAt).toLocaleDateString()
              })}
            </span>
          ) : null}
        </div>
      ) : null}

      {/* 2. Visuals: Logo & Cover */}
      <div className='rounded-xl border bg-card p-6 shadow-xs space-y-6'>
        <h3 className='text-base font-semibold text-foreground border-b pb-3'>
          {t('restaurantSettings.mediaTitle')}
        </h3>

        <div className='grid gap-6 sm:grid-cols-2'>
          {/* Logo */}
          <div className='space-y-3'>
            <Label>{t('restaurantSettings.logo')}</Label>
            <input
              ref={logoInputRef}
              type='file'
              accept='image/jpeg,image/png,image/webp'
              className='hidden'
              onChange={(e) => handleUploadImage(e, 'logo')}
            />
            <div className='flex items-center gap-4'>
              <div className='relative size-20 shrink-0 overflow-hidden rounded-full border bg-muted flex items-center justify-center'>
                {profile?.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.logoUrl} alt='Logo' className='size-full object-cover' />
                ) : (
                  <IconPhoto className='size-8 text-muted-foreground/40' />
                )}
              </div>
              <div className='flex flex-wrap gap-2'>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() => logoInputRef.current?.click()}
                  disabled={isPending}
                  className='gap-1.5'
                >
                  <IconUpload className='size-3.5' />
                  <span>
                    {profile?.logoUrl
                      ? t('restaurantSettings.changeLogo')
                      : t('restaurantSettings.uploadLogo')}
                  </span>
                </Button>
                {profile?.logoUrl ? (
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    onClick={() => handleDeleteImage('logo')}
                    disabled={isPending}
                    className='text-destructive hover:text-destructive'
                  >
                    {t('restaurantSettings.removePhoto')}
                  </Button>
                ) : null}
              </div>
            </div>
          </div>

          {/* Cover */}
          <div className='space-y-3'>
            <Label>{t('restaurantSettings.cover')}</Label>
            <input
              ref={coverInputRef}
              type='file'
              accept='image/jpeg,image/png,image/webp'
              className='hidden'
              onChange={(e) => handleUploadImage(e, 'cover')}
            />
            <div className='flex items-center gap-4'>
              <div className='relative h-20 w-32 shrink-0 overflow-hidden rounded-lg border bg-muted flex items-center justify-center'>
                {profile?.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.coverUrl} alt='Cover' className='size-full object-cover' />
                ) : (
                  <IconPhoto className='size-8 text-muted-foreground/40' />
                )}
              </div>
              <div className='flex flex-wrap gap-2'>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() => coverInputRef.current?.click()}
                  disabled={isPending}
                  className='gap-1.5'
                >
                  <IconUpload className='size-3.5' />
                  <span>
                    {profile?.coverUrl
                      ? t('restaurantSettings.changeCover')
                      : t('restaurantSettings.uploadCover')}
                  </span>
                </Button>
                {profile?.coverUrl ? (
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    onClick={() => handleDeleteImage('cover')}
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

      {/* 3. Availability Switch */}
      <div className='rounded-xl border bg-card p-6 shadow-xs space-y-5'>
        <div>
          <h3 className='text-base font-semibold text-foreground'>
            {t('restaurantSettings.availabilityTitle')}
          </h3>
          <p className='text-xs text-muted-foreground'>
            {t('restaurantSettings.availabilityDescription')}
          </p>
        </div>

        <div className='grid gap-3 sm:grid-cols-3'>
          <button
            type='button'
            onClick={() => setManualStatus('AUTO')}
            className={`rounded-lg border p-4 text-start transition-all cursor-pointer ${
              manualStatus === 'AUTO'
                ? 'border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500'
                : 'border-border hover:bg-muted/50'
            }`}
          >
            <p className='text-sm font-semibold text-foreground'>
              {t('restaurantSettings.statusAuto')}
            </p>
            <p className='text-xs text-muted-foreground mt-1'>
              {t('restaurantSettings.statusAutoDesc')}
            </p>
          </button>

          <button
            type='button'
            onClick={() => setManualStatus('CLOSED')}
            className={`rounded-lg border p-4 text-start transition-all cursor-pointer ${
              manualStatus === 'CLOSED'
                ? 'border-destructive bg-destructive/10 ring-1 ring-destructive'
                : 'border-border hover:bg-muted/50'
            }`}
          >
            <p className='text-sm font-semibold text-destructive'>
              {t('restaurantSettings.statusClosed')}
            </p>
            <p className='text-xs text-muted-foreground mt-1'>
              {t('restaurantSettings.statusClosedDesc')}
            </p>
          </button>

          <button
            type='button'
            onClick={() => setManualStatus('TEMP_UNAVAILABLE')}
            className={`rounded-lg border p-4 text-start transition-all cursor-pointer ${
              manualStatus === 'TEMP_UNAVAILABLE'
                ? 'border-amber-500 bg-amber-500/10 ring-1 ring-amber-500'
                : 'border-border hover:bg-muted/50'
            }`}
          >
            <p className='text-sm font-semibold text-amber-600 dark:text-amber-400'>
              {t('restaurantSettings.statusTemp')}
            </p>
            <p className='text-xs text-muted-foreground mt-1'>
              {t('restaurantSettings.statusTempDesc')}
            </p>
          </button>
        </div>

        {manualStatus !== 'AUTO' ? (
          <div className='space-y-1.5 animate-in fade-in-50'>
            <Label htmlFor='unavailable-note'>{t('restaurantSettings.unavailableNote')}</Label>
            <Input
              id='unavailable-note'
              value={unavailableNote}
              onChange={(e) => setUnavailableNote(e.target.value)}
              placeholder={t('restaurantSettings.unavailableNotePlaceholder')}
              maxLength={200}
            />
          </div>
        ) : null}

        <div className='flex justify-end'>
          <Button type='button' onClick={handleSaveAvailability} disabled={isPending} size='sm'>
            {updateAvailability.isPending ? (
              <>
                <Spinner className='me-2 size-4' />
                {t('common.saving')}
              </>
            ) : (
              t('common.save')
            )}
          </Button>
        </div>
      </div>

      {/* 4. Store Profile Details */}
      <div className='rounded-xl border bg-card p-6 shadow-xs space-y-6'>
        <h3 className='text-base font-semibold text-foreground border-b pb-3'>
          {t('restaurantSettings.detailsTitle')}
        </h3>

        <form onSubmit={handleSaveProfile} className='space-y-4'>
          <div className='grid gap-4 sm:grid-cols-2'>
            <div className='space-y-1.5'>
              <Label htmlFor='store-name'>{t('restaurantSettings.name')}</Label>
              <Input
                id='store-name'
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isPending}
                required
              />
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='contact-phone'>{t('restaurantSettings.contactPhone')}</Label>
              <Input
                id='contact-phone'
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder='03001234567'
                disabled={isPending}
              />
            </div>
          </div>

          <div className='grid gap-4 sm:grid-cols-2'>
            <div className='space-y-1.5'>
              <Label htmlFor='whatsapp-number'>
                {t('restaurantSettings.whatsappNumber')}
                <span className='text-destructive ms-1'>*</span>
              </Label>
              <Input
                id='whatsapp-number'
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder='03001234567'
                disabled={isPending}
                required
              />
              <p className='text-xs text-muted-foreground'>
                {t('restaurantSettings.whatsappHint')}
              </p>
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='min-order'>{t('restaurantSettings.minOrder')}</Label>
              <div className='relative'>
                <span className='absolute start-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium'>
                  Rs.
                </span>
                <Input
                  id='min-order'
                  type='number'
                  min='0'
                  step='1'
                  value={minOrder}
                  onChange={(e) => setMinOrder(e.target.value)}
                  placeholder={t('restaurantSettings.minOrderPlaceholder')}
                  disabled={isPending}
                  className='ps-11'
                />
              </div>
            </div>
          </div>

          <div className='space-y-1.5'>
            <Label htmlFor='address-text'>{t('restaurantSettings.address')}</Label>
            <Input
              id='address-text'
              value={addressText}
              onChange={(e) => setAddressText(e.target.value)}
              placeholder={t('restaurantSettings.addressPlaceholder')}
              disabled={isPending}
            />
          </div>

          <div className='space-y-1.5'>
            <Label htmlFor='store-description'>{t('restaurantSettings.descriptionLabel')}</Label>
            <Textarea
              id='store-description'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              disabled={isPending}
            />
          </div>

          <div className='flex justify-end pt-2'>
            <Button type='submit' disabled={isPending}>
              {updateProfile.isPending ? (
                <>
                  <Spinner className='me-2 size-4' />
                  {t('common.saving')}
                </>
              ) : (
                t('restaurantSettings.saveProfile')
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
