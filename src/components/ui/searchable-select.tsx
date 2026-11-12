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

export interface SearchableSelectOption {
  value: string;
  label: string;
  sublabel?: string;
  disabled?: boolean;
}

export interface SearchableSelectProps {
  id?: string;
  name?: string;
  value?: string;
  onChange?: (value: string) => void;
  options: SearchableSelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  triggerClassName?: string;
  pageSize?: number;
  allowClear?: boolean;
  /** Optional async callback to fetch the next batch from the server */
  onLoadMore?: () => Promise<void> | void;
  hasMoreRemote?: boolean;
  isLoadingRemote?: boolean;
}

export function SearchableSelect({
  id,
  name,
  value,
  onChange,
  options,
  placeholder = 'Select an option...',
  searchPlaceholder = 'Search...',
  emptyText = 'No options found',
  disabled = false,
  required = false,
  className,
  triggerClassName,
  pageSize = 20,
  allowClear = false,
  onLoadMore,
  hasMoreRemote = false,
  isLoadingRemote = false
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [visibleLimit, setVisibleLimit] = React.useState(pageSize);
  const [isLoadingBatch, setIsLoadingBatch] = React.useState(false);

  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);

  // Find currently selected option
  const selectedOption = React.useMemo(() => {
    if (!value) return null;
    return options.find((opt) => opt.value === value) ?? null;
  }, [options, value]);

  // Filter options based on search query
  const filteredOptions = React.useMemo(() => {
    if (!search.trim()) return options;
    const q = search.toLowerCase().trim();
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(q) ||
        (opt.sublabel && opt.sublabel.toLowerCase().includes(q))
    );
  }, [options, search]);

  // Display only the current paginated slice (starts at 20, increments by 20 on scroll)
  const displayedOptions = React.useMemo(() => {
    return filteredOptions.slice(0, visibleLimit);
  }, [filteredOptions, visibleLimit]);

  const hasMoreLocal = visibleLimit < filteredOptions.length;
  const canLoadMore = hasMoreLocal || (hasMoreRemote && !isLoadingRemote);

  // Auto-focus search input when popover opens
  React.useEffect(() => {
    if (open) {
      setVisibleLimit(pageSize);
      setSearch('');
      // Small timeout to allow popover animation / mounting to complete
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [open, pageSize]);

  // Reset pagination when search query changes
  React.useEffect(() => {
    setVisibleLimit(pageSize);
    if (listRef.current) {
      listRef.current.scrollTop = 0;
    }
  }, [search, pageSize]);

  // Handle scroll to bottom -> auto-fetch next 20 items ("like Instagram")
  const handleScroll = React.useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.currentTarget;
      const reachedBottom =
        target.scrollTop + target.clientHeight >= target.scrollHeight - 30;

      if (reachedBottom && canLoadMore && !isLoadingBatch && !isLoadingRemote) {
        if (hasMoreLocal) {
          setIsLoadingBatch(true);
          setTimeout(() => {
            setVisibleLimit((prev) => Math.min(prev + pageSize, filteredOptions.length));
            setIsLoadingBatch(false);
          }, 120);
        } else if (onLoadMore && hasMoreRemote) {
          onLoadMore();
        }
      }
    },
    [canLoadMore, isLoadingBatch, isLoadingRemote, hasMoreLocal, pageSize, filteredOptions.length, onLoadMore, hasMoreRemote]
  );

  const handleSelect = (val: string) => {
    onChange?.(val);
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.('');
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
              className={cn(
                'group flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors',
                'hover:border-ring/80 hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
                'disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer',
                !selectedOption && 'text-muted-foreground',
                open && 'border-ring ring-1 ring-ring',
                triggerClassName
              )}
            />
          }
        >
          <div className='flex items-center gap-2 truncate text-start min-w-0'>
            {selectedOption ? (
              <>
                <span className='truncate font-medium text-foreground'>
                  {selectedOption.label}
                </span>
                {selectedOption.sublabel && (
                  <span className='truncate text-xs text-muted-foreground'>
                    ({selectedOption.sublabel})
                  </span>
                )}
              </>
            ) : (
              <span className='truncate text-muted-foreground'>{placeholder}</span>
            )}
          </div>

          <div className='flex items-center gap-1 shrink-0 ms-1'>
            {allowClear && selectedOption && !disabled && (
              <button
                type='button'
                onClick={handleClear}
                aria-label='Clear selection'
                className='flex h-5 w-5 items-center justify-center rounded-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer'
              >
                <IconX className='h-3.5 w-3.5' />
              </button>
            )}
            <IconChevronDown
              className={cn(
                'h-4 w-4 text-muted-foreground transition-transform duration-200',
                open && 'rotate-180 text-foreground'
              )}
            />
          </div>
        </PopoverPrimitive.Trigger>

        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Positioner
            align='start'
            side='bottom'
            sideOffset={4}
            className='isolate z-[9999]'
          >
            <PopoverPrimitive.Popup
              data-slot='searchable-select-popup'
              className={cn(
                'z-[9999] flex w-[var(--anchor-width)] min-w-[240px] flex-col rounded-xl border border-border bg-popover text-popover-foreground shadow-xl ring-1 ring-black/5 outline-none',
                'duration-100 data-[side=bottom]:slide-in-from-top-1 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 p-1.5'
              )}
            >
              {/* Search Bar */}
              <div className='relative mb-1.5 px-0.5'>
                <div className='pointer-events-none absolute inset-y-0 start-2.5 flex items-center text-muted-foreground'>
                  <IconSearch className='h-3.5 w-3.5' />
                </div>
                <input
                  ref={searchInputRef}
                  type='text'
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={searchPlaceholder}
                  className='h-8 w-full rounded-lg border border-input/60 bg-muted/40 ps-8 pe-7 text-xs text-foreground placeholder:text-muted-foreground focus:border-ring focus:bg-background focus:outline-none focus:ring-1 focus:ring-ring'
                />
                {search && (
                  <button
                    type='button'
                    onClick={() => setSearch('')}
                    className='absolute inset-y-0 end-2 flex items-center text-muted-foreground hover:text-foreground cursor-pointer'
                    aria-label='Clear search'
                  >
                    <IconX className='h-3 w-3' />
                  </button>
                )}
              </div>

              {/* Items Counter Header (when many items) */}
              {filteredOptions.length > pageSize && (
                <div className='flex items-center justify-between px-2 py-1 text-[11px] font-medium text-muted-foreground border-b border-border/50 mb-1'>
                  <span>Matches: {filteredOptions.length}</span>
                  <span className='text-[10px] text-primary/80'>
                    Showing {displayedOptions.length} of {filteredOptions.length}
                  </span>
                </div>
              )}

              {/* Scrollable list with auto-fetch infinite scroll */}
              <div
                ref={listRef}
                onScroll={handleScroll}
                className='max-h-56 overflow-y-auto space-y-0.5 p-0.5 scrollbar-thin'
              >
                {displayedOptions.length === 0 ? (
                  <div className='py-6 text-center text-xs text-muted-foreground'>
                    <IconSearch className='mx-auto h-5 w-5 mb-1.5 opacity-40' />
                    <p>{emptyText}</p>
                    {search && (
                      <p className='text-[10px] mt-0.5 text-muted-foreground/75'>
                        No match for &ldquo;{search}&rdquo;
                      </p>
                    )}
                  </div>
                ) : (
                  displayedOptions.map((opt) => {
                    const isSelected = opt.value === value;
                    return (
                      <button
                        key={opt.value}
                        type='button'
                        disabled={opt.disabled}
                        onClick={() => handleSelect(opt.value)}
                        className={cn(
                          'flex w-full cursor-pointer items-center justify-between rounded-lg px-2.5 py-1.5 text-start text-xs transition-colors',
                          isSelected
                            ? 'bg-primary/10 font-semibold text-primary'
                            : 'text-foreground hover:bg-muted/70',
                          opt.disabled && 'cursor-not-allowed opacity-40'
                        )}
                      >
                        <div className='flex flex-col truncate pe-2'>
                          <span className='truncate'>{opt.label}</span>
                          {opt.sublabel && (
                            <span className='truncate text-[10px] text-muted-foreground font-normal'>
                              {opt.sublabel}
                            </span>
                          )}
                        </div>
                        {isSelected && (
                          <IconCheck className='h-4 w-4 shrink-0 text-primary' />
                        )}
                      </button>
                    );
                  })
                )}

                {/* Loading indicator when scrolling near bottom to fetch next 20 items */}
                {(isLoadingBatch || isLoadingRemote) && (
                  <div className='flex items-center justify-center gap-1.5 py-2 text-xs text-primary font-medium'>
                    <IconLoader2 className='h-3.5 w-3.5 animate-spin' />
                    <span className='text-[11px]'>Loading more items...</span>
                  </div>
                )}

                {/* Subtle end indicator when all loaded */}
                {!hasMoreLocal && !hasMoreRemote && filteredOptions.length > pageSize && (
                  <div className='py-1.5 text-center text-[10px] text-muted-foreground/70'>
                    All {filteredOptions.length} items loaded
                  </div>
                )}
              </div>
            </PopoverPrimitive.Popup>
          </PopoverPrimitive.Positioner>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>

      {/* Hidden input to support native form submissions & validations */}
      {required && (
        <input
          tabIndex={-1}
          autoComplete='off'
          style={{
            opacity: 0,
            position: 'absolute',
            pointerEvents: 'none',
            left: 0,
            bottom: 0,
            width: 1,
            height: 1
          }}
          value={value || ''}
          onChange={() => {}}
          required={required}
        />
      )}
    </div>
  );
}

