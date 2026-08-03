import { useQuery } from '@tanstack/react-query';

import { getPendingReviews } from '@/api/reviews';
import { queryKeys } from '@/queries/keys';
import { useTenantProfile } from '@/stores/tenant-store';

export function usePendingReviews() {
  const profile = useTenantProfile();
  const bookingId = profile?.bookingId ?? '';

  return useQuery({
    queryKey: queryKeys.pendingReviews(bookingId),
    enabled: Boolean(bookingId),
    queryFn: async () => {
      const result = await getPendingReviews({ booking_id: bookingId });
      return result.success ? result.data : [];
    },
  });
}
