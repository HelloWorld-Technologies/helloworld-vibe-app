import { useQuery } from '@tanstack/react-query';

import { fetchPopularLocalities } from '@/api/localities';
import { queryKeys } from '@/queries/keys';

export function usePopularLocalities(city: string, count?: number) {
  return useQuery({
    queryKey: queryKeys.popularLocalities(city, count),
    queryFn: () => fetchPopularLocalities(city, count),
    enabled: Boolean(city),
    staleTime: 5 * 60_000,
  });
}
