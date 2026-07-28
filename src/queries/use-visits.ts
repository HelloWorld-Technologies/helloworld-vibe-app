import { useInfiniteQuery } from '@tanstack/react-query';

import {
  getVisitsList,
  resolveNextVisitsPage,
  VISITS_PAGE_SIZE,
} from '@/api/visit';
import { queryKeys } from '@/queries/keys';
import type { VisitTab } from '@/types/visit';

export function useVisits(type: VisitTab) {
  return useInfiniteQuery({
    queryKey: queryKeys.visits(type),
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      getVisitsList({
        type,
        page: pageParam,
        perPage: VISITS_PAGE_SIZE,
      }),
    getNextPageParam: (lastPage, _pages, lastPageParam) =>
      resolveNextVisitsPage(
        lastPage.pageInfo,
        lastPageParam,
        lastPage.data?.length ?? 0,
        VISITS_PAGE_SIZE,
      ),
  });
}
