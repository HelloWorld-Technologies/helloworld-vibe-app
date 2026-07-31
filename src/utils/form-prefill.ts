import type { VisitContactDetails } from '@/types/visit';
import type { OccupantDetails } from '@/types/booking';
import type { TenantProfile } from '@/types/tenant';
import { getDefaultMoveInDate } from '@/utils/booking-payment';

export function normalizeMobile(mobile?: string | null) {
  return mobile?.replace(/\D/g, '').slice(-10) ?? '';
}

export function splitFullName(name?: string | null): { firstName: string; lastName: string } {
  const trimmed = name?.trim() ?? '';
  if (!trimmed) {
    return { firstName: '', lastName: '' };
  }

  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: '' };
  }

  return { firstName: parts[0], lastName: parts.slice(1).join(' ') };
}

export function normalizeGender(gender?: string | null): string {
  if (!gender) {
    return 'Male';
  }

  const lower = gender.trim().toLowerCase();
  if (lower.startsWith('f')) {
    return 'Female';
  }
  if (lower.startsWith('o') || lower === 'other' || lower === 'others') {
    return 'Others';
  }

  return 'Male';
}

type FormPrefillSource = {
  profile?: TenantProfile | null;
  mobile?: string | null;
};

export function buildVisitContactPrefill(source: FormPrefillSource): VisitContactDetails {
  const user = source.profile?.userInfo;

  return {
    name: user?.name?.trim() ?? '',
    email: user?.email?.trim() ?? '',
  };
}

export function buildOccupantPrefill(source: FormPrefillSource): OccupantDetails {
  const user = source.profile?.userInfo;
  const { firstName, lastName } = splitFullName(user?.name);

  return {
    firstName,
    lastName,
    email: user?.email?.trim() ?? '',
    phone: normalizeMobile(user?.mobile ?? source.mobile),
    gender: normalizeGender(user?.gender),
    moveInDate: getDefaultMoveInDate(),
  };
}
