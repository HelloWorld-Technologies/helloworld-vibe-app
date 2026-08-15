import type { RoomMate } from '@/types/roommate';

export function getMatePropertyLabel(mate: RoomMate, fallback?: string) {
  const unit = mate.bedNo ?? mate.flatNo ?? mate.roomNo;
  const property = mate.propertyName ?? mate.property_name ?? fallback;
  return [unit, property].filter(Boolean).join(' · ') || fallback || '';
}

export function formatMateCreatedAt(mate: RoomMate) {
  const raw = mate.createdAt ?? mate.created_at;
  if (!raw?.trim()) return '';

  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return '';

  return date.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}
