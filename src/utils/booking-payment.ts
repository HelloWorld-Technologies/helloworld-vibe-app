import type { BookingChargeId, MoveInDateOption } from '@/types/booking-payment';

export function formatBookingAmount(amount: number) {
  return `₹${amount.toLocaleString('en-IN')}`;
}

type TaxableChargeAmount = {
  amount: number;
  totalAmount?: number;
};

export function normalizeBookingChargeAmount(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (value && typeof value === 'object' && 'amount' in value) {
    const amount = (value as TaxableChargeAmount).amount;
    return typeof amount === 'number' && Number.isFinite(amount) ? amount : undefined;
  }

  return undefined;
}

export function formatBookingMoveInDate(isoDate: string) {
  const date = parseBookingDate(isoDate);
  if (!date) {
    return isoDate;
  }

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatBookingApiDate(date: Date | string) {
  const value = parseBookingDate(date);
  if (!value) return '';

  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');

  return `${year}/${month}/${day}`;
}

/** Used by `api/v2/booking/init` — Zoho expects ISO-style dates. */
export function formatBookingInitDate(date: Date | string) {
  const value = parseBookingDate(date);
  if (!value) return '';

  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function parseBookingDate(date: Date | string) {
  if (date instanceof Date) {
    return Number.isNaN(date.getTime()) ? null : date;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const [year, month, day] = date.split('-').map(Number);
    const parsed = new Date(year, month - 1, day);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  if (/^\d{4}\/\d{2}\/\d{2}$/.test(date)) {
    const [year, month, day] = date.split('/').map(Number);
    const parsed = new Date(year, month - 1, day);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function toBookingDateString(date: Date) {
  return formatBookingInitDate(date);
}

/** Matches legacy `DatePickerHorizontal` with `numberOfDays={7}`: today plus 7 following days. */
export const BOOKING_MOVE_IN_EXTRA_DAYS = 7;

export function getDefaultMoveInDate() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

export function getLatestMoveInDate(extraDays = BOOKING_MOVE_IN_EXTRA_DAYS) {
  const date = getDefaultMoveInDate();
  date.setDate(date.getDate() + extraDays);
  return date;
}

export function isMoveInDateInWindow(date: Date, extraDays = BOOKING_MOVE_IN_EXTRA_DAYS) {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  const min = getDefaultMoveInDate().getTime();
  const max = getLatestMoveInDate(extraDays).getTime();
  const value = normalized.getTime();
  return value >= min && value <= max;
}

export function buildMoveInDateOptions(extraDays = BOOKING_MOVE_IN_EXTRA_DAYS): MoveInDateOption[] {
  const start = getDefaultMoveInDate();
  const options: MoveInDateOption[] = [];

  for (let index = 0; index <= extraDays; index += 1) {
    const date = new Date(start);
    date.setDate(start.getDate() + index);

    options.push({
      id: formatBookingInitDate(date),
      date,
      dayLabel: date.toLocaleDateString('en-IN', { weekday: 'short' }),
      dateLabel: String(date.getDate()),
    });
  }

  return options;
}

export function findMoveInDateOptionId(date: Date | string, extraDays = BOOKING_MOVE_IN_EXTRA_DAYS) {
  const parsed = parseBookingDate(date);
  if (!parsed) return buildMoveInDateOptions(extraDays)[0]?.id ?? '';

  const match = buildMoveInDateOptions(extraDays).find((option) => option.id === formatBookingInitDate(parsed));
  return match?.id ?? buildMoveInDateOptions(extraDays)[0]?.id ?? '';
}

export function sumSelectedCharges(
  charges: { id: BookingChargeId; amount: number }[],
  selected: Record<BookingChargeId, boolean>,
) {
  return charges.reduce((total, charge) => {
    if (!selected[charge.id]) {
      return total;
    }

    return total + charge.amount;
  }, 0);
}

export function buildInvoiceId() {
  return `HW-${Math.floor(100000 + Math.random() * 900000)}`;
}
