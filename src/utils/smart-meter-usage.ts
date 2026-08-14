import type { SmartMeterConsumptionDeduction } from '@/types/smart-meter';

export type UsageBucket = {
  key: string;
  label: string;
  units: number;
  amount: number;
  count: number;
};

function startOfLocalDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

export function toApiDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseApiDate(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return null;
  return startOfLocalDay(new Date(year, month - 1, day));
}

/** Usage day from startTime (Aliste days start at 18:30 UTC = midnight IST). */
export function getUsageDayKey(item: SmartMeterConsumptionDeduction) {
  const source = item.startTime || item.deductionTime;
  const date = new Date(source);
  if (Number.isNaN(date.getTime())) return 'unknown';
  return toApiDate(startOfLocalDay(date));
}

export function formatUsageDayLabel(dayKey: string) {
  const date = parseApiDate(dayKey);
  if (!date) return dayKey;
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

export function formatUsageDayTitle(dayKey: string) {
  const date = parseApiDate(dayKey);
  if (!date) return dayKey;
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function aggregateUsageByDay(
  deductions: SmartMeterConsumptionDeduction[],
): UsageBucket[] {
  const map = new Map<string, UsageBucket>();

  for (const item of deductions) {
    const key = getUsageDayKey(item);
    if (key === 'unknown') continue;
    const current = map.get(key) ?? {
      key,
      label: formatUsageDayLabel(key),
      units: 0,
      amount: 0,
      count: 0,
    };
    current.units += item.units ?? 0;
    current.amount += item.amount ?? 0;
    current.count += 1;
    map.set(key, current);
  }

  return [...map.values()].sort((a, b) => a.key.localeCompare(b.key));
}

function hourLabel(hour: number) {
  if (hour === 0) return '12 AM';
  if (hour === 12) return '12 PM';
  if (hour < 12) return `${hour} AM`;
  return `${hour - 12} PM`;
}

/**
 * Spread each deduction's units/amount across hours covered by start→end.
 * Falls back to deductionTime hour when the window is missing/invalid.
 */
export function aggregateUsageByHour(
  deductions: SmartMeterConsumptionDeduction[],
): UsageBucket[] {
  const hours = Array.from({ length: 24 }, (_, hour) => ({
    key: String(hour),
    label: hourLabel(hour),
    units: 0,
    amount: 0,
    count: 0,
  }));

  for (const item of deductions) {
    const units = item.units ?? 0;
    const amount = item.amount ?? 0;
    const start = new Date(item.startTime || item.deductionTime);
    const end = new Date(item.endTime || item.deductionTime);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
      const fallback = new Date(item.deductionTime);
      if (Number.isNaN(fallback.getTime())) continue;
      const hour = fallback.getHours();
      hours[hour].units += units;
      hours[hour].amount += amount;
      hours[hour].count += 1;
      continue;
    }

    const hourMs = 60 * 60 * 1000;
    const covered: number[] = [];
    let cursor = new Date(start);
    cursor.setMinutes(0, 0, 0);

    while (cursor < end) {
      covered.push(cursor.getHours());
      cursor = new Date(cursor.getTime() + hourMs);
      if (covered.length > 48) break;
    }

    const uniqueHours = [...new Set(covered)];
    const divisor = Math.max(uniqueHours.length, 1);
    for (const hour of uniqueHours) {
      hours[hour].units += units / divisor;
      hours[hour].amount += amount / divisor;
      hours[hour].count += 1;
    }
  }

  return hours;
}

export function sumUsage(deductions: SmartMeterConsumptionDeduction[]) {
  return deductions.reduce(
    (acc, item) => ({
      units: acc.units + (item.units ?? 0),
      amount: acc.amount + (item.amount ?? 0),
    }),
    { units: 0, amount: 0 },
  );
}

export function filterDeductionsForDay(
  deductions: SmartMeterConsumptionDeduction[],
  dayKey: string,
) {
  return deductions.filter((item) => getUsageDayKey(item) === dayKey);
}

export function isEmptyNote(value?: string) {
  const trimmed = value?.trim().toLowerCase();
  return !trimmed || trimmed === 'empty';
}
