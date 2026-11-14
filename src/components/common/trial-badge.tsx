'use client';

import * as React from 'react';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { useRestaurantProfile } from '@/features/settings/api/restaurant-query';
import type { SessionUserShape } from '@/types/auth';
import type { TrialBadgeProps } from '@/types/common';

export function TrialBadge({ subscriptionEndsAt, className }: TrialBadgeProps) {
  const { data: session } = useSession();
  const user = session?.user as SessionUserShape | undefined;
  const isRestaurantOwner = user?.role === 'RESTAURANT_OWNER';

  const { data: profile } = useRestaurantProfile({ enabled: isRestaurantOwner });

  const rawDate =
    subscriptionEndsAt ??
    (isRestaurantOwner ? (profile?.subscriptionEndsAt ?? user?.subscriptionEndsAt) : null);

  const [daysLeft, setDaysLeft] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (!rawDate) {
      setDaysLeft(null);
      return;
    }
    const endsAt = new Date(rawDate);
    const now = new Date();
    const diffMs = endsAt.getTime() - now.getTime();
    setDaysLeft(Math.ceil(diffMs / (24 * 60 * 60 * 1000)));
  }, [rawDate]);

  if (!rawDate || daysLeft === null) {
    return null;
  }

  const label =
    daysLeft <= 0
      ? 'Trial expired'
      : daysLeft === 1
        ? 'Trial: 1 day left'
        : `Trial: ${daysLeft} days left`;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-purple-200 bg-purple-50/80 px-3 py-1 text-xs font-medium text-purple-700 select-none shadow-2xs transition-colors',
        'dark:border-purple-800/70 dark:bg-purple-950/40 dark:text-purple-300',
        className
      )}
    >
      <span
        aria-hidden='true'
        className={cn(
          'size-2 shrink-0 rounded-full',
          daysLeft > 3 ? 'bg-purple-600 dark:bg-purple-400' : 'bg-amber-500 animate-pulse'
        )}
      />
      <span className='font-medium'>{label}</span>
    </div>
  );
}
