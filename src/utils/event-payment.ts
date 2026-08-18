export const EVENT_PAYMENT_INIT_API = 'hello/event/assign';
export const EVENT_PAYMENT_VERIFY_API = 'hello/event/verify-payments';

export type EventBookingPayload = {
  id: number;
  email: string;
  name: string;
  mobile: string;
  seatsBooked: number;
};

export function getEventPayableAmount(paymentTotal?: number, detailAmount?: number) {
  return paymentTotal ?? detailAmount ?? 0;
}

export function buildEventPaymentParams(args: {
  eventId: number;
  eventName: string;
  amount: number;
  email: string;
  mobile: string;
  name: string;
  payload: EventBookingPayload;
}) {
  return {
    type: 'events',
    paymentFor: String(args.eventId),
    amount: String(args.amount),
    description: 'Book event from app',
    email: args.email,
    mobile: args.mobile,
    name: args.name,
    eventName: args.eventName,
    initApi: EVENT_PAYMENT_INIT_API,
    verifyApi: EVENT_PAYMENT_VERIFY_API,
    payload: JSON.stringify(args.payload),
  };
}

export function buildEventVerifyPayload(
  initData: {
    paymentObj: {
      transactionId?: string;
      orderId?: string;
      paymentSessionId?: string;
    };
    id?: string | number;
    data?: Record<string, unknown>;
  },
  razorpayData: { razorpay_payment_id: string; razorpay_signature: string },
  amount: number,
) {
  const transactionId = initData.paymentObj.transactionId;
  const paymentForId = String(initData.data?.id ?? initData.id ?? '');
  const isCashfree = Boolean(initData.paymentObj.paymentSessionId);

  if (isCashfree) {
    return {
      transactionId,
      amount,
      paymentForId,
      paymentGateway: 'cashfree',
      razorpayPaymentId: razorpayData.razorpay_payment_id,
      orderId: initData.paymentObj.orderId ?? razorpayData.razorpay_payment_id,
    };
  }

  return {
    transactionId,
    amount,
    paymentForId,
    paymentGateway: 'razorpay',
    razorpayPaymentId: razorpayData.razorpay_payment_id,
    razorpaySignature: razorpayData.razorpay_signature,
  };
}
