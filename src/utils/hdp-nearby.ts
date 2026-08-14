import type { HdpDayCard, HdpDayCardOption, NearByArea, NearbyPlace } from '@/types/hdp-nearby';
import type { LocalityInfo } from '@/types/locality';
import type { PropertyDetailResponse } from '@/types/property';

const NEARBY_EMOJI: Record<string, string> = {
  transport: '🚇',
  transit: '🚌',
  metro: '🚇',
  school: '🎓',
  education: '🎓',
  hospital: '🏥',
  health: '🏥',
  store: '🛒',
  grocery: '🛒',
  shopping: '🛍️',
  food: '☕',
  dining: '☕',
  cafe: '☕',
  cafes: '☕',
  coffee: '☕',
  restaurant: '🍽️',
  gym: '💪',
  fitness: '💪',
  workout: '💪',
  work: '🧑‍💻',
  office: '🏢',
  park: '🌳',
  mall: '🏬',
  lunch: '🍔',
  morning: '☀️',
  commute: '🚇',
};

function capitalizeWord(word: string) {
  if (!word) return word;
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

export function formatNearbyCategoryLabel(key: string) {
  return key
    .replace(/[_-]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(capitalizeWord)
    .join(' ');
}

function nearbyEmoji(key: string) {
  const normalized = key.toLowerCase().replace(/[_-]+/g, ' ');
  for (const [token, emoji] of Object.entries(NEARBY_EMOJI)) {
    if (normalized.includes(token)) return emoji;
  }
  return '📍';
}

export function formatNearbyWalkTime(distance?: string, distanceMeters?: number | null) {
  if (distanceMeters != null && Number.isFinite(distanceMeters) && distanceMeters >= 0) {
    const minutes = Math.max(1, Math.round(distanceMeters / 80));
    return minutes <= 25 ? `${minutes} min walk` : `${(distanceMeters / 1000).toFixed(1)} km away`;
  }

  const value = String(distance ?? '').trim();
  if (!value) return 'Nearby';
  if (/walk|min/i.test(value)) return value;

  const kmMatch = value.match(/([\d.]+)\s*km?/i);
  const km = kmMatch ? parseFloat(kmMatch[1]) : parseFloat(value);

  if (Number.isFinite(km)) {
    const minutes = Math.max(1, Math.round(km * 12));
    return minutes <= 25 ? `${minutes} min walk` : `${km.toFixed(1)} km away`;
  }

  return /km$/i.test(value) ? `${value} away` : `${value} km away`;
}

function isNearByArea(value: unknown): value is NearByArea {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function mergeNearByAreas(...sources: Array<NearByArea | null | undefined>) {
  const merged: NearByArea = {};

  for (const source of sources) {
    if (!isNearByArea(source)) continue;

    for (const [key, places] of Object.entries(source)) {
      if (!Array.isArray(places) || places.length === 0) continue;
      merged[key] = [...(merged[key] ?? []), ...places];
    }
  }

  return Object.keys(merged).length > 0 ? merged : null;
}

export function extractNearByFromDetail(
  detail?: PropertyDetailResponse | null,
  property?: Record<string, unknown> | null,
) {
  const googleData = detail?.googleData as { data?: NearByArea } | undefined;

  return mergeNearByAreas(
    detail?.nearBy as NearByArea | undefined,
    detail?.nearby as NearByArea | undefined,
    detail?.near_by as NearByArea | undefined,
    property?.nearBy as NearByArea | undefined,
    property?.nearby as NearByArea | undefined,
    property?.near_by as NearByArea | undefined,
    googleData?.data,
  );
}

function resolveNearbyPlaceImage(place: NearbyPlace): string | undefined {
  const record = place as NearbyPlace & Record<string, unknown>;
  const candidates = [
    record.image,
    record.image_url,
    record.imageUrl,
    record.photo,
    record.photo_url,
    record.photoUrl,
    record.thumbnail,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim().length > 0) {
      return candidate.trim();
    }
  }

  return undefined;
}

function mapPlaceOptions(categoryKey: string, places: NearbyPlace[]): HdpDayCardOption[] {
  const options: HdpDayCardOption[] = [];

  for (const [placeIndex, place] of places.entries()) {
    if (!place?.name?.trim()) continue;

    options.push({
      id: `${categoryKey}-${placeIndex}`,
      placeName: place.name.trim(),
      walkTime: formatNearbyWalkTime(place.distance, place.distance_meters),
      imageUri: resolveNearbyPlaceImage(place),
    });
  }

  return options;
}

export function mapNearByToDayCards(nearBy: NearByArea | null | undefined): HdpDayCard[] {
  if (!nearBy) return [];

  const cards: HdpDayCard[] = [];

  for (const [categoryKey, places] of Object.entries(nearBy)) {
    if (!Array.isArray(places) || places.length === 0) continue;

    const options = mapPlaceOptions(categoryKey, places);
    if (options.length === 0) continue;

    const category = formatNearbyCategoryLabel(categoryKey);
    const primary = options[0];

    cards.push({
      id: categoryKey,
      emoji: nearbyEmoji(categoryKey),
      category,
      placeName: primary.placeName,
      walkTime: primary.walkTime,
      linkLabel: `View ${category} Nearby`,
      imageUri: primary.imageUri,
      options,
    });
  }

  return cards;
}

export function mapLocalityNearbyToDayCards(
  nearby?: LocalityInfo['nearby'] | null,
): HdpDayCard[] {
  if (!nearby || typeof nearby !== 'object') return [];

  const area: NearByArea = {};
  for (const [key, places] of Object.entries(nearby)) {
    if (!Array.isArray(places) || places.length === 0) continue;
    area[key] = places.map((place) => ({
      name: place.name,
      distance: place.distance,
      distance_meters: place.distance_meters,
      ...(place.image || place.image_url
        ? { image: place.image ?? place.image_url }
        : {}),
    }));
  }

  return mapNearByToDayCards(area);
}
