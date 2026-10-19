'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Icons } from '@/components/icons';
import { toPaisa } from '@/lib/money';
import { useCreatePlatformRestaurant } from '../api/platform-query';
import type { CreateRestaurantResponse } from '../types';

interface CreateRestaurantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateRestaurantDialog({ open, onOpenChange }: CreateRestaurantDialogProps) {
  const t = useTranslations('platformRestaurants');
  const tCommon = useTranslations();
  const createMutation = useCreatePlatformRestaurant();

  const [name, setName] = React.useState('');
  const [contactPhone, setContactPhone] = React.useState('');
  const [whatsappNumber, setWhatsappNumber] = React.useState('');
  const [addressText, setAddressText] = React.useState('');
  const [cuisines, setCuisines] = React.useState('Desi, Karahi, BBQ');
  const [minOrderPkr, setMinOrderPkr] = React.useState('500');
  const [ownerName, setOwnerName] = React.useState('');
  const [ownerPhone, setOwnerPhone] = React.useState('');

  const [result, setResult] = React.useState<CreateRestaurantResponse | null>(null);

  React.useEffect(() => {
    if (!open) {
      setResult(null);
      setName('');
      setContactPhone('');
      setWhatsappNumber('');
      setAddressText('');
      setOwnerName('');
      setOwnerPhone('');
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !contactPhone.trim() || !ownerName.trim() || !ownerPhone.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    const cuisinesList = cuisines
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);

    const minOrderVal = Number(minOrderPkr);
    const minOrderPaisa = !isNaN(minOrderVal) && minOrderVal > 0 ? toPaisa(minOrderVal) : undefined;

    try {
      const res = await createMutation.mutateAsync({
        name: name.trim(),
        contactPhone: contactPhone.trim(),
        whatsappNumber: whatsappNumber.trim() || undefined,
        addressText: addressText.trim() || undefined,
        cuisines: cuisinesList,
        minOrderAmount: minOrderPaisa,
        owner: {
          name: ownerName.trim(),
          phone: ownerPhone.trim()
        }
      });

      setResult(res);
      toast.success(t('restaurantCreated'));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create restaurant';
      toast.error(message);
    }
  };

  const handleCopyLink = () => {
    if (!result?.setupLink) return;
    navigator.clipboard.writeText(result.setupLink);
    toast.success(t('setupLinkCopied'));
  };

  const userPhone = result?.user.phone;
  const userName = result?.user.name;
  const restaurantName = result?.restaurant.name;
  const setupLink = result?.setupLink;

  const cleanOwnerPhone = React.useMemo(() => {
    if (!userPhone) return '';
    const digits = userPhone.replace(/[^0-9]/g, '');
    if (digits.startsWith('03')) return `92${digits.slice(1)}`;
    return digits;
  }, [userPhone]);

  const whatsappMessageUrl = React.useMemo(() => {
    if (!cleanOwnerPhone || !userName || !restaurantName || !setupLink) return '';
    const msg = `Assalam-o-Alaikum ${userName}, your restaurant '${restaurantName}' has been created on Dir Food! Set up your password here to start taking orders: ${setupLink}`;
    return `https://wa.me/${cleanOwnerPhone}?text=${encodeURIComponent(msg)}`;
  }, [cleanOwnerPhone, userName, restaurantName, setupLink]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-xl'>
        {result ? (
          <div className='space-y-4 py-2'>
            <DialogHeader>
              <div className='mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/50'>
                <Icons.circleCheck className='size-6 text-emerald-600 dark:text-emerald-400' />
              </div>
              <DialogTitle className='text-center text-xl font-bold'>
                {t('restaurantCreated')}
              </DialogTitle>
              <DialogDescription className='text-center text-sm'>
                {result.restaurant.name} ({result.restaurant.slug})
              </DialogDescription>
            </DialogHeader>

            <div className='rounded-lg border bg-muted/30 p-4 space-y-3'>
              <div className='text-sm font-semibold text-foreground'>{t('setupLinkTitle')}</div>
              <p className='text-xs text-muted-foreground'>{t('setupLinkDesc')}</p>
              <div className='flex items-center gap-2'>
                <Input
                  readOnly
                  value={result.setupLink}
                  className='font-mono text-xs bg-background'
                />
                <Button size='sm' onClick={handleCopyLink} className='shrink-0 gap-1'>
                  <Icons.clipboard className='size-4' />
                  {t('copyLink')}
                </Button>
              </div>
            </div>

            <DialogFooter className='flex-col sm:flex-row gap-2'>
              {whatsappMessageUrl && (
                <Button
                  className='bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5'
                  render={<a href={whatsappMessageUrl} target='_blank' rel='noopener noreferrer' />}
                >
                  <Icons.whatsapp className='size-4' />
                  Send via WhatsApp
                </Button>
              )}
              <Button variant='outline' onClick={() => onOpenChange(false)}>
                {t('done')}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className='space-y-4'>
            <DialogHeader>
              <DialogTitle>{t('dialogCreateTitle')}</DialogTitle>
              <DialogDescription>{t('dialogCreateDesc')}</DialogDescription>
            </DialogHeader>

            <div className='space-y-3 text-sm'>
              <div className='font-semibold text-foreground border-b pb-1'>
                Store Information (Timergara / Lower Dir)
              </div>

              <div className='space-y-1.5'>
                <Label htmlFor='create-name'>Restaurant Name *</Label>
                <Input
                  id='create-name'
                  required
                  placeholder='e.g. Al-Madina Shinwari Karahi'
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                <div className='space-y-1.5'>
                  <Label htmlFor='create-contact'>Contact Mobile *</Label>
                  <Input
                    id='create-contact'
                    required
                    placeholder='03001234567'
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                  />
                </div>

                <div className='space-y-1.5'>
                  <Label htmlFor='create-wa'>WhatsApp Orders Number</Label>
                  <Input
                    id='create-wa'
                    placeholder='03001234567'
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                  />
                </div>
              </div>

              <div className='space-y-1.5'>
                <Label htmlFor='create-address'>Address in Lower Dir</Label>
                <Input
                  id='create-address'
                  placeholder='e.g. Main Bazaar, Timergara'
                  value={addressText}
                  onChange={(e) => setAddressText(e.target.value)}
                />
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                <div className='space-y-1.5'>
                  <Label htmlFor='create-cuisines'>Cuisines (comma separated)</Label>
                  <Input
                    id='create-cuisines'
                    placeholder='Desi, Karahi, BBQ'
                    value={cuisines}
                    onChange={(e) => setCuisines(e.target.value)}
                  />
                </div>

                <div className='space-y-1.5'>
                  <Label htmlFor='create-min-order'>Min Order Amount (PKR)</Label>
                  <Input
                    id='create-min-order'
                    type='number'
                    placeholder='500'
                    value={minOrderPkr}
                    onChange={(e) => setMinOrderPkr(e.target.value)}
                  />
                </div>
              </div>

              <div className='font-semibold text-foreground border-b pb-1 pt-2'>
                Owner Account Details
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                <div className='space-y-1.5'>
                  <Label htmlFor='create-owner-name'>Owner Full Name *</Label>
                  <Input
                    id='create-owner-name'
                    required
                    placeholder='e.g. Usman Khan'
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                  />
                </div>

                <div className='space-y-1.5'>
                  <Label htmlFor='create-owner-phone'>Owner Mobile Phone *</Label>
                  <Input
                    id='create-owner-phone'
                    required
                    placeholder='03001234567'
                    value={ownerPhone}
                    onChange={(e) => setOwnerPhone(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <DialogFooter className='gap-2 sm:gap-0 pt-2'>
              <Button
                type='button'
                variant='outline'
                onClick={() => onOpenChange(false)}
                disabled={createMutation.isPending}
              >
                {tCommon('actions.cancel')}
              </Button>
              <Button type='submit' disabled={createMutation.isPending}>
                {createMutation.isPending && <Spinner className='me-1.5 size-4' />}
                {t('addRestaurant')}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
