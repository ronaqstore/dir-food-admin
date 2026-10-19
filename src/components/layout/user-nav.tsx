'use client';

import { useSession, signOut } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Icons } from '@/components/icons';
import { Link } from '@/i18n/navigation';
import type { SessionUserShape } from '@/types/auth';

export function UserNav() {
  const { data: session } = useSession();
  const t = useTranslations();
  const user = session?.user as SessionUserShape | undefined;

  if (!user) {
    return null;
  }

  const initials = user.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  const isPlatformAdmin = user.role === 'PLATFORM_ADMIN';
  const roleLabel = isPlatformAdmin
    ? t('auth.platformAdminTitle')
    : user.restaurantName || t('nav.restaurantOwner');

  const handleSignOut = () => {
    signOut({ callbackUrl: isPlatformAdmin ? '/platform-admin/login' : '/login' });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant='ghost'
            className='relative h-9 w-9 rounded-full ring-offset-background hover:ring-2 hover:ring-ring'
          />
        }
      >
        <Avatar className='h-9 w-9'>
          <AvatarFallback className='bg-primary/10 text-primary font-semibold text-xs'>
            {initials}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-56' align='end'>
        <DropdownMenuLabel className='font-normal'>
          <div className='flex flex-col space-y-1'>
            <p className='text-sm font-semibold leading-none text-foreground'>{user.name}</p>
            <p className='text-xs leading-none text-muted-foreground'>
              {user.phoneNumber || user.email}
            </p>
            <p className='text-[11px] font-medium text-primary pt-0.5'>{roleLabel}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            render={
              <Link
                href={isPlatformAdmin ? '/dashboard/platform' : '/dashboard/overview'}
                className='flex cursor-pointer items-center'
              />
            }
          >
            <Icons.dashboard className='mr-2 h-4 w-4 rtl:ml-2 rtl:mr-0' />
            <span>{t('nav.dashboard')}</span>
          </DropdownMenuItem>
          {!isPlatformAdmin ? (
            <DropdownMenuItem
              render={
                <Link href='/dashboard/settings' className='flex cursor-pointer items-center' />
              }
            >
              <Icons.settings className='mr-2 h-4 w-4 rtl:ml-2 rtl:mr-0' />
              <span>{t('nav.settings')}</span>
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleSignOut}
          className='cursor-pointer text-destructive focus:text-destructive'
        >
          <Icons.logout className='mr-2 h-4 w-4 rtl:ml-2 rtl:mr-0' />
          <span>{t('auth.signOut')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
