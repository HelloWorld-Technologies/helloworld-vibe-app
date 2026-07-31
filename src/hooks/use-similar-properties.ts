import { useMemo } from 'react';

import type { PropertyDetailResponse } from '@/types/property';
import { useSrpProperties } from '@/queries/use-srp-properties';
import {
  SIMILAR_PROPERTIES_LIMIT,
  buildSimilarPropertyListings,
} from '@/utils/similar-properties';

type UseSimilarPropertiesArgs = {
  propertyId: string;
  detail?: PropertyDetailResponse | null;
  property?: Record<string, unknown> | null;
  city?: string;
  locality?: string | null;
  limit?: number;
};

function listingsKey(listings: { id: string }[] | undefined) {
  return listings?.map((item) => item.id).join('|') ?? '';
}

export function useSimilarProperties({
  propertyId,
  detail,
  property,
  city,
  locality = null,
  limit = SIMILAR_PROPERTIES_LIMIT,
}: UseSimilarPropertiesArgs) {
  const { data: srpData, isLoading: isSrpLoading } = useSrpProperties(city ?? '', locality);

  const listings = useMemo(
    () =>
      buildSimilarPropertyListings({
        propertyId,
        detail,
        property,
        srpListings: srpData?.listings ?? [],
        nearByListings: srpData?.nearByListings ?? [],
        limit,
        useSampleFallback: !city || !isSrpLoading,
      }),
    [
      city,
      detail,
      isSrpLoading,
      limit,
      listingsKey(srpData?.nearByListings),
      listingsKey(srpData?.listings),
      property,
      propertyId,
    ],
  );

  return {
    listings,
    isLoading: Boolean(city) && isSrpLoading && listings.length === 0,
  };
}
