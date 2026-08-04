import { useQuery } from '@tanstack/react-query';

import { getMoveInPaymentDetails } from '@/api/booking';
import { queryKeys } from '@/queries/keys';
import { useTenantProfile } from '@/stores/tenant-store';

export function useMoveInPaymentDetails() {
  const profile = useTenantProfile();
  const bookingId = profile?.bookingId;

  return useQuery({
    queryKey: queryKeys.moveInPayments(bookingId ?? ''),
    queryFn: async () => {
      const response = await getMoveInPaymentDetails(bookingId!);
      if (!response?.success || !response.data) {
        throw new Error(response?.message ?? 'Unable to load move-in payment details');
      }
      return response.data;
    },
    enabled: Boolean(bookingId),
  });
}
