'use client';

import * as React from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { QrCodeTabSkeleton } from '@/components/skeletons/settings-skeleton';
import {
  IconQrcode,
  IconCopy,
  IconCheck,
  IconDownload,
  IconPrinter,
  IconExternalLink,
  IconBrandWhatsapp,
  IconBuildingStore
} from '@tabler/icons-react';
import { useRestaurantProfile } from '../api/restaurant-query';
import { QrCodeEncoder, QrEcc } from '@/lib/qr/qr-code';

export function QrCodeTab() {
  const t = useTranslations();
  const { data: profile, isLoading } = useRestaurantProfile();
  const [copied, setCopied] = React.useState(false);
  const [logoError, setLogoError] = React.useState(false);
  const printRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setLogoError(false);
  }, [profile?.logoUrl]);

  const [storefrontBase, setStorefrontBase] = React.useState<string>(
    () => (process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3005').replace(/\/+$/, '')
  );

  React.useEffect(() => {
    if (process.env.NEXT_PUBLIC_WEB_URL) {
      setStorefrontBase(process.env.NEXT_PUBLIC_WEB_URL.replace(/\/+$/, ''));
    } else if (typeof window !== 'undefined') {
      setStorefrontBase(`${window.location.protocol}//${window.location.hostname}:3005`);
    }
  }, []);

  const menuUrl = profile?.slug ? `${storefrontBase}/r/${profile.slug}` : '';

  const qrEncoder = React.useMemo(() => {
    if (!menuUrl) return null;
    try {
      return QrCodeEncoder.encodeText(menuUrl, QrEcc.MEDIUM);
    } catch {
      return null;
    }
  }, [menuUrl]);

  const handleCopyLink = async () => {
    if (!menuUrl) return;
    try {
      await navigator.clipboard.writeText(menuUrl);
      setCopied(true);
      toast.success(t('restaurantSettings.linkCopied') || 'Menu link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleShareWhatsApp = () => {
    if (!menuUrl || !profile?.name) return;
    const text = encodeURIComponent(
      `Check out our food menu and order directly via WhatsApp on Dir Food:\n${menuUrl}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleDownloadPng = () => {
    if (!qrEncoder || !profile) return;
    const size = 1024;
    const padding = 64;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);

    // QR modules
    const qrSize = qrEncoder.size;
    const cellSize = (size - padding * 2) / qrSize;

    ctx.fillStyle = '#0f172a';
    for (let y = 0; y < qrSize; y++) {
      for (let x = 0; x < qrSize; x++) {
        if (qrEncoder.getModule(x, y)) {
          ctx.fillRect(
            padding + x * cellSize,
            padding + y * cellSize,
            cellSize + 0.5,
            cellSize + 0.5
          );
        }
      }
    }

    // Trigger download
    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `${profile.slug}-qr-code.png`;
    a.click();
    toast.success(t('restaurantSettings.qrDownloaded'));
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return <QrCodeTabSkeleton />;
  }

  if (!profile) return null;

  const qrSvgPath = qrEncoder ? qrEncoder.toSvgPath(4) : '';
  const qrViewBox = qrEncoder
    ? `0 0 ${qrEncoder.size + 8} ${qrEncoder.size + 8}`
    : '0 0 29 29';

  return (
    <div className='space-y-6'>
      {/* Intro Header */}
      <div className='rounded-xl border bg-card p-6 shadow-xs space-y-4'>
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b pb-4'>
          <div>
            <h3 className='text-base font-semibold text-foreground flex items-center gap-2'>
              <IconQrcode className='size-5 text-primary' />
              <span>{t('restaurantSettings.qrTitle') || 'Menu Link & Table QR Code'}</span>
            </h3>
            <p className='text-xs text-muted-foreground mt-0.5'>
              {t('restaurantSettings.qrDescription') ||
                'Share your online menu on WhatsApp status or print table QR standees for your dine-in customers.'}
            </p>
          </div>
        </div>

        {/* Public Link Share Bar */}
        <div className='space-y-2'>
          <label className='text-xs font-semibold text-foreground'>
            {t('restaurantSettings.publicMenuLink') || 'Your Public Menu Link'}
          </label>
          <div className='flex flex-col sm:flex-row items-stretch sm:items-center gap-2'>
            <div
              suppressHydrationWarning
              className='flex-1 flex items-center rounded-lg border bg-muted/30 px-3 py-2 text-xs font-mono text-foreground truncate select-all'
            >
              {menuUrl}
            </div>

            <div className='flex items-center gap-2 shrink-0'>
              <Button
                variant='outline'
                size='sm'
                onClick={handleCopyLink}
                className='gap-1.5 text-xs'
              >
                {copied ? (
                  <>
                    <IconCheck className='size-3.5 text-emerald-600' />
                    <span>{t('restaurantSettings.copied') || 'Copied'}</span>
                  </>
                ) : (
                  <>
                    <IconCopy className='size-3.5' />
                    <span>{t('restaurantSettings.copyLink') || 'Copy Link'}</span>
                  </>
                )}
              </Button>

              <Button
                variant='outline'
                size='sm'
                onClick={handleShareWhatsApp}
                className='gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700'
              >
                <IconBrandWhatsapp className='size-4' />
                <span>{t('restaurantSettings.shareWhatsApp') || 'Share to WhatsApp'}</span>
              </Button>

              <Button
                variant='ghost'
                size='sm'
                nativeButton={false}
                render={
                  <a
                    href={menuUrl}
                    target='_blank'
                    rel='noopener noreferrer'
                    aria-label='Open Storefront'
                  />
                }
                className='text-xs text-muted-foreground'
              >
                <IconExternalLink className='size-3.5' />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Standee Preview & Actions */}
      <div className='grid grid-cols-1 md:grid-cols-12 gap-6 items-start'>
        {/* Printable Standee Card */}
        <div className='md:col-span-7 flex justify-center'>
          <div
            ref={printRef}
            className='w-full max-w-sm rounded-3xl border-2 border-border bg-card p-8 text-center shadow-md space-y-5 print:border-none print:shadow-none print:p-0'
          >
            {/* Restaurant Branding */}
            <div className='flex flex-col items-center gap-2.5'>
              <div className='flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary font-bold overflow-hidden shadow-xs'>
                {profile.logoUrl && !logoError ? (
                  <Image
                    src={profile.logoUrl}
                    alt={profile.name}
                    width={64}
                    height={64}
                    className='size-full object-cover'
                    onError={() => setLogoError(true)}
                  />
                ) : (
                  <IconBuildingStore className='size-8' />
                )}
              </div>
              <div>
                <h4 className='text-lg font-extrabold text-foreground tracking-tight'>
                  {profile.name}
                </h4>
                <p className='text-xs text-muted-foreground'>
                  {profile.addressText || 'Timergara, Lower Dir'}
                </p>
              </div>
            </div>

            {/* QR Code Graphic */}
            <div className='mx-auto flex size-56 items-center justify-center rounded-2xl border-4 border-foreground/10 bg-white p-3 shadow-inner'>
              {qrEncoder ? (
                <svg
                  viewBox={qrViewBox}
                  className='size-full'
                  shapeRendering='crispEdges'
                  aria-label='QR Code'
                >
                  <path d={qrSvgPath} fill='#0f172a' />
                </svg>
              ) : (
                <Spinner className='size-6 text-muted-foreground' />
              )}
            </div>

            {/* Call to Action */}
            <div className='space-y-1'>
              <p className='text-xs font-bold uppercase tracking-wider text-primary'>
                {t('restaurantSettings.scanToOrder') || 'Scan with Camera'}
              </p>
              <p className='text-xs font-medium text-muted-foreground max-w-[240px] mx-auto'>
                {t('restaurantSettings.scanInstructions') ||
                  'Point your mobile camera at this QR code to view our full menu & order directly on WhatsApp'}
              </p>
            </div>

            <div className='pt-2 border-t text-[10px] text-muted-foreground font-semibold uppercase tracking-widest'>
              Dir Food • Lower Dir
            </div>
          </div>
        </div>

        {/* Action Panel */}
        <div className='md:col-span-5 rounded-2xl border bg-card p-6 shadow-xs space-y-4'>
          <h4 className='text-sm font-bold text-foreground'>
            {t('restaurantSettings.qrActionsTitle') || 'Standee & Promotional Materials'}
          </h4>
          <p className='text-xs text-muted-foreground'>
            {t('restaurantSettings.qrActionsDesc') ||
              'Display this QR code on dining tables, packaging boxes, counter standees, or receipts so diners can re-order quickly from home.'}
          </p>

          <div className='space-y-2.5 pt-2'>
            <Button
              onClick={handleDownloadPng}
              variant='default'
              className='w-full justify-start gap-2 text-xs font-semibold'
            >
              <IconDownload className='size-4' />
              <span>
                {t('restaurantSettings.downloadPng') || 'Download High-Res PNG (1024×1024)'}
              </span>
            </Button>

            <Button
              onClick={handlePrint}
              variant='outline'
              className='w-full justify-start gap-2 text-xs font-semibold'
            >
              <IconPrinter className='size-4' />
              <span>{t('restaurantSettings.printStandee') || 'Print Table Standee'}</span>
            </Button>
          </div>

          <div className='rounded-xl bg-muted/40 p-3 text-[11px] text-muted-foreground border space-y-1'>
            <p className='font-semibold text-foreground'>
              {t('restaurantSettings.tipTitle') || '💡 Marketing Tip for Lower Dir'}
            </p>
            <p>
              {t('restaurantSettings.tipDesc') ||
                'Post your QR code & menu link on your WhatsApp Status every afternoon before lunch or dinner time to receive direct incoming orders!'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
