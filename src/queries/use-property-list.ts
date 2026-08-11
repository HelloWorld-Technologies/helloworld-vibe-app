import { useInfiniteQuery } from '@tanstack/react-query';

import { fetchPropertyList, mapApiPropertyToListing, resolveNextPropertyPage } from '@/api/property';
import type { SortOption } from '@/components/srp/srp-filter-sort-bar';
import { SRP_PAGE_SIZE } from '@/queries/use-srp-properties';
import { queryKeys } from '@/queries/keys';
import type { SrpFilters } from '@/types/srp-filters';
import {
  buildSrpApiFilter,
  buildSrpApiSorting,
  serializeSrpFilters,
} from '@/utils/build-srp-api-payload';

export function usePropertyList(
  city: string,
  locality: string,
  filters: SrpFilters,
  sort: SortOption,
  vibeIds: readonly number[] = [],
) {
  const filtersKey = serializeSrpFilters(filters, sort);
  const vibes = vibeIds.filter((id) => Number.isFinite(id) && id > 0);
  const vibesKey = vibes.join(',');
  const apiFilter = buildSrpApiFilter(filters, vibes);
  const apiSorting = buildSrpApiSorting(sort);

  return useInfiniteQuery({
    queryKey: queryKeys.propertyList(city, locality, filtersKey, vibesKey),
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      fetchPropertyList(
        {
          city,
          localityName: locality || undefined,
          filter: apiFilter,
          sorting: apiSorting,
        },
        { page: pageParam, page_size: SRP_PAGE_SIZE },
      ),
    getNextPageParam: (lastPage, _pages, lastPageParam) =>
      resolveNextPropertyPage(
        lastPage.pageInfo,
        lastPageParam,
        lastPage.data?.length ?? 0,
        SRP_PAGE_SIZE,
      ),
    enabled: Boolean(city),
    select: (data) => ({
      pages: data.pages.map((page) => ({
        ...page,
        listings: (page.data ?? []).map(mapApiPropertyToListing),
        nearByListings: (page.nearBy ?? []).map(mapApiPropertyToListing),
      })),
      pageParams: data.pageParams,
    }),
  });
}
