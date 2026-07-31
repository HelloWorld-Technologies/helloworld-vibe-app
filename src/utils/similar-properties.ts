import type { ApiProperty, PropertyDetailResponse } from '@/types/property';
import { mapApiPropertyToListing } from '@/api/property';
import { SAMPLE_PROPERTIES } from '@/constants/sample-property';
import type { PropertyListing } from '@/types/property';

export const SIMILAR_PROPERTIES_LIMIT = 10;

function isApiProperty(value: unknown): value is ApiProperty {
  if (!value || typeof value !== 'object') return false;
  const record = value as ApiProperty;
  return record.id !== undefined && record.id !== null;
}

export function extractSimilarProperties(
  detail?: PropertyDetailResponse | null,
  property?: Record<string, unknown> | null,
): ApiProperty[] {
  const candidates = [
    detail?.similarProperties,
    detail?.similar_properties,
    detail?.similar,
    property?.similarProperties,
    property?.similar_properties,
    property?.similar,
  ];

  for (const raw of candidates) {
    if (Array.isArray(raw) && raw.length > 0) {
      return raw.filter(isApiProperty);
    }
  }

  return [];
}

type BuildSimilarPropertyListingsArgs = {
  propertyId: string;
  detail?: PropertyDetailResponse | null;
  property?: Record<string, unknown> | null;
  srpListings?: PropertyListing[];
  nearByListings?: PropertyListing[];
  limit?: number;
  useSampleFallback?: boolean;
};

export function buildSimilarPropertyListings({
  propertyId,
  detail,
  property,
  srpListings = [],
  nearByListings = [],
  limit = SIMILAR_PROPERTIES_LIMIT,
  useSampleFallback = true,
}: BuildSimilarPropertyListingsArgs): PropertyListing[] {
  const currentId = String(propertyId);
  const merged: PropertyListing[] = [];
  const seen = new Set<string>();

  function append(listings: PropertyListing[]) {
    for (const listing of listings) {
      if (merged.length >= limit) return;
      if (!listing.id || listing.id === currentId || seen.has(listing.id)) continue;
      seen.add(listing.id);
      merged.push(listing);
    }
  }

  append(extractSimilarProperties(detail, property).map(mapApiPropertyToListing));
  append(srpListings);
  append(nearByListings);
  if (useSampleFallback) {
    append(SAMPLE_PROPERTIES);
  }

  return merged.slice(0, limit);
}
