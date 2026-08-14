import type { BookingChargeId, BookingChargeOption, BookingPricingDetails, TaxableCharge } from '@/types/booking-payment';
import { normalizeBookingChargeAmount } from '@/utils/booking-payment';

function toTaxableCharge(value: unknown): TaxableCharge {
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const amount = normalizeBookingChargeAmount(record.amount) ?? 0;
    const totalAmount = normalizeBookingChargeAmount(record.totalAmount) ?? amount;
    const cgst = typeof record.cgst === 'number' ? record.cgst : 0;
    const sgst = typeof record.sgst === 'number' ? record.sgst : 0;
    return { amount, totalAmount, cgst, sgst };
  }

  const amount = normalizeBookingChargeAmount(value) ?? 0;
  return { amount, totalAmount: amount, cgst: 0, sgst: 0 };
}

export function mapPaymentDetailsData(data: unknown): BookingPricingDetails | null {
  if (Array.isArray(data)) {
    const row = data[0];
    return row && typeof row === 'object'
      ? mapPaymentDetailsRow(row as Record<string, unknown>)
      : null;
  }

  if (data && typeof data === 'object') {
    return mapPaymentDetailsRow(data as Record<string, unknown>);
  }

  return null;
}

export function mapPaymentDetailsRow(row: Record<string, unknown>): BookingPricingDetails | null {
  const token = normalizeBookingChargeAmount(row.token);
  if (token == null) return null;

  return {
    token,
    moveInCharges: toTaxableCharge(row.moveInCharges),
    advanceRent: toTaxableCharge(row.advanceRent),
    securityDeposit: normalizeBookingChargeAmount(row.securityDeposit) ?? 0,
    rent: { amount: normalizeBookingChargeAmount(row.rent) ?? 0 },
    sdKey: typeof row.sdKey === 'string' ? row.sdKey : '',
    sdMonths: typeof row.sdMonths === 'number' ? row.sdMonths : 0,
    utility: toTaxableCharge(row.utility),
  };
}

export function buildChargesFromPricing(
  pricing: BookingPricingDetails,
): BookingChargeOption[] {
  const tokenLabel =
    pricing.sdMonths === 0 ? 'Token Amount + Move Out Charges' : 'Token Amount';

  return [
    {
      id: 'token',
      label: tokenLabel,
      amount: pricing.token,
      description: 'Required to confirm booking',
      required: true,
      badge: 'Required',
    },
    {
      id: 'moveIn',
      label: 'Move-in Charges',
      amount: pricing.moveInCharges.amount,
      description: 'One-time setup fee',
    },
    {
      id: 'security',
      label: `Security Deposit (${pricing.sdMonths} Month Rent - Token Amount)`,
      amount: pricing.securityDeposit,
      description: 'Refundable at checkout',
    },
    {
      id: 'advanceRent',
      label: 'Advance Rent',
      amount: pricing.advanceRent.amount,
      description: 'Pro-rated first month',
    },
    {
      id: 'utility',
      label: 'Utility Charges',
      amount: pricing.utility.amount,
      description: 'Monthly utility deposit',
    },
  ];
}

export function computePayableSubtotal(
  pricing: BookingPricingDetails,
  selected: Record<BookingChargeId, boolean>,
) {
  let total = pricing.token;

  if (selected.advanceRent) {
    total += pricing.advanceRent.totalAmount;
  }
  if (selected.security) {
    total += pricing.securityDeposit;
  }
  if (selected.moveIn) {
    total += pricing.moveInCharges.totalAmount;
  }
  if (selected.utility) {
    total += pricing.utility.totalAmount;
  }

  return total;
}

export function getSummaryLineAmount(
  pricing: BookingPricingDetails,
  chargeId: BookingChargeId,
) {
  switch (chargeId) {
    case 'token':
      return pricing.token;
    case 'moveIn':
      return pricing.moveInCharges.totalAmount;
    case 'security':
      return pricing.securityDeposit;
    case 'advanceRent':
      return pricing.advanceRent.totalAmount;
    case 'utility':
      return pricing.utility.totalAmount;
    default:
      return 0;
  }
}
