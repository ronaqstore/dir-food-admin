'use client';

import { isValidElement, type ReactElement, type ReactNode } from 'react';
import type { Table as TanstackTable } from '@tanstack/react-table';
import { ResponsiveDataTable } from '@/components/data-table/responsive-data-table';
import type {
  DetailConfig,
  MobileItemConfig,
  QuickFilterChip,
  LedgerListConfig
} from '@/components/data-table/types';

interface DataTableProps<TData> {
  table: TanstackTable<TData>;
  actionBar?: ReactNode;
  children?: ReactNode;
  className?: string;
  mobileItem?: MobileItemConfig<TData>;
  detail?: DetailConfig<TData> | Partial<DetailConfig<TData>>;
  quickFilters?: QuickFilterChip[];
  ledger?: LedgerListConfig<TData>;
}

export function DataTable<TData>({
  table,
  children,
  className,
  mobileItem,
  detail,
  quickFilters,
  ledger
}: DataTableProps<TData>) {
  let toolbarAction: ReactNode;
  if (isValidElement(children)) {
    const el = children as ReactElement<{ children?: ReactNode }>;
    toolbarAction = el.props.children;
  }

  return (
    <ResponsiveDataTable
      table={table}
      toolbarAction={toolbarAction}
      mobileItem={mobileItem}
      detail={detail}
      quickFilters={quickFilters}
      ledger={ledger}
      className={className}
    />
  );
}
