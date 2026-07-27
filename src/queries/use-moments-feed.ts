import { useQuery } from '@tanstack/react-query';

import { getMomentsList } from '@/api/moments';
import { queryKeys } from '@/queries/keys';

export const MOMENTS_FEED_PAGE_SIZE = 20;

export function useMomentsFeed() {
  return useQuery({
    queryKey: queryKeys.momentsFeed,
    queryFn: () =>
      getMomentsList({
        mediaType: 'video',
        page: 1,
        pageSize: MOMENTS_FEED_PAGE_SIZE,
      }),
    select: (response) => ({
      success: response.success,
      moments: response.data,
      total: response.pagination?.total ?? response.data.length,
    }),
  });
}
