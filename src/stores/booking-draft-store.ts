import { create } from 'zustand';

import type { BookingCheckoutSession } from '@/types/booking-payment';
import type { BookingDraft, BookingPaymentResult } from '@/types/booking-payment';

type BookingDraftState = {
  draft: BookingDraft | null;
  paymentResult: BookingPaymentResult | null;
  pendingCheckout: BookingCheckoutSession | null;
  setDraft: (draft: BookingDraft) => void;
  clearDraft: () => void;
  setPaymentResult: (result: BookingPaymentResult) => void;
  clearPaymentResult: () => void;
  setPendingCheckout: (checkout: BookingCheckoutSession | null) => void;
};

export const useBookingDraftStore = create<BookingDraftState>((set) => ({
  draft: null,
  paymentResult: null,
  pendingCheckout: null,
  setDraft: (draft) => set({ draft }),
  clearDraft: () => set({ draft: null, pendingCheckout: null }),
  setPaymentResult: (paymentResult) => set({ paymentResult }),
  clearPaymentResult: () => set({ paymentResult: null }),
  setPendingCheckout: (pendingCheckout) => set({ pendingCheckout }),
}));
