import type { OccupantDetails } from '@/types/booking';

export type BookingDraft = {
  propertyId: string;
  propertyName: string;
  location: string;
  imageUri?: string;
  roomId: string;
  roomName: string;
  roomPrice: number;
  occupancyLabel: string;
  categoryId?: string | number;
  sharingType: string;
  moveInDate: string;
  occupant: OccupantDetails;
  securityDepositMonths?: number;
};

export type BookingChargeId =
  | 'token'
  | 'moveIn'
  | 'security'
  | 'advanceRent'
  | 'utility';

export type BookingChargeOption = {
  id: BookingChargeId;
  label: string;
  amount: number;
  description: string;
  required?: boolean;
  badge?: string;
};

export type AppliedDiscount = {
  type: 'coupon' | 'referral';
  code: string;
  amount: number;
  message?: string;
};

export type BookingPaymentResult = {
  invoiceId: string;
  paidAmount: number;
  moveInDate: string;
  paymentDate: string;
};

export type PaymentDetailsPayload = {
  categoryId: string | number;
  sharingType: string;
  moveInDate: string;
  sdMonths?: number;
  propertyId: string | number;
  couponCode?: string;
  propertyName?: string;
  sdKey?: string;
};

export type PaymentDetailsResponse = {
  success: boolean;
  data?: Record<string, unknown>[] | Record<string, unknown>;
  discountMessage?: string;
  message?: string;
};

export type ReferralValidatePayload = {
  referralCode: string;
  propertyName?: string;
};

export type ReferralValidateResponse = {
  success?: boolean;
  isValid?: boolean;
  message?: string;
};

export type TaxableCharge = {
  amount: number;
  totalAmount: number;
  cgst: number;
  sgst: number;
};

export type BookingPricingDetails = {
  token: number;
  moveInCharges: TaxableCharge;
  advanceRent: TaxableCharge;
  securityDeposit: number;
  rent: { amount: number };
  sdKey: string;
  sdMonths: number;
  utility: TaxableCharge;
};

export type BookingPaymentSummary = {
  invoiceId: string;
  date: string;
  lines: { label: string; amount: number }[];
  discounts: { type: AppliedDiscount['type']; code: string; amount: number; message?: string }[];
  total: number;
};

export type BookingCheckoutInput = {
  draft: BookingDraft;
  selected: Record<BookingChargeId, boolean>;
  total: number;
  couponCode?: string;
  referralCode?: string;
  sdKey?: string;
  mobile: string;
  charges: BookingChargeOption[];
  discounts: AppliedDiscount[];
  pricing: BookingPricingDetails;
};

export type BookingCheckoutSession = BookingCheckoutInput & {
  summary: BookingPaymentSummary;
};

export type MoveInDateOption = {
  id: string;
  date: Date;
  dayLabel: string;
  dateLabel: string;
};
