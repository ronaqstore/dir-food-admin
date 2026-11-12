export function normalizePhone(phone: string): string {
  if (phone.includes('@')) {
    return phone.trim().toLowerCase();
  }

  let digits = phone.replace(/\D/g, '');

  if (digits.startsWith('0092')) {
    digits = `0${digits.slice(4)}`;
  } else if (digits.startsWith('92') && digits.length >= 12) {
    digits = `0${digits.slice(2)}`;
  }

  return digits;
}

export function isValidPkMobile(phone: string): boolean {
  const trimmed = phone.trim().toLowerCase();
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return true;
  }
  return /^03\d{9}$/.test(normalizePhone(phone));
}

/**
 * Reserved platform / system numbers:
 * - 03115514151 -> Super Admin / Platform Admin Login 1
 * - 03059596704 -> Super Admin / Platform Admin Login 2
 * - 03029825213 -> Super Admin Public Support Contact 1
 * - 03484894115 -> Super Admin Public Support Contact 2
 */
export const RESERVED_PHONE_NUMBERS = [
  '03115514151',
  '03059596704',
  '03029825213',
  '03484894115'
] as const;

export function isReservedPhoneNumber(phone: string): boolean {
  if (!phone) {
    return false;
  }
  const normalized = normalizePhone(phone);
  return (RESERVED_PHONE_NUMBERS as readonly string[]).includes(normalized);
}
