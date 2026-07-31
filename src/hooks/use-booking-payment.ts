import { useRouter } from 'expo-router';

import { useBookingDraftStore } from '@/stores/booking-draft-store';
import type { BookingCheckoutInput } from '@/types/booking-payment';
import {
  buildBookingCheckoutSession,
  buildBookingPaymentParams,
} from '@/utils/booking-checkout';

export function useBookingPayment() {
  const router = useRouter();
  const setPendingCheckout = useBookingDraftStore((state) => state.setPendingCheckout);

  function startBookingPayment(input: BookingCheckoutInput) {
    const session = buildBookingCheckoutSession(input);
    setPendingCheckout(session);
    router.push({
      pathname: '/complete-payment',
      params: buildBookingPaymentParams(session),
    });
  }

  return { startBookingPayment };
}
