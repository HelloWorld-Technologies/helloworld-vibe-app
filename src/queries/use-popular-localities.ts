import { useQuery } from '@tanstack/react-query';

import { fetchPopularLocalities } from '@/api/localities';
import { queryKeys } from '@/queries/keys';

export function usePopularLocalities(city: string) {
  return useQuery({
    queryKey: queryKeys.popularLocalities(city),
    queryFn: () => fetchPopularLocalities(city),
    enabled: Boolean(city),
    staleTime: 5 * 60_000,
  });
}
