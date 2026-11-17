'use client';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

export interface StandardPaginationProps {
  page: number;
  pageSize: number;
  total: number;
  pageSizeOptions?: number[];
  onPageChange: (newPage: number) => void;
  onPageSizeChange: (newPageSize: number) => void;
  className?: string;
  disabled?: boolean;
}

export function StandardPagination({
  page,
  pageSize,
  total,
  pageSizeOptions = [10, 20, 30, 50, 100],
  onPageChange,
  onPageSizeChange,
  className,
  disabled = false
}: StandardPaginationProps) {
  const t = useTranslations();
  const pageIndex = Math.max(0, page - 1);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : pageIndex * pageSize + 1;
  const to = Math.min(total, (pageIndex + 1) * pageSize);
  const canPrevious = page > 1;
  const canNext = page < totalPages;

  return (
    <div
      className={cn('flex w-full flex-wrap items-center justify-between gap-2 p-1', className)}
    >
      <div className='text-muted-foreground text-sm whitespace-nowrap'>
        {t('table.rowsRange', { from, to, total })}
      </div>

      <div className='flex items-center gap-2'>
        <div className='hidden items-center gap-2 sm:flex'>
          <p className='text-sm font-medium whitespace-nowrap'>{t('table.rowsPerPage')}</p>
          <Select
            items={pageSizeOptions.map((size) => ({
              value: `${size}`,
              label: `${size}`
            }))}
            value={`${pageSize}`}
            onValueChange={(value) => {
              if (value != null) onPageSizeChange(Number(value));
            }}
          >
            <SelectTrigger className='h-8 w-[4.5rem] [&[data-size]]:h-8'>
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent side='top' alignItemWithTrigger={false}>
              <SelectGroup>
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={`${size}`}>
                    {size}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className='flex items-center gap-1'>
          <Button
            type='button'
            aria-label={t('table.firstPage')}
            variant='outline'
            size='icon'
            className='hidden size-8 lg:flex'
            onClick={() => onPageChange(1)}
            disabled={!canPrevious || disabled}
          >
            <Icons.chevronsLeft className='rtl:rotate-180' />
          </Button>
          <Button
            type='button'
            aria-label={t('table.prevPage')}
            variant='outline'
            size='icon'
            className='size-8'
            onClick={() => onPageChange(page - 1)}
            disabled={!canPrevious || disabled}
          >
            <Icons.chevronLeft className='rtl:rotate-180' />
          </Button>
          <Button
            type='button'
            aria-label={t('table.nextPage')}
            variant='outline'
            size='icon'
            className='size-8'
            onClick={() => onPageChange(page + 1)}
            disabled={!canNext || disabled}
          >
            <Icons.chevronRight className='rtl:rotate-180' />
          </Button>
          <Button
            type='button'
            aria-label={t('table.lastPage')}
            variant='outline'
            size='icon'
            className='hidden size-8 lg:flex'
            onClick={() => onPageChange(totalPages)}
            disabled={!canNext || disabled}
          >
            <Icons.chevronsRight className='rtl:rotate-180' />
          </Button>
        </div>
      </div>
    </div>
  );
}
