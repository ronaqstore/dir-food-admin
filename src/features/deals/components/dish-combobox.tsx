'use client';

import * as React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  IconSearch,
  IconCheck,
  IconChevronDown,
  IconX,
  IconPhoto
} from '@tabler/icons-react';
import { formatPkr, fromPaisa, toPaisa } from '@/lib/money';
import { cn } from '@/lib/utils';
import type { MenuItemDTO } from '@/features/menu/types';

interface DishComboboxProps {
  value?: string;
  onSelect: (dish: MenuItemDTO) => void;
  dishes: MenuItemDTO[];
  disabled?: boolean;
}

function getDishPrice(dish: MenuItemDTO): number {
  if (dish.basePrice != null && dish.basePrice > 0) {
    return fromPaisa(dish.basePrice);
  }
  if (dish.variants && dish.variants.length > 0) {
    const first = dish.variants.find((v) => v.isActive !== false) || dish.variants[0];
    if (first && first.price > 0) {
      return fromPaisa(first.price);
    }
  }
  return 0;
}

export function DishCombobox({
  value,
  onSelect,
  dishes,
  disabled
}: DishComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');

  const selectedDish = React.useMemo(() => {
    return dishes.find((d) => d.id === value) || null;
  }, [dishes, value]);

  // Group dishes by category with search filtering
  const filteredGroups = React.useMemo(() => {
    const q = search.toLowerCase().trim();
    const map = new Map<string, { categoryName: string; items: MenuItemDTO[] }>();

    for (const dish of dishes) {
      const catName = dish.category?.name || 'General Menu';
      const matchesSearch =
        !q ||
        dish.name.toLowerCase().includes(q) ||
        (dish.description && dish.description.toLowerCase().includes(q)) ||
        catName.toLowerCase().includes(q);

      if (!matchesSearch) continue;

      if (!map.has(catName)) {
        map.set(catName, { categoryName: catName, items: [] });
      }
      map.get(catName)?.items.push(dish);
    }

    return Array.from(map.values());
  }, [dishes, search]);

  const totalFilteredCount = React.useMemo(() => {
    return filteredGroups.reduce((acc, g) => acc + g.items.length, 0);
  }, [filteredGroups]);

  const handlePick = (dish: MenuItemDTO) => {
    onSelect(dish);
    setOpen(false);
    setSearch('');
  };

  const selectedPrice = selectedDish ? getDishPrice(selectedDish) : 0;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            type='button'
            variant='outline'
            role='combobox'
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              'w-full justify-between h-9 px-2.5 text-xs font-normal bg-background hover:bg-muted/50 border-input shadow-2xs min-w-0 overflow-hidden',
              !selectedDish && 'text-muted-foreground'
            )}
          />
        }
      >
        <span className='flex items-center gap-2 truncate flex-1 min-w-0 text-start overflow-hidden'>
          {selectedDish ? (
            <>
              {selectedDish.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={selectedDish.imageUrl}
                  alt=''
                  className='size-5 rounded object-cover shrink-0 bg-muted'
                />
              ) : null}
              <span className='font-medium text-foreground truncate min-w-0 flex-1'>
                {selectedDish.name}
              </span>
              {selectedPrice > 0 ? (
                <span className='text-muted-foreground font-semibold shrink-0 ps-1 text-[11px] whitespace-nowrap'>
                  {formatPkr(toPaisa(selectedPrice))}
                </span>
              ) : null}
            </>
          ) : (
            <span className='truncate text-muted-foreground'>Select a dish from menu...</span>
          )}
        </span>

        <IconChevronDown className='size-3.5 shrink-0 text-muted-foreground opacity-60 ms-1' />
      </PopoverTrigger>

      <PopoverContent
        align='start'
        side='bottom'
        sideOffset={4}
        className='z-50 w-[var(--radix-popover-trigger-width)] min-w-[280px] sm:min-w-[360px] max-w-[calc(100vw-2rem)] sm:max-w-[440px] p-0 shadow-lg border border-border bg-popover overflow-hidden'
      >
        {/* Search Header */}
        <div className='p-2 border-b border-border/70 bg-muted/20'>
          <div className='relative flex items-center'>
            <IconSearch className='pointer-events-none absolute start-2.5 size-3.5 text-muted-foreground' />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder='Search dishes or categories...'
              className='h-8 ps-8 pe-8 text-xs bg-background'
              autoFocus
            />
            {search ? (
              <button
                type='button'
                onClick={() => setSearch('')}
                className='absolute end-2.5 text-muted-foreground hover:text-foreground p-0.5'
                aria-label='Clear search'
              >
                <IconX className='size-3' />
              </button>
            ) : null}
          </div>
        </div>

        {/* Scrollable Dish List */}
        <div className='max-h-64 overflow-y-auto p-1.5 space-y-2 text-xs'>
          {totalFilteredCount === 0 ? (
            <div className='py-8 text-center text-xs text-muted-foreground'>
              No dishes found matching &ldquo;{search}&rdquo;
            </div>
          ) : (
            filteredGroups.map((group) => (
              <div key={group.categoryName} className='space-y-1'>
                <div className='px-2 py-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between'>
                  <span>{group.categoryName}</span>
                  <span className='text-[10px] font-normal lowercase opacity-70'>
                    {group.items.length} {group.items.length === 1 ? 'item' : 'items'}
                  </span>
                </div>

                <div className='space-y-0.5'>
                  {group.items.map((dish) => {
                    const isSelected = selectedDish?.id === dish.id;
                    const price = getDishPrice(dish);

                    return (
                      <div
                        key={dish.id}
                        onClick={() => handlePick(dish)}
                        className={cn(
                          'flex items-center justify-between gap-2.5 rounded-md px-2 py-1.5 cursor-pointer transition-colors',
                          isSelected
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'hover:bg-muted/80 text-foreground'
                        )}
                      >
                        <div className='flex items-center gap-2 min-w-0 flex-1'>
                          {dish.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={dish.imageUrl}
                              alt=''
                              className='size-7 rounded object-cover shrink-0 bg-muted border border-border/60'
                            />
                          ) : (
                            <div className='size-7 rounded bg-muted flex items-center justify-center shrink-0 text-muted-foreground'>
                              <IconPhoto className='size-3.5 opacity-50' />
                            </div>
                          )}

                          <div className='min-w-0 flex-1'>
                            <p className='truncate font-medium text-xs leading-tight'>
                              {dish.name}
                            </p>
                            {dish.description ? (
                              <p className='text-[10px] text-muted-foreground truncate leading-tight mt-0.5'>
                                {dish.description}
                              </p>
                            ) : null}
                          </div>
                        </div>

                        <div className='flex items-center gap-2 shrink-0'>
                          {price > 0 ? (
                            <Badge
                              variant='secondary'
                              className='text-[11px] font-semibold px-1.5 py-0'
                            >
                              {formatPkr(toPaisa(price))}
                            </Badge>
                          ) : null}

                          <div className='size-4 flex items-center justify-center'>
                            {isSelected ? (
                              <IconCheck className='size-3.5 text-primary stroke-[2.5]' />
                            ) : null}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

