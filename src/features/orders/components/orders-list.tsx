'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
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
import { useOrders, useOrderStats } from '../api/orders-query';
import { OrderDetailsDialog } from './order-details-dialog';
import type { OrderIntentStatus, OwnerOrderIntent } from '../types';

export function OrdersList() {
  const t = useTranslations('orders');
  const [selectedOrderId, setSelectedOrderId] = React.useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = React.useState<OwnerOrderIntent | null>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<OrderIntentStatus | 'ALL'>('ALL');
  const [page, setPage] = React.useState(1);
  const limit = 20;

  const { data: statsData } = useOrderStats('30d');

  const { data: ordersResponse, isLoading } = useOrders({
    page,
    limit,
    q: search.trim() || undefined,
    status: statusFilter
  });

  const orders = ordersResponse?.data ?? [];
  const meta = ordersResponse?.meta;
  const totalPages = meta ? Math.ceil(meta.total / limit) : 1;

  const handleOpenDetail = (order: OwnerOrderIntent) => {
    setSelectedOrderId(order.id);
    setSelectedOrder(order);
    setIsDialogOpen(true);
  };

  const getCleanPhone = (phone: string) => {
    const digits = phone.replace(/[^0-9]/g, '');
    if (digits.startsWith('03')) {
      return `92${digits.slice(1)}`;
    }
    return digits;
  };

  const getWhatsAppLink = (order: OwnerOrderIntent) => {
    const clean = getCleanPhone(order.customerPhone);
    const message = `Assalam-o-Alaikum ${order.customerName}, regarding your Dir Food order #${order.reference}:`;
    return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className='flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-hidden'>
      {/* Page Title & Subtitle */}
      <div className='shrink-0'>
        <h1 className='text-2xl font-bold tracking-tight text-foreground sm:text-3xl'>
          {t('title')}
        </h1>
        <p className='text-sm text-muted-foreground mt-0.5'>{t('subtitle')}</p>
      </div>

      {/* Top Metric Cards */}
      <div className='grid shrink-0 gap-3 grid-cols-1 sm:grid-cols-3'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>{t('metricTotalOrders')}</CardTitle>
            <Icons.building className='size-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold font-mono'>
              {statsData?.requestsCreated ?? meta?.total ?? 0}
            </div>
            <p className='text-xs text-muted-foreground mt-1'>{t('metricTotalOrdersDesc')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>{t('metricWhatsappOpened')}</CardTitle>
            <Icons.whatsapp className='size-4 text-emerald-600 dark:text-emerald-400' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400'>
              {statsData?.whatsappOpened ?? 0}
            </div>
            <p className='text-xs text-muted-foreground mt-1'>{t('metricWhatsappOpenedDesc')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>{t('metricOpenRate')}</CardTitle>
            <Icons.trendingUp className='size-4 text-primary' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold font-mono text-primary'>
              {statsData?.whatsappOpenRate ?? 0}%
            </div>
            <p className='text-xs text-muted-foreground mt-1'>{t('metricOpenRateDesc')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className='flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div className='relative flex-1 sm:max-w-xs'>
          <Icons.search className='absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder={t('searchPlaceholder')}
            className='ps-9'
          />
        </div>

        <div className='flex items-center gap-1.5 overflow-x-auto'>
          <Button
            size='sm'
            variant={statusFilter === 'ALL' ? 'default' : 'outline'}
            onClick={() => {
              setStatusFilter('ALL');
              setPage(1);
            }}
          >
            {t('filterAll')}
          </Button>
          <Button
            size='sm'
            variant={statusFilter === 'WHATSAPP_HANDOFF_READY' ? 'default' : 'outline'}
            onClick={() => {
              setStatusFilter('WHATSAPP_HANDOFF_READY');
              setPage(1);
            }}
          >
            <Icons.clock className='me-1 size-3.5' />
            {t('filterHandoffReady')}
          </Button>
          <Button
            size='sm'
            variant={statusFilter === 'WHATSAPP_OPENED' ? 'default' : 'outline'}
            onClick={() => {
              setStatusFilter('WHATSAPP_OPENED');
              setPage(1);
            }}
          >
            <Icons.checks className='me-1 size-3.5' />
            {t('filterWhatsappOpened')}
          </Button>
        </div>
      </div>

      {/* Orders List / Table */}
      {isLoading ? (
        <div className='flex flex-1 items-center justify-center py-16'>
          <Spinner className='size-8 text-primary' />
        </div>
      ) : orders.length === 0 ? (
        <Card className='py-16 text-center'>
          <CardContent className='flex flex-col items-center justify-center space-y-2'>
            <Icons.building className='size-10 text-muted-foreground/60' />
            <h3 className='text-base font-semibold text-foreground'>{t('emptyTitle')}</h3>
            <p className='text-sm text-muted-foreground max-w-sm'>{t('emptyDesc')}</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Desktop & Tablet Table View */}
          <div className='hidden md:flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border bg-card shadow-xs'>
            <Table containerClassName='min-h-0 flex-1 overflow-auto overscroll-contain'>
              <TableHeader className='sticky top-0 z-20 bg-background shadow-[0_1px_0_0_var(--border)]'>
                <TableRow>
                  <TableHead>{t('orderRef')}</TableHead>
                  <TableHead>{t('customer')}</TableHead>
                  <TableHead>{t('location')}</TableHead>
                  <TableHead>{t('items')}</TableHead>
                  <TableHead>{t('totalAmount')}</TableHead>
                  <TableHead>{t('status')}</TableHead>
                  <TableHead>{t('time')}</TableHead>
                  <TableHead className='text-end'>{t('actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => {
                  const itemsSummary = order.items
                    .map((i) => `${i.quantity}x ${i.name}${i.variant ? ` (${i.variant})` : ''}`)
                    .join(', ');
                  const totalPkr = formatPkr(
                    Number(order.subtotal) + (order.deliveryFee ? Number(order.deliveryFee) : 0)
                  );
                  const whatsappLink = getWhatsAppLink(order);

                  return (
                    <TableRow
                      key={order.id}
                      className='cursor-pointer hover:bg-muted/40 transition-colors'
                      onClick={() => handleOpenDetail(order)}
                    >
                      <TableCell className='font-mono font-semibold text-primary'>
                        #{order.reference}
                      </TableCell>
                      <TableCell>
                        <div className='font-medium text-foreground'>{order.customerName}</div>
                        <div className='text-xs text-muted-foreground font-mono'>
                          {order.customerPhone}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='font-medium text-foreground'>{order.deliveryArea}</div>
                        <div className='text-xs text-muted-foreground truncate max-w-[140px]'>
                          {order.landmark}
                        </div>
                      </TableCell>
                      <TableCell className='max-w-[180px] truncate text-xs text-muted-foreground'>
                        {itemsSummary}
                      </TableCell>
                      <TableCell className='font-mono font-semibold text-foreground'>
                        {totalPkr}
                      </TableCell>
                      <TableCell>
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
                      </TableCell>
                      <TableCell className='text-xs text-muted-foreground whitespace-nowrap'>
                        {new Date(order.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </TableCell>
                      <TableCell className='text-end'>
                        <div
                          className='flex items-center justify-end gap-1.5'
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            size='sm'
                            variant='ghost'
                            className='size-8 p-0 text-muted-foreground hover:text-foreground'
                            title={t('viewDetails')}
                            onClick={() => handleOpenDetail(order)}
                          >
                            <Icons.eye className='size-4' />
                          </Button>
                          <Button
                            size='sm'
                            variant='outline'
                            className='size-8 p-0 text-emerald-600 hover:text-emerald-700 border-emerald-500/30'
                            title={t('chatOnWhatsapp')}
                            render={
                              <a href={whatsappLink} target='_blank' rel='noopener noreferrer' />
                            }
                          >
                            <Icons.whatsapp className='size-4' />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card List View */}
          <div className='grid gap-3 md:hidden min-h-0 flex-1 overflow-y-auto overscroll-y-contain'>
            {orders.map((order) => {
              const totalPkr = formatPkr(
                Number(order.subtotal) + (order.deliveryFee ? Number(order.deliveryFee) : 0)
              );
              const whatsappLink = getWhatsAppLink(order);

              return (
                <Card
                  key={order.id}
                  className='cursor-pointer p-4 shadow-xs hover:border-primary/50 transition-colors'
                  onClick={() => handleOpenDetail(order)}
                >
                  <div className='flex items-start justify-between gap-2'>
                    <div>
                      <div className='font-mono font-bold text-primary'>#{order.reference}</div>
                      <div className='text-sm font-semibold text-foreground mt-0.5'>
                        {order.customerName}
                      </div>
                      <div className='font-mono text-xs text-muted-foreground'>
                        {order.customerPhone}
                      </div>
                    </div>
                    <div>
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

                  <div className='mt-2.5 text-xs text-muted-foreground'>
                    <span className='font-medium text-foreground'>{order.deliveryArea}</span>
                    <span className='mx-1'>•</span>
                    <span>{order.landmark}</span>
                  </div>

                  <div className='mt-3 flex items-center justify-between border-t pt-2.5'>
                    <div className='font-mono font-bold text-foreground text-sm'>{totalPkr}</div>
                    <div className='flex items-center gap-1.5' onClick={(e) => e.stopPropagation()}>
                      <Button size='sm' variant='outline' onClick={() => handleOpenDetail(order)}>
                        {t('viewDetails')}
                      </Button>
                      <Button
                        size='sm'
                        className='bg-emerald-600 hover:bg-emerald-700 text-white gap-1 px-2.5'
                        render={<a href={whatsappLink} target='_blank' rel='noopener noreferrer' />}
                      >
                        <Icons.whatsapp className='size-3.5' />
                        {t('chatOnWhatsapp')}
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className='shrink-0 flex items-center justify-between pt-2'>
              <div className='text-xs text-muted-foreground'>
                {t('metricTotalOrders')}: {meta?.total}
              </div>
              <div className='flex items-center gap-1'>
                <Button
                  size='sm'
                  variant='outline'
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <Icons.chevronLeft className='size-4' />
                </Button>
                <span className='px-2 text-xs font-mono font-medium'>
                  {page} / {totalPages}
                </span>
                <Button
                  size='sm'
                  variant='outline'
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  <Icons.chevronRight className='size-4' />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Order Details Dialog */}
      <OrderDetailsDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        orderId={selectedOrderId}
        initialOrder={selectedOrder}
      />
    </div>
  );
}
