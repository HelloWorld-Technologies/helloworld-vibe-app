import type {
  BookingChargeId,
  BookingChargeOption,
  BookingCheckoutInput,
  BookingCheckoutSession,
  BookingPaymentSummary,
} from '@/types/booking-payment';
import { buildInvoiceId, formatBookingApiDate, formatBookingInitDate } from '@/utils/booking-payment';
import { getSummaryLineAmount } from '@/utils/booking-pricing';

export const BOOKING_PAYMENT_INIT_API = 'api/v2/booking/init';
export const BOOKING_PAYMENT_VERIFY_API = 'api/v2/booking/verify';

export function buildBookingPaymentSummary(
  input: BookingCheckoutInput,
): BookingPaymentSummary {
  return {
    invoiceId: buildInvoiceId(),
    date: new Date().toISOString(),
    lines: input.charges
      .filter((charge) => input.selected[charge.id])
      .map((charge) => ({
        label: charge.label,
        amount: getSummaryLineAmount(input.pricing, charge.id),
      })),
    discounts: input.discounts.map((discount) => ({
      type: discount.type,
      code: discount.code,
      amount: discount.amount,
    })),
    total: input.total,
  };
}

export function buildBookingCheckoutSession(input: BookingCheckoutInput): BookingCheckoutSession {
  return {
    ...input,
    summary: buildBookingPaymentSummary(input),
  };
}

export function parseBookingPaymentSummary(
  raw?: string | string[],
): BookingPaymentSummary | null {
  if (!raw) return null;

  try {
    const value = Array.isArray(raw) ? raw[0] : raw;
    return JSON.parse(value) as BookingPaymentSummary;
  } catch {
    return null;
  }
}

export function buildBookingPaymentPayload({
  draft,
  selected,
  total,
  couponCode,
  referralCode,
  sdKey,
}: Omit<BookingCheckoutInput, 'mobile'>) {
  return {
    bookingInfo: {
      propertyId: draft.propertyId,
      moveInDate: formatBookingInitDate(draft.moveInDate),
      categoryId: draft.categoryId ?? draft.roomId,
      firstName: draft.occupant.firstName,
      lastName: draft.occupant.lastName,
      email: draft.occupant.email,
      gender: draft.occupant.gender,
      couponCode: couponCode || undefined,
      referralCode: referralCode || undefined,
      sdKey,
    },
    payments: {
      rent: draft.roomPrice,
      amountToBePaid: total,
      utilitySelected: selected.utility ?? false,
      sdSelected: selected.security,
      advanceRentSelected: selected.advanceRent,
      isMoveInChargesSelected: selected.moveIn,
      sharingType: draft.sharingType.toLowerCase(),
    },
  };
}

export function buildBookingPaymentParams(input: BookingCheckoutSession) {
  const { draft, total, mobile, summary } = input;

  return {
    type: 'booking',
    amount: String(total),
    description: 'Booking payment from tenant app',
    email: draft.occupant.email,
    mobile,
    moveInDate: draft.moveInDate,
    initApi: BOOKING_PAYMENT_INIT_API,
    verifyApi: BOOKING_PAYMENT_VERIFY_API,
  };
}

export type BookingRazorpayVerifyResult = {
  payment_gateway: 'razorpay';
  razorpayPaymentId: string;
  razorpaySignature: string;
};

export type BookingCashfreeVerifyResult = {
  payment_gateway: 'cashfree';
  orderId: string;
};

export type BookingGatewayVerifyResult =
  | BookingRazorpayVerifyResult
  | BookingCashfreeVerifyResult;

export function buildBookingVerifyPayload(
  initData: {
    paymentObj: { transactionId?: string; orderId?: string };
    id?: string | number;
  },
  gatewayResult: BookingGatewayVerifyResult,
  amount: number,
) {
  const base = {
    paymentId: initData.paymentObj.transactionId,
    bookingId: initData.id,
    amount,
    payment_gateway: gatewayResult.payment_gateway,
  };

  if (gatewayResult.payment_gateway === 'cashfree') {
    return {
      ...base,
      orderId: gatewayResult.orderId || initData.paymentObj.orderId,
    };
  }

  return {
    ...base,
    razorpayPaymentId: gatewayResult.razorpayPaymentId,
    razorpaySignature: gatewayResult.razorpaySignature,
  };
}
