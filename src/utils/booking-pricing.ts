import type {
  BookingChargeId,
  BookingChargeOption,
  BookingPricingDetails,
  TaxableCharge,
} from "@/types/booking-payment";
import {
  normalizeBookingChargeAmount,
  parseBookingDate,
} from "@/utils/booking-payment";

/** Remaining days in the move-in month, including the move-in day. Same as helloworld-next `numberOfDaysForRent`. */
export function numberOfDaysForRent(moveInDate?: Date | string | null) {
  if (moveInDate == null || moveInDate === "") return null;

  const parsed = parseBookingDate(moveInDate);
  if (!parsed) return null;

  const lastDayOfMonth = new Date(
    parsed.getFullYear(),
    parsed.getMonth() + 1,
    0,
  ).getDate();
  const days = lastDayOfMonth - parsed.getDate() + 1;
  return days > 0 ? days : null;
}

function daysDescription(moveInDate?: Date | string | null) {
  const days = numberOfDaysForRent(moveInDate);
  return days != null ? ` for ${days} days` : "";
}

function toTaxableCharge(value: unknown): TaxableCharge {
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const amount = normalizeBookingChargeAmount(record.amount) ?? 0;
    const totalAmount =
      normalizeBookingChargeAmount(record.totalAmount) ?? amount;
    const cgst = typeof record.cgst === "number" ? record.cgst : 0;
    const sgst = typeof record.sgst === "number" ? record.sgst : 0;
    return { amount, totalAmount, cgst, sgst };
  }

  const amount = normalizeBookingChargeAmount(value) ?? 0;
  return { amount, totalAmount: amount, cgst: 0, sgst: 0 };
}

export function mapPaymentDetailsData(
  data: unknown,
): BookingPricingDetails | null {
  if (Array.isArray(data)) {
    const row = data[0];
    return row && typeof row === "object"
      ? mapPaymentDetailsRow(row as Record<string, unknown>)
      : null;
  }

  if (data && typeof data === "object") {
    return mapPaymentDetailsRow(data as Record<string, unknown>);
  }

  return null;
}

export function mapPaymentDetailsRow(
  row: Record<string, unknown>,
): BookingPricingDetails | null {
  const token = normalizeBookingChargeAmount(row.token);
  if (token == null) return null;

  return {
    token,
    moveInCharges: toTaxableCharge(row.moveInCharges),
    advanceRent: toTaxableCharge(row.advanceRent),
    securityDeposit: normalizeBookingChargeAmount(row.securityDeposit) ?? 0,
    rent: { amount: normalizeBookingChargeAmount(row.rent) ?? 0 },
    sdKey: typeof row.sdKey === "string" ? row.sdKey : "",
    sdMonths: typeof row.sdMonths === "number" ? row.sdMonths : 0,
    utility: toTaxableCharge(row.utility),
  };
}

export function buildChargesFromPricing(
  pricing: BookingPricingDetails,
  moveInDate?: Date | string | null,
): BookingChargeOption[] {
  const tokenLabel =
    pricing.sdMonths === 0 ? "Token Amount + Move Out Charges" : "Token Amount";
  const period = daysDescription(moveInDate);
  const advanceRentDisabled = pricing.advanceRent.amount < 5;
  const monthLabel = pricing.sdMonths === 1 ? "Month" : "Months";

  const charges: BookingChargeOption[] = [
    {
      id: "token",
      label: tokenLabel,
      amount: pricing.token,
      description:
        "The token will be adjusted with your security deposit and is non-refundable in case of cancellation.",
      required: true,
      badge: "Required",
    },
    {
      id: "moveIn",
      label: "Move in charges",
      amount: pricing.moveInCharges.amount,
      description: "Applied at move-in to cover the background check.",
    },
    {
      id: "security",
      label: "Security deposit amount",
      amount: pricing.securityDeposit,
      description: `[ ${pricing.sdMonths} ${monthLabel} Rent - Token Amount ]`,
    },
    {
      id: "advanceRent",
      label: "Advance rent amount",
      amount: pricing.advanceRent.amount,
      description: period,
      disabled: advanceRentDisabled,
    },
  ];

  if (pricing.utility.amount > 0) {
    charges.push({
      id: "utility",
      label: "Utility charges",
      amount: pricing.utility.amount,
      description: period,
    });
  }

  return charges;
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
  if (selected.utility && pricing.utility.amount > 0) {
    total += pricing.utility.totalAmount;
  }

  return total;
}

export function syncSelectedCharges(
  current: Record<BookingChargeId, boolean>,
  charges: BookingChargeOption[],
): Record<BookingChargeId, boolean> {
  const byId = new Map(charges.map((charge) => [charge.id, charge]));

  return {
    ...current,
    utility: byId.has("utility") ? current.utility : false,
    advanceRent: byId.get("advanceRent")?.disabled
      ? false
      : current.advanceRent,
  };
}

export function getSummaryLineAmount(
  pricing: BookingPricingDetails,
  chargeId: BookingChargeId,
) {
  switch (chargeId) {
    case "token":
      return pricing.token;
    case "moveIn":
      return pricing.moveInCharges.totalAmount;
    case "security":
      return pricing.securityDeposit;
    case "advanceRent":
      return pricing.advanceRent.totalAmount;
    case "utility":
      return pricing.utility.totalAmount;
    default:
      return 0;
  }
}
