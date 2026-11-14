'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Icons } from '@/components/icons';
import { WHATSAPP_BASE_URL } from '@/constants/api';
import type { IssuedSetupLinkDialogProps } from '../types';

export function IssuedSetupLinkDialog({
  data,
  onClose,
  onCopy,
  t
}: IssuedSetupLinkDialogProps) {
  if (!data) return null;

  const phone = data.ownerPhone;
  const digits = phone ? phone.replace(/[^0-9]/g, '') : '';
  const cleanPhone = digits.startsWith('03') ? `92${digits.slice(1)}` : digits;
  const ownerName = data.ownerName || 'Partner';
  const msg = `Assalam-o-Alaikum ${ownerName}, your password setup link for '${data.restaurantName}' on Dir Food is: ${data.setupUrl}`;
  const waUrl = cleanPhone
    ? `${WHATSAPP_BASE_URL}/${cleanPhone}?text=${encodeURIComponent(msg)}`
    : null;

  return (
    <Dialog open={!!data} onOpenChange={onClose}>
      <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-xl'>
        <DialogHeader>
          <div className='mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/50'>
            <Icons.circleCheck className='size-6 text-emerald-600 dark:text-emerald-400' />
          </div>
          <DialogTitle className='text-center text-xl font-bold'>
            {t('getSetupLink')}
          </DialogTitle>
          <DialogDescription className='text-center text-sm'>
            {data.restaurantName}
          </DialogDescription>
        </DialogHeader>

        <div className='rounded-lg border bg-muted/30 p-4 space-y-3'>
          <div className='text-sm font-semibold text-foreground'>{t('setupLinkTitle')}</div>
          <p className='text-xs text-muted-foreground'>{t('setupLinkDesc')}</p>
          <div className='flex items-center gap-2'>
            <Input
              readOnly
              value={data.setupUrl}
              className='font-mono text-xs bg-background'
            />
            <Button
              type='button'
              size='sm'
              onClick={onCopy}
              className='shrink-0 gap-1'
            >
              <Icons.clipboard className='size-4' />
              {t('copyLink')}
            </Button>
          </div>
        </div>

        <DialogFooter className='flex-col sm:flex-row gap-2'>
          {waUrl && (
            <Button
              type='button'
              className='bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5'
              render={<a href={waUrl} target='_blank' rel='noopener noreferrer' />}
            >
              <Icons.whatsapp className='size-4' />
              {t('sendViaWhatsApp')}
            </Button>
          )}
          <Button type='button' variant='outline' onClick={onClose}>
            {t('done')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
