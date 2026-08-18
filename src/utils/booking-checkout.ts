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
      message: discount.message,
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

function toBookingSharingType(value: string): 'private' | 'sharing' {
  return value.trim().toLowerCase() === 'private' ? 'private' : 'sharing';
}

function toNumericId(value: string | number | undefined) {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : value;
}

export function buildBookingPaymentPayload({
  draft,
  selected,
  total,
  couponCode,
  referralCode,
  sdKey,
  pricing,
}: Omit<BookingCheckoutInput, 'mobile'>) {
  return {
    bookingInfo: {
      propertyId: toNumericId(draft.propertyId),
      moveInDate: formatBookingInitDate(draft.moveInDate),
      categoryId: toNumericId(draft.categoryId ?? draft.roomId),
      firstName: draft.occupant.firstName || '',
      lastName: draft.occupant.lastName || '',
      email: draft.occupant.email || '',
      gender: draft.occupant.gender,
      couponCode: couponCode || '',
      referralCode: referralCode || '',
      sdKey: sdKey || pricing.sdKey || '',
    },
    payments: {
      rent: pricing.rent.amount || draft.roomPrice,
      amountToBePaid: total,
      utilitySelected: Boolean(selected.utility),
      sdSelected: Boolean(selected.security),
      advanceRentSelected: Boolean(selected.advanceRent),
      isMoveInChargesSelected: Boolean(selected.moveIn),
      sharingType: toBookingSharingType(draft.sharingType),
      sdMonths: pricing.sdMonths || draft.securityDepositMonths || 0,
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

export function buildBookingVerifyPayload(
  initData: {
    paymentObj: {
      transactionId?: string;
      orderId?: string;
      paymentSessionId?: string;
    };
    id?: string | number;
  },
  razorpayData: { razorpay_payment_id: string; razorpay_signature: string },
  amount: number,
  context?: {
    customerId?: string;
    propertyName?: string;
  },
) {
  const transactionId = initData.paymentObj.transactionId;
  const bookingId = initData.id;
  const isCashfree = Boolean(initData.paymentObj.paymentSessionId);

  if (isCashfree) {
    return {
      transactionId,
      customerId: context?.customerId,
      amount,
      paymentForIds: bookingId != null ? [bookingId] : [],
      paymentMode: 'cashfree',
      paymentMethod: 'upi',
      propertyName: context?.propertyName,
      type: 'booking',
      orderId: initData.paymentObj.orderId ?? razorpayData.razorpay_payment_id,
      paymentId: transactionId,
      bookingId,
      payment_gateway: 'cashfree',
    };
  }

  return {
    paymentId: transactionId,
    bookingId,
    amount,
    paymentMethod: 'UPI',
    payment_gateway: 'razorpay',
    razorpayPaymentId: razorpayData.razorpay_payment_id,
    razorpaySignature: razorpayData.razorpay_signature,
  };
}
