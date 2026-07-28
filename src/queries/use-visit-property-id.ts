import { useQuery } from '@tanstack/react-query';

import { lookupPropertyIdByName } from '@/api/property';
import { queryKeys } from '@/queries/keys';
import type { PropertyVisit } from '@/types/visit';
import { getVisitPropertyId, getVisitPropertyName } from '@/utils/visit-format';

/**
 * CRM visit list often omits Property_Id. Fall back to house lookup by Building_Name
 * so slots / HDP can use the same property_id as schedule visit.
 */
export function useVisitPropertyId(visit: PropertyVisit | null, enabled = true) {
  const directId = visit ? getVisitPropertyId(visit) : null;
  const propertyName = visit ? getVisitPropertyName(visit) : '';

  const nameLookup = useQuery({
    queryKey: queryKeys.propertyByName(propertyName),
    queryFn: () => lookupPropertyIdByName(propertyName),
    enabled: Boolean(enabled && visit && directId == null && propertyName && propertyName !== 'Property'),
    staleTime: 5 * 60_000,
  });

  const propertyId = directId ?? nameLookup.data ?? null;
  const isLoading = directId == null && nameLookup.isLoading;
  const isError =
    directId == null && (nameLookup.isError || (nameLookup.isSuccess && nameLookup.data == null));

  return {
    propertyId,
    isLoading,
    isError,
    refetch: nameLookup.refetch,
  };
}
