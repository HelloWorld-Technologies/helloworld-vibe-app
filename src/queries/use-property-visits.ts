import { useQuery } from '@tanstack/react-query';

import { getPropertyVisitStats } from '@/api/property-visits';
import { queryKeys } from '@/queries/keys';

export function usePropertyVisitStats(propertyId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.propertyVisitStats(propertyId),
    queryFn: () => getPropertyVisitStats(propertyId),
    enabled: Boolean(propertyId) && enabled,
    staleTime: 60_000,
  });
}
