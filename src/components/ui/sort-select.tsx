'use client';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useTranslations } from 'next-intl';

export interface SortOptionItem {
  value: string;
  label: string;
}

export interface SortSelectProps {
  value: string;
  onValueChange: (val: string | null) => void;
  options?: SortOptionItem[];
  className?: string;
}

export function SortSelect({
  value,
  onValueChange,
  options,
  className = 'h-9 w-[9.5rem] text-xs [&[data-size]]:h-9 bg-card'
}: SortSelectProps) {
  const t = useTranslations('table');
  const activeOptions = options ?? [
    { value: 'default', label: t('sortDefault') },
    { value: 'name-asc', label: t('sortNameAsc') },
    { value: 'name-desc', label: t('sortNameDesc') },
    { value: 'price-asc', label: t('sortPriceAsc') },
    { value: 'price-desc', label: t('sortPriceDesc') },
    { value: 'newest', label: t('sortNewest') }
  ];

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={t('sortBy')} />
      </SelectTrigger>
      <SelectContent side='bottom'>
        <SelectGroup>
          {activeOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

