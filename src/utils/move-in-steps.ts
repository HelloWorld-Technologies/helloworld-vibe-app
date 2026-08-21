import type { BookingStatus, MoveInStep } from '@/types/booking-status';
import type { MoveInBackground } from '@/types/move-in-background';
import { EMPTY_MOVE_IN_BACKGROUND } from '@/types/move-in-background';
import type { TenantProfile } from '@/types/tenant';
import { isMoveInAboutYouComplete, isMoveInBackgroundComplete } from '@/utils/move-in-background';
import { isMoveInPaymentComplete } from '@/utils/move-in-payment';

export function buildMoveInSteps(
  status: BookingStatus,
  profile?: TenantProfile | null,
  moveInInterests: string[] = [],
  moveInBackground: MoveInBackground = EMPTY_MOVE_IN_BACKGROUND,
  remainingMoveInAmount?: number | null,
): MoveInStep[] {
  const tokenPaid = profile?.paymentInfo?.isTokenPaid ?? true;
  const paymentComplete = isMoveInPaymentComplete(status, remainingMoveInAmount, profile);
  const paymentLockedMessage = 'Complete move-in payment to unlock this step.';
  const vibesAlreadySaved = moveInInterests.length > 0;
  const backgroundComplete = isMoveInBackgroundComplete(moveInBackground);
  const aboutYouComplete = isMoveInAboutYouComplete(moveInBackground, moveInInterests);

  return [
    {
      id: 'booking-token',
      title: 'Booking & Token Payment',
      description: 'Your booking has been created.',
      completed: Boolean(status['booking date']) && tokenPaid,
      enabled: true,
    },
    {
      id: 'advance-charges',
      title: 'Advance Rent · Security Deposit · Move-in Charges',
      description: 'Complete payment is mandatory before move-in.',
      actionLabel: 'Complete Payment',
      route: '/move-in-payment',
      completed: paymentComplete,
      enabled: true,
    },
    {
      id: 'personal-profile',
      title: 'A Little About You',
      description: vibesAlreadySaved
        ? 'Your vibes are already saved. Add college and work details if needed.'
        : 'Your interests help us build the right community around you.',
      actionLabel: vibesAlreadySaved ? 'Update' : 'Continue',
      route:
        vibesAlreadySaved && !backgroundComplete ? '/move-in-background' : '/move-in-about-you',
      completed: aboutYouComplete,
      completedLabel: vibesAlreadySaved ? 'Updated' : 'Completed',
      enabled: true,
    },
    {
      id: 'document-verification',
      title: 'Document Verification',
      description: "You'll be redirected to our partner portal for KYC Verification",
      actionLabel: 'Verify',
      route: '/move-in-document-verification',
      completed: status.is_kyc_cleared,
      enabled: paymentComplete,
      lockedMessage: paymentLockedMessage,
    },
    {
      id: 'bank-details',
      title: 'Bank Details',
      description: 'Add an account to receive refunds',
      actionLabel: 'Add Details',
      route: '/profile/bank-details',
      completed: status.bank_details,
      enabled: true,
    },
    {
      id: 'move-in-checklist',
      title: 'Move-in Checklist',
      description: 'Review and confirm the amenities in your room.',
      actionLabel: 'Review Amenities',
      route: '/move-in-checklist',
      completed: status.checklist_status,
      enabled: paymentComplete,
      lockedMessage: paymentLockedMessage,
    },
    {
      id: 'agreement-signing',
      title: 'Agreement E-Signing',
      description:
        'Your rental agreement will be shared over your registered Email once onboarding is completed.',
      completed: status.signed_document,
      enabled: true,
    },
    {
      id: 'emergency-contact',
      title: 'Emergency Contact',
      description: 'Add a contact we can reach in an emergency.',
      actionLabel: 'Add Contact',
      route: '/profile/emergency-contact',
      completed: status['emergency details'],
      enabled: true,
    },
  ];
}

export function partitionMoveInSteps(steps: MoveInStep[]) {
  const completed = steps.filter((step) => step.completed);
  const pending = steps.filter((step) => !step.completed);
  return { completed, pending, total: steps.length, doneCount: completed.length };
}

export function formatMoveInDeadline(isoDate: string) {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return isoDate;
  }

  const day = date.getDate();
  const suffix =
    day % 10 === 1 && day !== 11
      ? 'st'
      : day % 10 === 2 && day !== 12
        ? 'nd'
        : day % 10 === 3 && day !== 13
          ? 'rd'
          : 'th';

  const monthYear = date.toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  });

  return `${day}${suffix} ${monthYear}`;
}

export function buildMoveInPendingMessage(pendingCount: number, movedIn = false) {
  const label = pendingCount === 1 ? 'step' : 'steps';
  if (movedIn) {
    return `Just ${pendingCount} quick ${label} left to finish your onboarding.`;
  }
  return `Just ${pendingCount} quick ${label} left before you can collect your keys and move in.`;
}

export function buildMoveInPendingTitle(movedIn = false) {
  return movedIn ? 'Pending tasks' : 'Move-in pending';
}

export function buildMoveInStepsHeaderTitle(movedIn = false, hasPending = true) {
  if (movedIn && hasPending) {
    return 'Complete Remaining Steps';
  }
  return 'Your Move-in Steps';
}

export function buildProgressMessage(
  doneCount: number,
  total: number,
  moveInDate: string,
  movedIn = false,
) {
  const remaining = Math.max(total - doneCount, 0);
  const deadline = formatMoveInDeadline(moveInDate);

  if (remaining === 0) {
    return movedIn
      ? `You're all set — onboarding is complete.`
      : `You're all set for your move-in on ${deadline}.`;
  }

  if (movedIn) {
    if (doneCount >= total - 2) {
      return `Almost there! Just a few more steps to finish your onboarding.`;
    }
    return `You've moved in! Complete the remaining ${remaining} steps to finish onboarding.`;
  }

  if (doneCount >= total - 2) {
    return `Almost there! Just a few more steps before your move-in on ${deadline}`;
  }

  return `Complete the remaining ${remaining} steps before your move-in on ${deadline} to avoid booking cancellation.`;
}
