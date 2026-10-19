'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
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
import { useMasterAreas, useUpdateMasterArea } from '../api/platform-query';
import { MasterAreaDialog } from './master-area-dialog';
import type { MasterArea } from '../types';

export function PlatformSettingsView() {
  const t = useTranslations('platformAreas');
  const [search, setSearch] = React.useState('');
  const [selectedArea, setSelectedArea] = React.useState<MasterArea | null>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const { data: areas = [], isLoading } = useMasterAreas();
  const updateMutation = useUpdateMasterArea();

  const filteredAreas = React.useMemo(() => {
    if (!search.trim()) return areas;
    const q = search.trim().toLowerCase();
    return areas.filter(
      (a) => a.name.toLowerCase().includes(q) || a.slug.toLowerCase().includes(q)
    );
  }, [areas, search]);

  const totalAreas = areas.length;
  const activeAreas = areas.filter((a) => a.isActive).length;
  const totalCoverageLinks = areas.reduce((sum, a) => sum + (a.activeRestaurantsCount || 0), 0);

  const handleOpenCreate = () => {
    setSelectedArea(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (area: MasterArea) => {
    setSelectedArea(area);
    setIsDialogOpen(true);
  };

  const handleToggleActive = async (area: MasterArea) => {
    try {
      await updateMutation.mutateAsync({
        id: area.id,
        input: { isActive: !area.isActive }
      });
      toast.success(t('areaUpdated'));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update area status';
      toast.error(msg);
    }
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight text-foreground sm:text-3xl'>
            {t('title')}
          </h1>
          <p className='text-sm text-muted-foreground mt-1'>{t('subtitle')}</p>
        </div>
        <Button onClick={handleOpenCreate} className='gap-1.5 self-start sm:self-auto'>
          <Icons.add className='size-4' />
          {t('addArea')}
        </Button>
      </div>

      {/* KPI Metrics */}
      <div className='grid gap-4 sm:grid-cols-3'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>{t('metricTotal')}</CardTitle>
            <Icons.building className='size-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold font-mono'>{totalAreas}</div>
            <p className='text-xs text-muted-foreground mt-1'>{t('metricTotalDesc')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>{t('metricActive')}</CardTitle>
            <Icons.circleCheck className='size-4 text-emerald-600 dark:text-emerald-400' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400'>
              {activeAreas}
            </div>
            <p className='text-xs text-muted-foreground mt-1'>{t('metricActiveDesc')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>{t('metricCoverage')}</CardTitle>
            <Icons.trendingUp className='size-4 text-primary' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold font-mono text-primary'>{totalCoverageLinks}</div>
            <p className='text-xs text-muted-foreground mt-1'>{t('metricCoverageDesc')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <div className='flex items-center justify-between gap-3'>
        <div className='relative flex-1 sm:max-w-xs'>
          <Icons.search className='absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className='ps-9'
          />
        </div>
      </div>

      {/* Areas Table */}
      {isLoading ? (
        <div className='flex flex-col items-center justify-center py-16'>
          <Spinner className='size-8 text-primary' />
        </div>
      ) : filteredAreas.length === 0 ? (
        <Card className='py-16 text-center'>
          <CardContent className='flex flex-col items-center justify-center space-y-2'>
            <Icons.building className='size-10 text-muted-foreground/60' />
            <h3 className='text-base font-semibold text-foreground'>{t('metricTotal')}</h3>
            <p className='text-sm text-muted-foreground max-w-sm'>{t('subtitle')}</p>
          </CardContent>
        </Card>
      ) : (
        <div className='overflow-hidden rounded-lg border bg-card shadow-xs'>
          <Table>
            <TableHeader className='bg-muted/40'>
              <TableRow>
                <TableHead>{t('colName')}</TableHead>
                <TableHead>{t('colSlug')}</TableHead>
                <TableHead>{t('colSort')}</TableHead>
                <TableHead>{t('colRestaurants')}</TableHead>
                <TableHead>{t('colStatus')}</TableHead>
                <TableHead className='text-end'>{t('colActions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAreas.map((area) => (
                <TableRow key={area.id} className='hover:bg-muted/30 transition-colors'>
                  <TableCell className='font-semibold text-foreground'>{area.name}</TableCell>
                  <TableCell className='font-mono text-xs text-muted-foreground'>
                    {area.slug}
                  </TableCell>
                  <TableCell className='font-mono text-xs text-muted-foreground'>
                    {area.sortOrder}
                  </TableCell>
                  <TableCell>
                    <Badge variant='outline' className='text-[11px] font-medium'>
                      {t('restaurantsCount', { count: area.activeRestaurantsCount || 0 })}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className='flex items-center gap-2'>
                      <Switch
                        checked={area.isActive}
                        onCheckedChange={() => handleToggleActive(area)}
                        disabled={updateMutation.isPending}
                      />
                      <span className='text-xs text-muted-foreground'>
                        {area.isActive ? t('active') : t('inactive')}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className='text-end'>
                    <Button
                      size='sm'
                      variant='ghost'
                      className='gap-1 text-xs'
                      onClick={() => handleOpenEdit(area)}
                    >
                      <Icons.edit className='size-3.5' />
                      {t('editArea')}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Area Dialog */}
      <MasterAreaDialog area={selectedArea} open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </div>
  );
}
