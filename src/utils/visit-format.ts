import type { PropertyVisit, VisitStatus } from '@/types/visit';

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'] as const;

export function getVisitId(visit: PropertyVisit) {
  return String(visit.id);
}

export function getCrmVisitId(visit: PropertyVisit) {
  const raw =
    visit.crmVisitId ?? visit.crm_visit_id ?? visit.Crm_Visit_Id ?? visit.id;
  if (raw == null || raw === '') return null;
  return String(raw);
}

export function getVisitPropertyId(visit: PropertyVisit) {
  const raw = visit.Property_Id ?? visit.property_id;
  if (raw == null || raw === '') return null;
  const numeric = Number(raw);
  return Number.isFinite(numeric) ? numeric : null;
}

export function getVisitPropertyName(visit: PropertyVisit) {
  return visit.Building_Name ?? visit.building_name ?? 'Property';
}

export function getVisitLocality(visit: PropertyVisit) {
  return visit.Locality ?? visit.locality ?? '';
}

export function getVisitStartTime(visit: PropertyVisit) {
  return visit.Visit_Start_Time ?? visit.visit_start_time;
}

export function getVisitEndTime(visit: PropertyVisit) {
  return visit.Visit_End_Time ?? visit.visit_end_time;
}

export function getVisitDirectionsUrl(visit: PropertyVisit) {
  return visit.Sav_Location ?? visit.sav_location;
}

export function getVisitMeetingUrl(visit: PropertyVisit) {
  return visit.SAV_Meeting_Link ?? visit.sav_meeting_link;
}

export function getVisitManagerName(visit: PropertyVisit) {
  return visit.Property_Manager_Name ?? visit.property_manager_name ?? visit.PM_Name ?? '';
}

export function getVisitManagerPhone(visit: PropertyVisit) {
  return visit.PM_Phone ?? visit.pm_phone ?? '';
}

export function getVisitImages(visit: PropertyVisit): string[] {
  const fromList = visit.Property_Images ?? visit.property_images;
  if (Array.isArray(fromList) && fromList.length > 0) {
    return fromList.filter((item): item is string => typeof item === 'string' && item.length > 0);
  }

  const single = visit.Image_URL ?? visit.image_url;
  return single ? [single] : [];
}

export function getVisitStatus(visit: PropertyVisit): VisitStatus {
  const status = String(visit.Status ?? visit.status ?? '').toLowerCase();
  if (status.includes('cancel')) return 'cancelled';

  const startTime = getVisitStartTime(visit);
  if (!startTime) return 'upcoming';

  return new Date(startTime).getTime() > Date.now() ? 'upcoming' : 'visited';
}

export function splitVisits(visits: PropertyVisit[]) {
  const upcoming: PropertyVisit[] = [];
  const past: PropertyVisit[] = [];

  visits.forEach((visit) => {
    if (getVisitStatus(visit) === 'upcoming') {
      upcoming.push(visit);
    } else {
      past.push(visit);
    }
  });

  return { upcoming, past };
}

export function getDaysUntilLabel(startTime?: string) {
  if (!startTime) return null;

  const start = new Date(startTime);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  start.setHours(0, 0, 0, 0);

  const diffDays = Math.round((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return null;
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  return `In ${diffDays} Days`;
}

export function getVisitDateParts(startTime?: string, endTime?: string) {
  if (!startTime) {
    return {
      day: '--',
      month: '---',
      weekday: '—',
      timeRange: '—',
    };
  }

  const start = new Date(startTime);
  const weekday = start.toLocaleDateString('en-IN', { weekday: 'long' });
  const day = String(start.getDate()).padStart(2, '0');
  const month = MONTHS[start.getMonth()];

  const formatTime = (date: Date) =>
    date
      .toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })
      .replace(' ', ' ')
      .toUpperCase();

  const timeRange = endTime
    ? `${formatTime(start)} – ${formatTime(new Date(endTime))}`
    : formatTime(start);

  return { day, month, weekday, timeRange };
}

export function formatVisitRatingDate(startTime?: string) {
  if (!startTime) return '';
  return new Date(startTime).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
