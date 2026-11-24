'use client';

import * as React from 'react';
import { Popover as PopoverPrimitive } from '@base-ui/react/popover';
import {
  IconChevronDown,
  IconSearch,
  IconCheck,
  IconX,
  IconLoader2
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export interface SearchableMultiSelectOption {
  value: string;
  label: string;
  sublabel?: string;
  disabled?: boolean;
}

export interface SearchableMultiSelectProps {
  id?: string;
  name?: string;
  value: string[];
  onChange: (value: string[]) => void;
  options: SearchableMultiSelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  className?: string;
  pageSize?: number;
  maxDisplayBadges?: number;
}

export function SearchableMultiSelect({
  id,
  name,
  value = [],
  onChange,
  options,
  placeholder = 'Select options...',
  searchPlaceholder = 'Search...',
  emptyText = 'No options found',
  disabled = false,
  className,
  pageSize = 20,
  maxDisplayBadges = 5
}: SearchableMultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [visibleLimit, setVisibleLimit] = React.useState(pageSize);
  const [isLoadingBatch, setIsLoadingBatch] = React.useState(false);

  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);

  const safeValue = Array.isArray(value) ? value : [];

  const selectedOptions = React.useMemo(() => {
    return safeValue
      .map((val) => options.find((opt) => opt.value === val) ?? { value: val, label: val })
      .filter(Boolean);
  }, [options, safeValue]);

  const filteredOptions = React.useMemo(() => {
    if (!search.trim()) return options;
    const q = search.toLowerCase().trim();
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(q) ||
        (opt.sublabel && opt.sublabel.toLowerCase().includes(q))
    );
  }, [options, search]);

  const displayedOptions = React.useMemo(() => {
    return filteredOptions.slice(0, visibleLimit);
  }, [filteredOptions, visibleLimit]);

  const hasMore = visibleLimit < filteredOptions.length;

  React.useEffect(() => {
    if (open) {
      setVisibleLimit(pageSize);
      setSearch('');
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [open, pageSize]);

  React.useEffect(() => {
    setVisibleLimit(pageSize);
    if (listRef.current) {
      listRef.current.scrollTop = 0;
    }
  }, [search, pageSize]);

  const handleScroll = React.useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.currentTarget;
      const reachedBottom =
        target.scrollTop + target.clientHeight >= target.scrollHeight - 30;

      if (reachedBottom && hasMore && !isLoadingBatch) {
        setIsLoadingBatch(true);
        setTimeout(() => {
          setVisibleLimit((prev) => Math.min(prev + pageSize, filteredOptions.length));
          setIsLoadingBatch(false);
        }, 100);
      }
    },
    [hasMore, isLoadingBatch, pageSize, filteredOptions.length]
  );

  const handleToggle = (optValue: string) => {
    if (safeValue.includes(optValue)) {
      onChange(safeValue.filter((v) => v !== optValue));
    } else {
      onChange([...safeValue, optValue]);
    }
  };

  const handleRemoveOne = (e: React.MouseEvent, optValue: string) => {
    e.stopPropagation();
    onChange(safeValue.filter((v) => v !== optValue));
  };

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
  };

  return (
    <div className={cn('relative w-full', className)}>
      <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
        <PopoverPrimitive.Trigger
          render={
            <button
              id={id}
              name={name}
              type='button'
              disabled={disabled}
              suppressHydrationWarning
              className={cn(
                'group flex min-h-10 w-full items-center justify-between rounded-lg border border-input bg-background px-3 py-1.5 text-sm shadow-xs transition-colors',
                'hover:border-ring/80 hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
                'disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer text-start',
                open && 'border-ring ring-1 ring-ring'
              )}
            />
          }
        >
          <div className='flex flex-wrap items-center gap-1.5 min-w-0 flex-1 pe-2'>
            {selectedOptions.length === 0 ? (
              <span className='text-sm text-muted-foreground'>{placeholder}</span>
            ) : (
              <>
                {selectedOptions.slice(0, maxDisplayBadges).map((opt) => (
                  <Badge
                    key={opt.value}
                    variant='secondary'
                    className='h-6 text-xs font-medium px-2 py-0 gap-1 rounded-md'
                  >
                    <span className='truncate max-w-[120px]'>{opt.label}</span>
                    {!disabled && (
                      <span
                        role='button'
                        tabIndex={0}
                        onClick={(e) => handleRemoveOne(e, opt.value)}
                        className='hover:text-foreground text-muted-foreground cursor-pointer rounded-full p-0.5'
                      >
                        <IconX className='size-3' />
                      </span>
                    )}
                  </Badge>
                ))}
                {selectedOptions.length > maxDisplayBadges && (
                  <Badge variant='outline' className='h-6 text-xs font-semibold px-2'>
                    +{selectedOptions.length - maxDisplayBadges} more
                  </Badge>
                )}
              </>
            )}
          </div>

          <div className='flex items-center gap-1 shrink-0 ms-1'>
            {safeValue.length > 0 && !disabled && (
              <span
                role='button'
                tabIndex={0}
                onClick={handleClearAll}
                className='flex h-5 w-5 items-center justify-center rounded-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer'
                title='Clear all'
              >
                <IconX className='size-3.5' />
              </span>
            )}
            <IconChevronDown
              className={cn(
                'size-4 text-muted-foreground transition-transform duration-200',
                open && 'rotate-180 text-foreground'
              )}
            />
          </div>
        </PopoverPrimitive.Trigger>

        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Positioner
            side='bottom'
            align='start'
            sideOffset={4}
            className='z-50'
          >
            <PopoverPrimitive.Popup
              className={cn(
                'w-[var(--anchor-width)] min-w-[280px] max-w-[420px] rounded-xl border border-border bg-popover text-popover-foreground shadow-lg outline-none',
                'animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 duration-150'
              )}
            >
              {/* Search bar inside popover */}
              <div className='flex items-center border-b border-border/80 px-3 py-2'>
                <IconSearch className='size-4 shrink-0 text-muted-foreground me-2' />
                <input
                  ref={searchInputRef}
                  type='text'
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={searchPlaceholder}
                  className='h-7 w-full bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none'
                />
                {search && (
                  <button
                    type='button'
                    onClick={() => setSearch('')}
                    className='text-muted-foreground hover:text-foreground p-0.5'
                  >
                    <IconX className='size-3.5' />
                  </button>
                )}
              </div>

              {/* Options list with virtual/batched pagination */}
              <div
                ref={listRef}
                onScroll={handleScroll}
                className='max-h-60 overflow-y-auto p-1.5 space-y-0.5 overscroll-contain'
              >
                {displayedOptions.length === 0 ? (
                  <div className='py-6 text-center text-xs text-muted-foreground'>
                    {emptyText}
                  </div>
                ) : (
                  displayedOptions.map((opt) => {
                    const isSelected = safeValue.includes(opt.value);
                    return (
                      <button
                        key={opt.value}
                        type='button'
                        disabled={opt.disabled}
                        onClick={() => handleToggle(opt.value)}
                        className={cn(
                          'relative flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs transition-colors cursor-pointer text-start',
                          isSelected
                            ? 'bg-primary/10 text-primary font-medium dark:bg-primary/20'
                            : 'hover:bg-muted/70 text-foreground',
                          opt.disabled && 'cursor-not-allowed opacity-50'
                        )}
                      >
                        <div className='flex flex-col truncate min-w-0 pe-2'>
                          <span className='truncate font-medium'>{opt.label}</span>
                          {opt.sublabel && (
                            <span className='truncate text-[10px] text-muted-foreground'>
                              {opt.sublabel}
                            </span>
                          )}
                        </div>
                        <div
                          className={cn(
                            'flex size-4 shrink-0 items-center justify-center rounded border transition-colors',
                            isSelected
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-muted-foreground/40 bg-background'
                          )}
                        >
                          {isSelected && <IconCheck className='size-3 stroke-[3]' />}
                        </div>
                      </button>
                    );
                  })
                )}

                {isLoadingBatch && (
                  <div className='flex items-center justify-center py-2 text-xs text-muted-foreground gap-1.5'>
                    <IconLoader2 className='size-3.5 animate-spin' />
                    <span>Loading more...</span>
                  </div>
                )}
              </div>

              {/* Popover footer */}
              <div className='flex items-center justify-between border-t border-border/80 px-3 py-2 bg-muted/30 rounded-b-xl text-xs'>
                <span className='text-muted-foreground font-mono'>
                  {safeValue.length} selected
                </span>
                <button
                  type='button'
                  onClick={() => setOpen(false)}
                  className='rounded-md bg-primary px-3 py-1 font-semibold text-primary-foreground text-xs hover:opacity-90 shadow-2xs'
                >
                  Done
                </button>
              </div>
            </PopoverPrimitive.Popup>
          </PopoverPrimitive.Positioner>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
    </div>
  );
}
