import { useQuery } from '@tanstack/react-query';

import { getPropertyVisitSlots } from '@/api/visit';
import type { VisitSlotDay } from '@/types/visit';
import { queryKeys } from '@/queries/keys';

export function usePropertyVisitSlots(propertyId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.propertyVisitSlots(propertyId),
    queryFn: async () => {
      const response = await getPropertyVisitSlots(propertyId);

      if (!response.success || !Array.isArray(response.data)) {
        return [] as VisitSlotDay[];
      }

      return response.data;
    },
    enabled: Boolean(propertyId) && enabled,
    staleTime: 60_000,
  });
}
