'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ProfileTabSkeleton } from '@/components/skeletons/settings-skeleton';
import { SearchableSelect } from '@/components/ui/searchable-select';
import {
  IconCheck,
  IconAlertCircle,
  IconRocket,
  IconBrandWhatsapp,
  IconMapPin
} from '@tabler/icons-react';
import { toPaisa, fromPaisa } from '@/lib/money';
import {
  isReservedPhoneNumber,
  formatPkMobile,
  isExactPkMobile,
  sanitizePkMobileInput
} from '@/lib/auth/phone';
import { ProfileMediaSection } from './profile-media-section';
import { ProfileAvailabilitySection } from './profile-availability-section';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { usePublicCuisines } from '@/features/platform/api/cuisines-query';
import { DEFAULT_MASTER_CUISINE_NAMES } from '@/features/platform/cuisines.types';
import {
  useRestaurantProfile,
  useUpdateProfile,
  useUpdateAvailability,
  useUploadRestaurantImage,
  useDeleteRestaurantImage,
  usePublishReadiness,
  usePublishRestaurant,
  useCities
} from '../api/restaurant-query';
import type { ManualAvailabilityStatus } from '../types';

export function ProfileTab() {
  const t = useTranslations();
  const { data: profile, isLoading } = useRestaurantProfile();
  const { data: readiness, refetch: refetchReadiness } = usePublishReadiness();
  const { data: cities } = useCities();
  const { data: publicCuisinesRes } = usePublicCuisines();

  const availableCuisines = React.useMemo(() => {
    const list = Array.isArray(publicCuisinesRes) ? publicCuisinesRes : publicCuisinesRes?.data;
    return Array.isArray(list) && list.length > 0
      ? list.map((c) => c.name)
      : [...DEFAULT_MASTER_CUISINE_NAMES];
  }, [publicCuisinesRes]);

  const updateProfile = useUpdateProfile();
  const updateAvailability = useUpdateAvailability();
  const uploadImage = useUploadRestaurantImage();
  const deleteImage = useDeleteRestaurantImage();
  const publishRestaurant = usePublishRestaurant();

  const [name, setName] = React.useState('');
  const [cityId, setCityId] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [addressText, setAddressText] = React.useState('');
  const [contactPhone, setContactPhone] = React.useState('');
  const [whatsappNumber, setWhatsappNumber] = React.useState('');
  const [minOrder, setMinOrder] = React.useState('');
  const [cuisines, setCuisines] = React.useState<string[]>([]);

  const [manualStatus, setManualStatus] = React.useState<ManualAvailabilityStatus>('AUTO');
  const [unavailableNote, setUnavailableNote] = React.useState('');
  const [imageToDelete, setImageToDelete] = React.useState<'logo' | 'cover' | null>(null);

  React.useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setCityId(profile.cityId || '');
      setDescription(profile.description || '');
      setAddressText(profile.addressText || '');
      setContactPhone(formatPkMobile(profile.contactPhone || ''));
      setWhatsappNumber(formatPkMobile(profile.whatsappNumber || ''));
      setMinOrder(profile.minOrderAmount != null ? String(fromPaisa(profile.minOrderAmount)) : '');
      setCuisines(profile.cuisines || []);
      setManualStatus(profile.manualStatus || 'AUTO');
      setUnavailableNote(profile.unavailableNote || '');
    }
  }, [profile]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isExactPkMobile(whatsappNumber)) {
      toast.error(t('restaurantSettings.invalidPhone'));
      return;
    }

    if (contactPhone.trim() && !isExactPkMobile(contactPhone)) {
      toast.error(t('restaurantSettings.invalidPhone'));
      return;
    }

    if (
      (contactPhone.trim() && isReservedPhoneNumber(contactPhone)) ||
      (whatsappNumber.trim() && isReservedPhoneNumber(whatsappNumber))
    ) {
      toast.error(t('restaurantSettings.phoneInUse'));
      return;
    }

    try {
      await updateProfile.mutateAsync({
        name: name.trim() || undefined,
        cityId: cityId || undefined,
        description: description.trim() || undefined,
        addressText: addressText.trim() || undefined,
        contactPhone: contactPhone.trim() || undefined,
        whatsappNumber: whatsappNumber.trim() || undefined,
        minOrderAmount: minOrder ? toPaisa(Number(minOrder)) : undefined,
        cuisines
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
      toast.error(t('menuItems.imageSizeLimit'));
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

  const handleDeleteImage = (kind: 'logo' | 'cover') => {
    setImageToDelete(kind);
  };

  const handleConfirmDeleteImage = async () => {
    if (!imageToDelete) return;
    try {
      await deleteImage.mutateAsync(imageToDelete);
      toast.success(t('menuItems.deleteSuccess'));
      setImageToDelete(null);
      void refetchReadiness();
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
    return <ProfileTabSkeleton />;
  }

  const isPending =
    updateProfile.isPending ||
    updateAvailability.isPending ||
    uploadImage.isPending ||
    deleteImage.isPending ||
    publishRestaurant.isPending;

  const isPendingPublish = profile?.status === 'PENDING';

  return (
    <div className='space-y-6'>
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
                type='button'
                onClick={handlePublish}
                disabled={!readiness?.isReadyToPublish || isPending}
                className='gap-2 shadow-xs'
              >
                <IconRocket className='size-4' />
                <span>{t('restaurantSettings.publishButton')}</span>
              </Button>
            </div>
          </div>

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
      ) : null}

      <ProfileMediaSection
        logoUrl={profile?.logoUrl}
        coverUrl={profile?.coverUrl}
        isPending={isPending}
        onUploadImage={handleUploadImage}
        onDeleteImage={handleDeleteImage}
        t={t}
      />

      <ProfileAvailabilitySection
        manualStatus={manualStatus}
        setManualStatus={setManualStatus}
        unavailableNote={unavailableNote}
        setUnavailableNote={setUnavailableNote}
        onSaveAvailability={handleSaveAvailability}
        isPending={isPending}
        t={t}
      />

      <div className='rounded-xl border bg-card p-6 shadow-xs space-y-6'>
        <div className='border-b pb-3 space-y-1'>
          <h3 className='text-base font-semibold text-foreground'>
            {t('restaurantSettings.detailsTitle')}
          </h3>
        </div>

        <form onSubmit={handleSaveProfile} className='space-y-5'>
          <div className='grid gap-4 sm:grid-cols-2'>
            <div className='space-y-1.5'>
              <Label htmlFor='store-name' className='text-xs font-semibold'>
                {t('restaurantSettings.name')}
                <span className='text-destructive ms-1'>*</span>
              </Label>
              <Input
                id='store-name'
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isPending}
                required
                className='text-xs h-9'
              />
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='contact-phone' className='text-xs font-semibold'>
                {t('restaurantSettings.contactPhone')}
              </Label>
              <Input
                id='contact-phone'
                value={contactPhone}
                onChange={(e) => setContactPhone(sanitizePkMobileInput(e.target.value))}
                placeholder='03001234567'
                maxLength={11}
                disabled={isPending}
                className='text-xs h-9'
              />
              {contactPhone && !isExactPkMobile(contactPhone) ? (
                <p className='text-[11px] text-destructive'>{t('restaurantSettings.invalidPhone')}</p>
              ) : null}
            </div>
          </div>

          <div className='grid gap-4 sm:grid-cols-2'>
            <div className='space-y-1.5'>
              <div className='flex items-center gap-1.5'>
                <IconBrandWhatsapp className='size-3.5 text-emerald-600' />
                <Label htmlFor='whatsapp-number' className='text-xs font-semibold'>
                  {t('restaurantSettings.whatsappNumber')}
                  <span className='text-destructive ms-1'>*</span>
                </Label>
              </div>
              <Input
                id='whatsapp-number'
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(sanitizePkMobileInput(e.target.value))}
                placeholder='03001234567'
                maxLength={11}
                disabled={isPending}
                required
                className='text-xs h-9'
              />
              {whatsappNumber && !isExactPkMobile(whatsappNumber) ? (
                <p className='text-[11px] text-destructive'>{t('restaurantSettings.invalidPhone')}</p>
              ) : null}
              <p className='text-[11px] text-muted-foreground leading-normal'>
                {t('restaurantSettings.whatsappHint')}
              </p>
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='min-order' className='text-xs font-semibold'>
                {t('restaurantSettings.minOrder')}
              </Label>
              <div className='relative'>
                <span className='absolute inset-s-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium'>
                  {t('common.currency')}
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
                  className='ps-9 text-xs h-9'
                />
              </div>
            </div>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <div className='space-y-1.5'>
              <div className='flex items-center gap-1.5'>
                <IconMapPin className='size-3.5 text-primary' />
                <Label htmlFor='restaurant-city' className='text-xs font-semibold'>
                  {t('restaurantSettings.districtLabel')}
                </Label>
              </div>
              <SearchableSelect
                id='restaurant-city'
                value={cityId}
                onChange={setCityId}
                disabled={isPending}
                placeholder={t('restaurantSettings.selectDistrictPlaceholder')}
                searchPlaceholder={t('restaurantSettings.searchDistrictPlaceholder')}
                options={cities?.map((c) => ({ value: c.id, label: c.name, sublabel: c.slug || undefined })) ?? []}
                allowClear
              />
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='address-text' className='text-xs font-semibold'>
                {t('restaurantSettings.address')}
              </Label>
              <Input
                id='address-text'
                value={addressText}
                onChange={(e) => setAddressText(e.target.value)}
                placeholder={t('restaurantSettings.addressPlaceholder')}
                disabled={isPending}
                className='text-xs h-9'
              />
            </div>
          </div>

          <div className='space-y-2'>
            <div className='flex items-center justify-between'>
              <Label className='text-xs font-semibold'>
                {t('restaurantSettings.cuisinesLabel')}
              </Label>
              <span className='text-[11px] text-muted-foreground'>
                {t('restaurantSettings.cuisinesHint')}
              </span>
            </div>
            <div className='flex flex-wrap gap-1.5'>
              {availableCuisines.map((item) => {
                const isSelected = cuisines.includes(item);
                return (
                  <button
                    key={item}
                    type='button'
                    disabled={isPending}
                    onClick={() =>
                      setCuisines((prev) =>
                        prev.includes(item) ? prev.filter((c) => c !== item) : prev.length < 5 ? [...prev, item] : prev
                      )
                    }
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                        : 'border border-border bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>

          <div className='space-y-1.5'>
            <Label htmlFor='store-description' className='text-xs font-semibold'>
              {t('restaurantSettings.descriptionLabel')}
            </Label>
            <Textarea
              id='store-description'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              disabled={isPending}
              className='text-xs leading-relaxed resize-none'
            />
          </div>

          <div className='flex justify-end pt-3 border-t'>
            <Button type='submit' disabled={isPending} className='gap-1.5 shadow-xs px-5'>
              <IconCheck className='size-4' />
              <span>{t('restaurantSettings.saveProfile')}</span>
            </Button>
          </div>
        </form>
      </div>

      <ConfirmDialog
        open={!!imageToDelete}
        onOpenChange={(open) => !open && setImageToDelete(null)}
        title={t('common.areYouSure')}
        description={t('common.cannotUndo')}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        variant='destructive'
        isLoading={deleteImage.isPending}
        onConfirm={handleConfirmDeleteImage}
      />
    </div>
  );
}
