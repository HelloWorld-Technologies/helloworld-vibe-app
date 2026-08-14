import type { VisitDateOption, VisitSlotDay, VisitTimeSlot } from '@/types/visit';
import { googleMapsPlaceUrl, googleMapsSearchUrl, toNumberCoord } from '@/utils/maps';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function formatTimeLabel(rawLabel: string) {
  const [hoursPart, minutesPart = '00'] = rawLabel.split(':');
  const hours = Number.parseInt(hoursPart, 10);

  if (Number.isNaN(hours)) {
    return rawLabel;
  }

  if (hours > 12) {
    return `${String(hours % 12).padStart(2, '0')}:${minutesPart} PM`;
  }

  if (hours === 12) {
    return `${rawLabel} PM`;
  }

  return `${rawLabel} AM`;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function mapSlotDaysToDateOptions(days: VisitSlotDay[]): VisitDateOption[] {
  const today = startOfDay(new Date());

  return days.map((day) => {
    const date = new Date(day.date);
    const normalized = startOfDay(date);
    const isToday = isSameDay(normalized, today);

    return {
      id: String(day.slotId),
      slotId: day.slotId,
      dayLabel: isToday ? 'Today' : DAY_NAMES[normalized.getDay()],
      dateLabel: String(normalized.getDate()),
      date: normalized,
    };
  });
}

export function mapTimeSlotsForDay(day: VisitSlotDay | undefined, selectedDate: Date): VisitTimeSlot[] {
  if (!day?.slots?.length) {
    return [];
  }

  const now = new Date();
  const selectedToday = isSameDay(selectedDate, now);

  return day.slots
    .map((slot, index) => {
      const isAvailable = Boolean(slot.value);
      const label = formatTimeLabel(slot.label);
      const slotHour = Number.parseInt(slot.label.split(':')[0] ?? '', 10);
      const isPast =
        selectedToday && !Number.isNaN(slotHour) && slotHour <= now.getHours();

      return {
        id: `${day.slotId}-${index}`,
        label,
        value: slot.label,
        isAvailable: isAvailable && !isPast,
      };
    })
    .filter((slot) => slot.isAvailable);
}

export function findSlotDay(days: VisitSlotDay[], dateOption: VisitDateOption) {
  return days.find((day) => String(day.slotId) === String(dateOption.slotId));
}

export function formatVisitApiDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function buildPropertyMapUrl(property?: Record<string, unknown> | null) {
  const address = property?.address as Record<string, unknown> | undefined;
  const latitude = toNumberCoord(address?.latitude ?? property?.latitude ?? property?.lat);
  const longitude = toNumberCoord(address?.longitude ?? property?.longitude ?? property?.lng ?? property?.long);
  const placeUrl = latitude != null && longitude != null
    ? googleMapsPlaceUrl(latitude, longitude)
    : undefined;
  if (placeUrl) return placeUrl;

  const query = [
    typeof property?.display_name === 'string' ? property.display_name : null,
    typeof property?.name === 'string' ? property.name : null,
    typeof address?.locality === 'string' ? address.locality : null,
    typeof property?.locality === 'string' ? property.locality : null,
    typeof address?.city === 'string' ? address.city : null,
    typeof property?.city === 'string' ? property.city : null,
  ]
    .filter((part): part is string => Boolean(part && part.trim()))
    .filter((part, index, all) => all.findIndex((item) => item.toLowerCase() === part.toLowerCase()) === index)
    .join(', ');

  return googleMapsSearchUrl(query);
}
