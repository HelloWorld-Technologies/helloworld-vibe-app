import { useQuery } from '@tanstack/react-query';

import { fetchPropertyList, mapApiPropertyToListing } from '@/api/property';
import { queryKeys } from '@/queries/keys';

export const SRP_PAGE_SIZE = 10;

export function useSrpProperties(
  city: string,
  locality: string | null = null,
  vibeIds: readonly number[] = [],
) {
  const localityKey = locality ?? '';
  const vibes = vibeIds.filter((id) => Number.isFinite(id) && id > 0);
  const vibesKey = vibes.join(',');

  return useQuery({
    queryKey: queryKeys.srpProperties(city, localityKey, vibesKey),
    queryFn: () =>
      fetchPropertyList(
        {
          city,
          localityName: locality || undefined,
          filter: vibes.length > 0 ? { amenities: [], vibes: [...vibes] } : undefined,
        },
        { page: 1, page_size: SRP_PAGE_SIZE },
      ),
    enabled: Boolean(city),
    select: (response) => ({
      success: response.success,
      listings: (response.data ?? [])
        .slice(0, SRP_PAGE_SIZE)
        .map(mapApiPropertyToListing),
      total: response.pageInfo?.total ?? response.data?.length ?? 0,
      nearByListings: (response.nearBy ?? []).map(mapApiPropertyToListing),
      pageInfo: response.pageInfo,
    }),
  });
}
