'use client';

import { getNavGroupsForRole } from '@/config/nav-config';
import type { SessionRole } from '@/types/auth';
import type { NavGroup } from '@/types';

export function useFilteredNavGroups(groups: NavGroup[], role?: SessionRole) {
  if (role) return getNavGroupsForRole(role);
  return groups;
}
