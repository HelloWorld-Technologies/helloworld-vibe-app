import { useQuery } from '@tanstack/react-query';

import {
  getSmartMeterPaymentHistory,
  getSmartMeterRooms,
  resolveSmartMeterBookingId,
} from '@/api/smart-meter';
import { queryKeys } from '@/queries/keys';

export function useSmartMeterRooms(bookingId?: string, enabled = true) {
  const resolvedBookingId = resolveSmartMeterBookingId(bookingId);

  return useQuery({
    queryKey: queryKeys.smartMeterRooms(resolvedBookingId),
    queryFn: async () => {
      const response = await getSmartMeterRooms(resolvedBookingId);
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch meter details');
      }
      return response.data ?? [];
    },
    enabled: Boolean(resolvedBookingId) && enabled,
    staleTime: 30_000,
  });
}

export function useSmartMeterPaymentHistory(bookingId?: string, enabled = true) {
  const resolvedBookingId = resolveSmartMeterBookingId(bookingId);

  return useQuery({
    queryKey: queryKeys.smartMeterPaymentHistory(resolvedBookingId),
    queryFn: async () => {
      const response = await getSmartMeterPaymentHistory(resolvedBookingId, {
        status: 'success',
      });
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch payment history');
      }
      return response.data?.recharges ?? [];
    },
    enabled: Boolean(resolvedBookingId) && enabled,
    staleTime: 30_000,
  });
}
