'use client';

import * as React from 'react';
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
import { Spinner } from '@/components/ui/spinner';
import { Icons } from '@/components/icons';
import { InstallPrompt } from '@/components/pwa/install-prompt';
import { clearPwaCaches } from '@/lib/pwa';
import { Link } from '@/i18n/navigation';
import type { SessionUserShape } from '@/types/auth';

export function UserNav() {
  const { data: session } = useSession();
  const t = useTranslations();
  const [signingOut, setSigningOut] = React.useState(false);
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
    if (signingOut) return;
    setSigningOut(true);
    void (async () => {
      try {
        await clearPwaCaches();
        await signOut({ callbackUrl: isPlatformAdmin ? '/platform-admin/login' : '/login' });
      } catch {
        setSigningOut(false);
      }
    })();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type='button'
            variant='ghost'
            aria-label={t('nav.accountMenu')}
            className='ring-offset-background hover:ring-ring relative h-9 w-9 rounded-full hover:ring-2'
          />
        }
      >
        <Avatar className='h-9 w-9'>
          <AvatarFallback className='bg-primary/10 text-primary text-xs font-semibold'>
            {initials}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-56' align='end' sideOffset={8}>
        <DropdownMenuGroup>
          <DropdownMenuLabel className='font-normal'>
            <div className='flex flex-col space-y-1'>
              <p className='text-foreground text-sm leading-none font-semibold'>{user.name}</p>
              <p className='text-muted-foreground text-xs leading-none'>
                {user.phoneNumber || user.email}
              </p>
              <p className='text-primary pt-0.5 text-[11px] font-medium'>{roleLabel}</p>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
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
            <Icons.dashboard className='me-2 size-4' />
            <span>{t('nav.dashboard')}</span>
          </DropdownMenuItem>
          {!isPlatformAdmin ? (
            <DropdownMenuItem
              render={
                <Link href='/dashboard/settings' className='flex cursor-pointer items-center' />
              }
            >
              <Icons.settings className='me-2 size-4' />
              <span>{t('nav.settings')}</span>
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuItem
            render={
              <Link
                href='/dashboard/settings/appearance'
                className='flex cursor-pointer items-center'
              />
            }
          >
            <Icons.palette className='me-2 size-4' />
            <span>{t('nav.appearance')}</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <div className='px-1 py-0.5'>
          <InstallPrompt variant='menu' />
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            variant='destructive'
            disabled={signingOut}
            onClick={handleSignOut}
            className='cursor-pointer'
          >
            {signingOut ? (
              <Spinner className='me-2 size-4' aria-hidden />
            ) : (
              <Icons.logout className='me-2 size-4' />
            )}
            <span>{signingOut ? t('nav.signingOut') : t('auth.signOut')}</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
