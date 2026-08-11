import { useQuery } from '@tanstack/react-query';

import { getPropertyData } from '@/api/property';
import { queryKeys } from '@/queries/keys';

export function usePropertyDetail(id: string, vibeIds: readonly number[] = []) {
  const vibes = vibeIds.filter((vibeId) => Number.isFinite(vibeId) && vibeId > 0);
  const vibesKey = vibes.join(',');

  return useQuery({
    queryKey: queryKeys.propertyDetail(id, vibesKey),
    queryFn: () => getPropertyData(id, { vibes }),
    enabled: Boolean(id),
  });
}
