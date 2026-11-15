'use client';

import { useRouter } from '@/i18n/navigation';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useT } from '@/i18n/use-t';
import { cn } from '@/lib/utils';
import type { RowAction, RowActionsMenuProps } from '@/types';

export function RowActionsMenu({ actions, className, contentClassName }: RowActionsMenuProps) {
  const t = useT();
  const router = useRouter();

  if (actions.length === 0) return null;

  const handleActionClick = (e: React.MouseEvent, action: RowAction) => {
    e.stopPropagation();
    requestAnimationFrame(() => {
      if (action.onClick) {
        action.onClick();
        return;
      }
      if (action.href) {
        router.push(action.href);
      }
    });
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger
        onClick={(e) => e.stopPropagation()}
        render={
          <Button
            type='button'
            variant='ghost'
            className={cn(
              'size-11 min-h-11 min-w-11 p-0 sm:size-8 sm:min-h-8 sm:min-w-8',
              className
            )}
          />
        }
      >
        <span className='sr-only'>{t('common.openMenu')}</span>
        <Icons.ellipsis className='h-4 w-4' />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align='end'
        className={cn('w-auto min-w-52 p-1.5 whitespace-nowrap', contentClassName)}
      >
        <DropdownMenuGroup>
          {actions.map((action) => {
            const Icon = action.icon ?? Icons.chevronRight;
            return (
              <DropdownMenuItem
                key={action.label}
                variant={action.variant}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2 text-xs font-medium cursor-pointer whitespace-nowrap',
                  action.className
                )}
                disabled={action.disabled}
                onClick={(e) => handleActionClick(e, action)}
              >
                <Icon className='h-4 w-4 shrink-0' />
                <span className='whitespace-nowrap'>{action.label}</span>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
