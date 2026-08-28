import { nearbyCategoryFlow } from '@/constants/nearby-categories';
import type { HdpDayCard, HdpDayCardOption, NearByArea, NearbyPlace } from '@/types/hdp-nearby';
import type { LocalityInfo } from '@/types/locality';
import type { PropertyDetailResponse } from '@/types/property';
import { formatPropertyImageUrl } from '@/utils/images';

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

function normalizeNearbyKey(key: string) {
  return key.trim().toLowerCase().replace(/[\s-]+/g, '_');
}

function isLocalAssetPath(value: string) {
  return value.startsWith('/assets/') || value.startsWith('assets/');
}

function parseDistanceKm(distance?: string | number) {
  if (typeof distance === 'number' && Number.isFinite(distance)) return distance;
  const raw = String(distance ?? '').trim();
  if (!raw) return null;
  const match = raw.match(/([\d.]+)/);
  if (!match) return null;
  const value = Number(match[1]);
  return Number.isFinite(value) ? value : null;
}

function sortPlacesByDistance(places: NearbyPlace[]) {
  return [...places].sort((a, b) => {
    if (a.distance_meters != null && b.distance_meters != null) {
      return a.distance_meters - b.distance_meters;
    }
    const distA = parseDistanceKm(a.distance);
    const distB = parseDistanceKm(b.distance);
    if (distA == null && distB == null) return 0;
    if (distA == null) return 1;
    if (distB == null) return -1;
    return distA - distB;
  });
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
  const raw = [
    place.image,
    record.photo,
    place.image_url,
    record.imageUrl,
    record.photo_url,
    record.photoUrl,
    record.thumbnail,
  ]
    .map((value) => String(value ?? '').trim())
    .find(Boolean);

  if (!raw || raw.includes('coming-soon') || isLocalAssetPath(raw)) {
    return undefined;
  }

  if (raw.startsWith('data:')) return raw;

  if (raw.includes('http://') || raw.includes('https://')) {
    const formatted = formatPropertyImageUrl(raw, 'srp');
    return formatted.includes('coming-soon') ? undefined : formatted;
  }

  if (raw.startsWith('/')) return undefined;

  const formatted = formatPropertyImageUrl(raw, 'srp');
  if (!formatted || formatted.includes('coming-soon')) return undefined;
  return formatted;
}

function mapPlaceOptions(categoryKey: string, places: NearbyPlace[]): HdpDayCardOption[] {
  const options: HdpDayCardOption[] = [];

  for (const [placeIndex, place] of sortPlacesByDistance(places).entries()) {
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

function findPlacesForCategory(
  nearBy: NearByArea,
  apiKeys: readonly string[],
  claimedKeys: ReadonlySet<string>,
): { key: string; places: NearbyPlace[] } | null {
  const entries = Object.entries(nearBy).filter(([key]) => !claimedKeys.has(key));

  for (const apiKey of apiKeys) {
    const needle = normalizeNearbyKey(apiKey);
    for (const [key, places] of entries) {
      if (!Array.isArray(places) || places.length === 0) continue;
      if (normalizeNearbyKey(key) === needle) {
        const valid = places.filter((place) => place?.name?.trim());
        if (valid.length > 0) return { key, places: valid };
      }
    }
  }

  for (const apiKey of apiKeys) {
    const needle = normalizeNearbyKey(apiKey);
    for (const [key, places] of entries) {
      if (!Array.isArray(places) || places.length === 0) continue;
      const normalized = normalizeNearbyKey(key);
      if (normalized.includes(needle) || needle.includes(normalized)) {
        const valid = places.filter((place) => place?.name?.trim());
        if (valid.length > 0) return { key, places: valid };
      }
    }
  }

  return null;
}

function buildDayCard(
  id: string,
  emoji: string,
  category: string,
  linkLabel: string,
  options: HdpDayCardOption[],
): HdpDayCard | null {
  if (options.length === 0) return null;
  const primary = options[0];

  return {
    id,
    emoji,
    category,
    placeName: primary.placeName,
    walkTime: primary.walkTime,
    linkLabel,
    imageUri: primary.imageUri,
    options,
  };
}

export function mapNearByToDayCards(nearBy: NearByArea | null | undefined): HdpDayCard[] {
  if (!nearBy) return [];

  const cards: HdpDayCard[] = [];
  const claimedKeys = new Set<string>();

  for (const def of nearbyCategoryFlow) {
    const matched = findPlacesForCategory(nearBy, def.apiKeys, claimedKeys);
    if (!matched) continue;

    claimedKeys.add(matched.key);
    const options = mapPlaceOptions(def.id, matched.places);
    const card = buildDayCard(def.id, def.emoji, def.category, def.linkLabel, options);
    if (card) cards.push(card);
  }

  for (const [categoryKey, places] of Object.entries(nearBy)) {
    if (claimedKeys.has(categoryKey)) continue;
    if (!Array.isArray(places) || places.length === 0) continue;

    const options = mapPlaceOptions(categoryKey, places);
    const category = formatNearbyCategoryLabel(categoryKey);
    const card = buildDayCard(
      categoryKey,
      nearbyEmoji(categoryKey),
      category,
      `View ${category} Nearby`,
      options,
    );
    if (card) cards.push(card);
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
      ...(place.image || place.image_url ? { image: place.image ?? place.image_url } : {}),
    }));
  }

  return mapNearByToDayCards(area);
}
