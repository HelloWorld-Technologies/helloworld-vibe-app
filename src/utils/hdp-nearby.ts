import type { PropertyDetailResponse } from '@/types/property';
import { ImageAssets } from '@/constants/assets';
import type { HdpDayCard, HdpDayCardOption, NearByArea, NearbyPlace } from '@/types/hdp-nearby';

const NEARBY_PLACEHOLDER_IMAGES = [
  ImageAssets.loginBento1,
  ImageAssets.loginBento2,
  ImageAssets.loginBento3,
  ImageAssets.loginBento4,
] as const;

const NEARBY_EMOJI: Record<string, string> = {
  transport: '🚇',
  transit: '🚌',
  metro: '🚇',
  school: '🎓',
  education: '🎓',
  hospital: '🏥',
  health: '🏥',
  store: '🛒',
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

export function formatNearbyWalkTime(distance?: string) {
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

function mapPlaceOptions(
  categoryKey: string,
  places: NearbyPlace[],
  imageOffset: number,
): { options: HdpDayCardOption[]; nextImageIndex: number } {
  const options: HdpDayCardOption[] = [];
  let imageIndex = imageOffset;

  for (const [placeIndex, place] of places.entries()) {
    if (!place?.name?.trim()) continue;

    const image = NEARBY_PLACEHOLDER_IMAGES[imageIndex % NEARBY_PLACEHOLDER_IMAGES.length];
    imageIndex += 1;

    options.push({
      id: `${categoryKey}-${placeIndex}`,
      placeName: place.name.trim(),
      walkTime: formatNearbyWalkTime(place.distance),
      imageUri: image,
    });
  }

  return { options, nextImageIndex: imageIndex };
}

export function mapNearByToDayCards(nearBy: NearByArea | null | undefined): HdpDayCard[] {
  if (!nearBy) return [];

  const cards: HdpDayCard[] = [];
  let imageIndex = 0;

  for (const [categoryKey, places] of Object.entries(nearBy)) {
    if (!Array.isArray(places) || places.length === 0) continue;

    const { options, nextImageIndex } = mapPlaceOptions(categoryKey, places, imageIndex);
    imageIndex = nextImageIndex;

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
