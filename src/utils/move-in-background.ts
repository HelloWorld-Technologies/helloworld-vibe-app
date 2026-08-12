import {
  MOVE_IN_COLLEGE_OPTIONS,
  MOVE_IN_COMPANY_OPTIONS,
  MOVE_IN_COMPANY_EMAIL_DOMAINS,
  MOVE_IN_OTHER_COLLEGE_LABEL,
  MOVE_IN_OTHER_COMPANY_LABEL,
  MOVE_IN_SELF_EMPLOYED_LABEL,
} from '@/constants/move-in-background';
import { MOVE_IN_INTERESTS_MIN } from '@/constants/vibes';
import type { MoveInBackground } from '@/types/move-in-background';
import type { TenantProfile } from '@/types/tenant';

export function getTenantCollege(profile?: TenantProfile | null) {
  const value = profile?.userInfo?.college ?? profile?.college;
  return typeof value === 'string' ? value.trim() : '';
}

export function getTenantCompany(profile?: TenantProfile | null) {
  const value = profile?.userInfo?.company ?? profile?.company;
  return typeof value === 'string' ? value.trim() : '';
}

/** Prefill move-in background from `hello/tenant/details` when local draft is empty. */
export function mergeBackgroundWithTenantProfile(
  background: MoveInBackground,
  profile?: TenantProfile | null,
): MoveInBackground {
  const college = background.college.trim() || getTenantCollege(profile);
  const workplace = background.workplace.trim() || getTenantCompany(profile);

  return {
    ...background,
    college,
    workplace,
    isSelfEmployed:
      background.isSelfEmployed || workplace === MOVE_IN_SELF_EMPLOYED_LABEL,
  };
}

export function restoreCollegeSelection(savedCollege: string) {
  if (!savedCollege) {
    return { college: '', customCollege: '' };
  }

  if ((MOVE_IN_COLLEGE_OPTIONS as readonly string[]).includes(savedCollege)) {
    return { college: savedCollege, customCollege: '' };
  }

  return { college: MOVE_IN_OTHER_COLLEGE_LABEL, customCollege: savedCollege };
}

export function restoreWorkplaceSelection(saved: MoveInBackground) {
  if (!saved.workplace) {
    return { workplace: '', customCompany: '', isSelfEmployed: false };
  }

  if (saved.isSelfEmployed || saved.workplace === MOVE_IN_SELF_EMPLOYED_LABEL) {
    return {
      workplace: MOVE_IN_SELF_EMPLOYED_LABEL,
      customCompany: '',
      isSelfEmployed: true,
    };
  }

  if ((MOVE_IN_COMPANY_OPTIONS as readonly string[]).includes(saved.workplace)) {
    return { workplace: saved.workplace, customCompany: '', isSelfEmployed: false };
  }

  return {
    workplace: MOVE_IN_OTHER_COMPANY_LABEL,
    customCompany: saved.workplace,
    isSelfEmployed: false,
  };
}

export function isMoveInBackgroundComplete(background: MoveInBackground) {
  return Boolean(background.college.trim() && background.workplace.trim());
}

export function isMoveInAboutYouComplete(
  background: MoveInBackground,
  interestIds: string[],
) {
  return isMoveInBackgroundComplete(background) && interestIds.length >= MOVE_IN_INTERESTS_MIN;
}

export function getCompanyEmailDomain(company: string) {
  if (!company || company === MOVE_IN_SELF_EMPLOYED_LABEL) {
    return '';
  }

  return MOVE_IN_COMPANY_EMAIL_DOMAINS[company] ?? `${company.toLowerCase().replace(/\s+/g, '')}.com`;
}

export function isWorkEmailValidForCompany(email: string, company: string) {
  const domain = getCompanyEmailDomain(company);
  if (!domain) return email.includes('@');

  return email.trim().toLowerCase().endsWith(`@${domain}`);
}

export function shouldShowWorkEmailVerification(background: MoveInBackground) {
  return (
    Boolean(background.workplace.trim()) &&
    !background.isSelfEmployed &&
    background.workplace !== MOVE_IN_SELF_EMPLOYED_LABEL
  );
}
