'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Icons } from '@/components/icons';

const LOCALES: { code: 'en' | 'ur' | 'ps'; label: string; nativeName: string }[] = [
  { code: 'en', label: 'English', nativeName: 'English' },
  { code: 'ur', label: 'Urdu', nativeName: 'اردو' },
  { code: 'ps', label: 'Pashto', nativeName: 'پښتو' }
];

export function LocaleSwitcher() {
  const currentLocale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const handleLocaleChange = (locale: 'en' | 'ur' | 'ps') => {
    if (locale === currentLocale) return;
    router.replace(pathname, { locale });
  };

  const current = LOCALES.find((l) => l.code === currentLocale) ?? LOCALES[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant='ghost'
            size='sm'
            className='flex h-9 items-center gap-1.5 px-2 text-xs font-medium sm:px-2.5'
            aria-label='Switch language'
          />
        }
      >
        <span className='text-sm'>🌐</span>
        <span className='hidden sm:inline'>{current?.nativeName}</span>
        <Icons.chevronDown className='hidden h-3.5 w-3.5 opacity-60 sm:inline' />
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='min-w-[120px]'>
        {LOCALES.map((locale) => (
          <DropdownMenuItem
            key={locale.code}
            onClick={() => handleLocaleChange(locale.code)}
            className={`flex cursor-pointer items-center justify-between text-xs ${
              currentLocale === locale.code ? 'font-semibold text-primary' : ''
            }`}
          >
            <span>{locale.nativeName}</span>
            {currentLocale === locale.code ? (
              <Icons.check className='h-3.5 w-3.5 text-primary' />
            ) : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
