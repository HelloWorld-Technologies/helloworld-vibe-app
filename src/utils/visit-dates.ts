import type { VisitDateOption, VisitTimeSlot } from '@/types/visit';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

export const DEFAULT_VISIT_TIME_SLOTS: VisitTimeSlot[] = [
  { id: 'morning', label: '10:00 am - 01:00 pm', value: '10:00', isAvailable: true },
  { id: 'afternoon', label: '01:00 pm - 04:00 pm', value: '13:00', isAvailable: true },
  { id: 'evening', label: '04:00 pm - 07:00 pm', value: '16:00', isAvailable: true },
];

export function buildVisitDateOptions(count = 7, startDate = new Date()): VisitDateOption[] {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Array.from({ length: count }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);

    const isToday = date.getTime() === today.getTime();
    const dayLabel = isToday ? 'Today' : DAY_NAMES[date.getDay()];

    return {
      id: date.toISOString(),
      dayLabel,
      dateLabel: String(date.getDate()),
      date,
    };
  });
}

export function formatVisitConfirmation(date: Date, timeLabel: string) {
  const weekday = date.toLocaleDateString('en-IN', { weekday: 'long' });
  const dayMonth = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long' });

  return `${weekday}, ${dayMonth} at ${timeLabel}`;
}
