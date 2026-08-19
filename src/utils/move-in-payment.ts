import type { BookingStatus } from '@/types/booking-status';
import type { TenantProfile } from '@/types/tenant';
import { isBookingCancelled } from '@/utils/booking-details-format';

export function shouldShowMoveInPendingPaymentCard(
  profile?: TenantProfile | null,
  status?: BookingStatus | null,
  remainingAmount?: number | null,
) {
  if (!profile?.bookingId || !status) return false;
  if (isBookingCancelled(profile)) return false;
  if (status.moved_in) return false;
  if (status.payment) return false;

  const payment = profile.paymentInfo;
  if (payment?.isSdCleared && payment?.isPartialRentCleared) return false;

  // Prefer move-in get_payments remaining balance when available.
  if (remainingAmount != null && remainingAmount <= 0) return false;

  return payment?.isTokenPaid === true;
}

export function getMoveInPendingAmount(
  profile?: TenantProfile | null,
  remainingFromPayments?: number | null,
) {
  if (remainingFromPayments != null) {
    return Math.max(0, remainingFromPayments);
  }

  const payment = profile?.paymentInfo;
  if (!payment) return 0;

  let amount = 0;
  if (!payment.isPartialRentCleared) {
    amount += payment.rent ?? 0;
  }
  if (!payment.isSdCleared) {
    amount += payment.sd ?? 0;
  }
  return amount;
}

export function isMoveInPaymentComplete(
  status?: BookingStatus | null,
  remainingAmount?: number | null,
  profile?: TenantProfile | null,
) {
  if (status?.payment) return true;
  if (remainingAmount != null && remainingAmount <= 0) return true;

  const payment = profile?.paymentInfo;
  return Boolean(payment?.isSdCleared && payment?.isPartialRentCleared);
}
