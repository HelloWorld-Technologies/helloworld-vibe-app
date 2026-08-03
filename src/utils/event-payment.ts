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
