'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DialogDetailSkeleton } from '@/components/skeletons/dialog-skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Icons } from '@/components/icons';
import { formatPkr } from '@/lib/money';
import { useOrderDetail } from '../api/orders-query';
import type { OwnerOrderIntent } from '../types';

interface OrderDetailsDialogProps {
  orderId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialOrder?: OwnerOrderIntent | null;
}

export function OrderDetailsDialog({
  orderId,
  open,
  onOpenChange,
  initialOrder
}: OrderDetailsDialogProps) {
  const t = useTranslations('orders');
  const { data: fetchedOrder, isLoading } = useOrderDetail(open ? orderId : null);

  const order = fetchedOrder ?? initialOrder;

  const customerPhone = order?.customerPhone;
  const customerName = order?.customerName;
  const reference = order?.reference;

  const cleanPhone = React.useMemo(() => {
    if (!customerPhone) return '';
    const digits = customerPhone.replace(/[^0-9]/g, '');
    if (digits.startsWith('03')) {
      return `92${digits.slice(1)}`;
    }
    return digits;
  }, [customerPhone]);

  const whatsappChatUrl = React.useMemo(() => {
    if (!cleanPhone || !customerName || !reference) return '';
    const message = `Assalam-o-Alaikum ${customerName}, regarding your Dir Food order #${reference}:`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  }, [cleanPhone, customerName, reference]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-xl'>
        {isLoading && !order ? (
          <DialogDetailSkeleton />
        ) : !order ? (
          <div className='py-8 text-center text-muted-foreground'>{t('emptyTitle')}</div>
        ) : (
          <>
            <DialogHeader>
              <div className='flex flex-wrap items-center justify-between gap-2 pe-6'>
                <DialogTitle className='text-xl font-bold'>
                  {t('detailsSubtitle', { reference: order.reference })}
                </DialogTitle>
                <div className='flex items-center gap-1.5'>
                  {order.isExpired ? (
                    <Badge variant='destructive'>{t('statusExpired')}</Badge>
                  ) : order.status === 'WHATSAPP_OPENED' ? (
                    <Badge
                      variant='secondary'
                      className='border-emerald-500/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                    >
                      <Icons.checks className='me-1 size-3' />
                      {t('statusOpened')}
                    </Badge>
                  ) : (
                    <Badge
                      variant='outline'
                      className='border-amber-500/40 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                    >
                      <Icons.clock className='me-1 size-3' />
                      {t('statusReady')}
                    </Badge>
                  )}
                </div>
              </div>
              <DialogDescription className='text-xs text-muted-foreground'>
                {t('createdTime')}: {new Date(order.createdAt).toLocaleString()}
              </DialogDescription>
            </DialogHeader>

            <div className='space-y-4 text-sm'>
              {/* Customer & Contact Section */}
              <div className='rounded-lg border bg-card p-3 shadow-xs'>
                <div className='mb-2 flex items-center justify-between font-semibold text-foreground'>
                  <span className='flex items-center gap-1.5'>
                    <Icons.user className='size-4 text-muted-foreground' />
                    {t('customerInfo')}
                  </span>
                  {whatsappChatUrl && (
                    <a
                      href={whatsappChatUrl}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='inline-flex items-center gap-1 text-xs font-medium text-emerald-600 hover:underline dark:text-emerald-400'
                    >
                      <Icons.whatsapp className='size-3.5' />
                      {t('chatOnWhatsapp')}
                    </a>
                  )}
                </div>
                <div className='grid grid-cols-1 gap-2 sm:grid-cols-2'>
                  <div>
                    <span className='text-xs text-muted-foreground'>{t('customerName')}: </span>
                    <span className='font-medium text-foreground'>{order.customerName}</span>
                  </div>
                  <div>
                    <span className='text-xs text-muted-foreground'>{t('customerPhone')}: </span>
                    <span className='font-mono font-medium text-foreground'>
                      {order.customerPhone}
                    </span>
                  </div>
                </div>
              </div>

              {/* Delivery Details Section */}
              <div className='rounded-lg border bg-card p-3 shadow-xs'>
                <div className='mb-2 font-semibold text-foreground'>{t('deliveryInfo')}</div>
                <div className='space-y-1.5'>
                  <div>
                    <span className='text-xs text-muted-foreground'>{t('deliveryArea')}: </span>
                    <span className='font-medium text-foreground'>{order.deliveryArea}</span>
                  </div>
                  <div>
                    <span className='text-xs text-muted-foreground'>{t('landmark')}: </span>
                    <span className='font-medium text-foreground'>{order.landmark}</span>
                  </div>
                  {order.directions && (
                    <div>
                      <span className='text-xs text-muted-foreground'>{t('directions')}: </span>
                      <span className='italic text-foreground'>{order.directions}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Ordered Dishes Breakdown */}
              <div className='space-y-1.5'>
                <div className='font-semibold text-foreground'>{t('itemsBreakdown')}</div>
                <div className='overflow-hidden rounded-lg border'>
                  <Table>
                    <TableHeader className='bg-muted/50'>
                      <TableRow>
                        <TableHead>{t('itemDish')}</TableHead>
                        <TableHead className='text-center'>{t('itemQty')}</TableHead>
                        <TableHead className='text-end'>{t('itemPrice')}</TableHead>
                        <TableHead className='text-end'>{t('itemTotal')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {order.items.map((item, idx) => (
                        <TableRow key={`${item.name}-${idx}`}>
                          <TableCell className='font-medium'>
                            {item.name}
                            {item.variant && (
                              <span className='ms-1 text-xs text-muted-foreground'>
                                ({item.variant})
                              </span>
                            )}
                          </TableCell>
                          <TableCell className='text-center font-mono'>{item.quantity}</TableCell>
                          <TableCell className='text-end font-mono text-xs'>
                            {formatPkr(Number(item.unitPrice))}
                          </TableCell>
                          <TableCell className='text-end font-mono font-semibold'>
                            {formatPkr(Number(item.lineTotal))}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Totals & Delivery Fee */}
              <div className='rounded-lg bg-muted/40 p-3 space-y-1.5'>
                <div className='flex items-center justify-between text-muted-foreground'>
                  <span>{t('subtotal')}</span>
                  <span className='font-mono font-medium'>{formatPkr(Number(order.subtotal))}</span>
                </div>
                <div className='flex items-center justify-between text-muted-foreground'>
                  <span>{t('deliveryFee')}</span>
                  <span className='font-mono'>
                    {order.deliveryFeeStatus === 'KNOWN' && order.deliveryFee !== null ? (
                      Number(order.deliveryFee) === 0 ? (
                        <span className='text-emerald-600 dark:text-emerald-400 font-medium'>
                          {t('freeDelivery')}
                        </span>
                      ) : (
                        formatPkr(Number(order.deliveryFee))
                      )
                    ) : (
                      <span className='italic text-amber-600 dark:text-amber-400 text-xs'>
                        {t('toBeConfirmed')}
                      </span>
                    )}
                  </span>
                </div>
                <div className='border-t pt-1.5 flex items-center justify-between font-semibold text-foreground text-base'>
                  <span>{t('grandTotal')}</span>
                  <span className='font-mono text-primary'>
                    {formatPkr(
                      Number(order.subtotal) + (order.deliveryFee ? Number(order.deliveryFee) : 0)
                    )}
                  </span>
                </div>
              </div>

              {/* Timeline Info */}
              <div className='rounded-lg border border-dashed p-2.5 text-xs text-muted-foreground space-y-1'>
                <div className='flex items-center justify-between'>
                  <span>{t('whatsappOpenedTime')}:</span>
                  <span className='font-medium'>
                    {order.whatsappOpenedAt
                      ? new Date(order.whatsappOpenedAt).toLocaleString()
                      : t('notOpenedYet')}
                  </span>
                </div>
              </div>
            </div>

            <DialogFooter className='gap-2 sm:gap-0'>
              {whatsappChatUrl && (
                <Button
                  className='bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5'
                  render={<a href={whatsappChatUrl} target='_blank' rel='noopener noreferrer' />}
                >
                  <Icons.whatsapp className='size-4' />
                  {t('chatOnWhatsapp')}
                </Button>
              )}
              <Button variant='outline' onClick={() => onOpenChange(false)}>
                {t('close')}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
