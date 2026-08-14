export function googleMapsSearchUrl(query: string) {
  const trimmed = query.trim();
  if (!trimmed) return undefined;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trimmed)}`;
}

export function googleMapsPlaceUrl(latitude: number, longitude: number) {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return undefined;
  if (latitude === 0 && longitude === 0) return undefined;
  return `https://www.google.com/maps/place/${latitude},${longitude}`;
}

export function isMapsUrl(value?: string | null) {
  if (!value) return false;
  return /google\.com\/maps|maps\.google|maps\.apple|goo\.gl\/maps|maps\.app\.goo\.gl/i.test(
    value,
  );
}

export function toNumberCoord(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

/** Prefer a maps URL; otherwise search Google Maps for the text. */
export function resolveMapsUrl(raw?: string | null, fallbackQuery?: string) {
  const value = raw?.trim() ?? '';
  if (isMapsUrl(value)) return value;

  const coordMatch = value.match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/);
  if (coordMatch) {
    return googleMapsPlaceUrl(Number(coordMatch[1]), Number(coordMatch[2]));
  }

  return googleMapsSearchUrl(fallbackQuery || value);
}
