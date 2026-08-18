import { useMemo } from 'react';

import type { PropertyDetailResponse } from '@/types/property';
import { useSrpProperties } from '@/queries/use-srp-properties';
import {
  SIMILAR_PROPERTIES_LIMIT,
  buildSimilarPropertyListings,
  extractSimilarProperties,
} from '@/utils/similar-properties';

type UseSimilarPropertiesArgs = {
  propertyId: string;
  detail?: PropertyDetailResponse | null;
  property?: Record<string, unknown> | null;
  city?: string;
  locality?: string | null;
  limit?: number;
  enabled?: boolean;
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
  enabled = true,
}: UseSimilarPropertiesArgs) {
  const embeddedCount = extractSimilarProperties(detail, property).length;
  const fetchSrp = enabled && embeddedCount < limit;
  const { data: srpData, isLoading: isSrpLoading } = useSrpProperties(
    fetchSrp ? (city ?? '') : '',
    fetchSrp ? locality : null,
  );

  const listings = useMemo(
    () =>
      buildSimilarPropertyListings({
        propertyId,
        detail,
        property,
        srpListings: srpData?.listings ?? [],
        nearByListings: srpData?.nearByListings ?? [],
        limit,
        useSampleFallback: fetchSrp ? !city || !isSrpLoading : true,
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
      fetchSrp,
    ],
  );

  return {
    listings,
    isLoading: fetchSrp && Boolean(city) && isSrpLoading && listings.length === 0,
  };
}
