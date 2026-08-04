import type { BookingChargeId, BookingChargeOption, BookingPricingDetails, TaxableCharge } from '@/types/booking-payment';
import { normalizeBookingChargeAmount, parseBookingDate } from '@/utils/booking-payment';

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

/** Remaining days in the move-in month (inclusive), matching legacy `numberOfDaysForRent`. */
export function numberOfDaysForRent(moveInDate: string | Date) {
  const date = parseBookingDate(moveInDate);
  if (!date) return 0;

  return (
    new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate() - date.getDate() + 1
  );
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
  moveInDate?: string | Date,
): BookingChargeOption[] {
  const days = moveInDate ? numberOfDaysForRent(moveInDate) : 0;
  const tokenLabel =
    pricing.sdMonths === 0 ? 'Token Amount + Move Out Charges' : 'Token Amount';

  const charges: BookingChargeOption[] = [
    {
      id: 'token',
      label: tokenLabel,
      amount: pricing.token,
      // Match legacy PaymentInformation — no marketing subtitle.
      description: '',
      required: true,
      badge: 'Required',
    },
    {
      id: 'moveIn',
      label: 'Move in charges',
      amount: pricing.moveInCharges.amount,
      description: '',
    },
    {
      id: 'security',
      label: `Security Deposit (${pricing.sdMonths} Month Rent - Token Amount)`,
      amount: pricing.securityDeposit,
      description: '',
    },
    {
      id: 'advanceRent',
      label:
        days > 0
          ? `Advance Rent Amount ( for ${days} day(s) )`
          : 'Advance Rent Amount',
      amount: pricing.advanceRent.amount,
      description: '',
    },
    {
      id: 'utility',
      label: days > 0 ? `Utility charges [ for ${days} days ]` : 'Utility charges',
      amount: pricing.utility.amount,
      description: '',
    },
  ];

  // Match legacy PaymentInformation: only show charges with an amount.
  return charges.filter((charge) => charge.id === 'token' || charge.amount > 0);
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
