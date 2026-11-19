'use client';

import type { Option } from '@/types/data-table';
import type { Column } from '@tanstack/react-table';
import { Icons } from '@/components/icons';
import { DataTableFilterClear } from '@/components/ui/table/data-table-filter-clear';
import { useT } from '@/i18n/use-t';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import * as React from 'react';

interface DataTableFacetedFilterProps<TData, TValue> {
  column?: Column<TData, TValue>;
  title?: string;
  options: Option[];
  multiple?: boolean;
}

export function DataTableFacetedFilter<TData, TValue>({
  column,
  title,
  options,
  multiple
}: DataTableFacetedFilterProps<TData, TValue>) {
  const t = useT();
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [visibleLimit, setVisibleLimit] = React.useState(20);

  React.useEffect(() => {
    if (open) {
      setSearch('');
      setVisibleLimit(20);
    }
  }, [open]);

  React.useEffect(() => {
    setVisibleLimit(20);
  }, [search]);

  const filteredOptions = React.useMemo(() => {
    if (!search.trim()) return options;
    const q = search.toLowerCase().trim();
    return options.filter((opt) => opt.label.toLowerCase().includes(q));
  }, [options, search]);

  const displayedOptions = React.useMemo(() => {
    return filteredOptions.slice(0, visibleLimit);
  }, [filteredOptions, visibleLimit]);

  const handleScroll = React.useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.currentTarget;
      const reachedBottom =
        target.scrollTop + target.clientHeight >= target.scrollHeight - 30;

      if (reachedBottom && visibleLimit < filteredOptions.length) {
        setVisibleLimit((prev) => Math.min(prev + 20, filteredOptions.length));
      }
    },
    [visibleLimit, filteredOptions.length]
  );

  const columnFilterValue = column?.getFilterValue();
  const selectedValues = React.useMemo(
    () => new Set(Array.isArray(columnFilterValue) ? columnFilterValue : []),
    [columnFilterValue]
  );

  const onItemSelect = React.useCallback(
    (option: Option, isSelected: boolean) => {
      if (!column) return;

      if (multiple) {
        const newSelectedValues = new Set(selectedValues);
        if (isSelected) {
          newSelectedValues.delete(option.value);
        } else {
          newSelectedValues.add(option.value);
        }
        const filterValues = Array.from(newSelectedValues);
        column.setFilterValue(filterValues.length ? filterValues : undefined);
      } else {
        column.setFilterValue(isSelected ? undefined : [option.value]);
        setOpen(false);
      }
    },
    [column, multiple, selectedValues]
  );

  const onReset = React.useCallback(
    (event?: React.MouseEvent | React.KeyboardEvent) => {
      event?.stopPropagation();
      column?.setFilterValue(undefined);
    },
    [column]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={<Button type='button' variant='outline' size='sm' className='h-8 gap-1.5 border-dashed' />}
      >
        {selectedValues?.size > 0 ? (
          <DataTableFilterClear title={title} onReset={onReset} />
        ) : (
          <Icons.plusCircle />
        )}
        {title}
        {selectedValues?.size > 0 && (
          <>
            <Separator orientation='vertical' className='mx-0.5 data-[orientation=vertical]:h-4' />
            <Badge variant='secondary' className='rounded-sm px-1 font-normal lg:hidden'>
              {selectedValues.size}
            </Badge>
            <div className='hidden items-center gap-1 lg:flex'>
              {selectedValues.size > 2 ? (
                <Badge variant='secondary' className='rounded-sm px-1 font-normal'>
                  {selectedValues.size} {t('common.selected')}
                </Badge>
              ) : (
                options
                  .filter((option) => selectedValues.has(option.value))
                  .map((option) => (
                    <Badge
                      variant='secondary'
                      key={option.value}
                      className='rounded-sm px-1 font-normal'
                    >
                      {option.label}
                    </Badge>
                  ))
              )}
            </div>
          </>
        )}
      </PopoverTrigger>
      <PopoverContent className='w-56 p-1.5' align='start' sideOffset={6}>
        <Command shouldFilter={false}>
          {options.length > 5 ? (
            <CommandInput
              value={search}
              onValueChange={setSearch}
              placeholder={title || 'Search...'}
            />
          ) : null}
          <CommandList className='max-h-full'>
            <CommandGroup
              onScroll={handleScroll}
              className='max-h-[18.75rem] overflow-x-hidden overflow-y-auto no-scrollbar p-0.5 [&_[cmdk-group-items]]:space-y-1'
            >
              {displayedOptions.map((option) => {
                const isSelected = selectedValues.has(option.value);

                return (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => onItemSelect(option, isSelected)}
                    className='my-0.5 flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors'
                  >
                    <div
                      className={cn(
                        'border-primary flex size-4 items-center justify-center rounded-sm border',
                        isSelected ? 'bg-primary' : 'opacity-50 [&_svg]:invisible'
                      )}
                    >
                      <Icons.check />
                    </div>
                    {option.icon && <option.icon />}
                    <span className='truncate'>{option.label}</span>
                    {option.count && (
                      <span className='ms-auto font-mono text-xs'>{option.count}</span>
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {selectedValues.size > 0 && (
              <>
                <CommandSeparator className='my-1' />
                <CommandGroup className='p-0.5'>
                  <CommandItem
                    onSelect={() => onReset()}
                    className='justify-center rounded-md py-1.5 text-center'
                  >
                    {t('table.resetFilters')}
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
