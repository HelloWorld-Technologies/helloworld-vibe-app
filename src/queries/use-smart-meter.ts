import { useQuery } from '@tanstack/react-query';

import {
  getSmartMeterPaymentHistory,
  getSmartMeterRooms,
} from '@/api/smart-meter';
import { queryKeys } from '@/queries/keys';

export function useSmartMeterRooms(bookingId?: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.smartMeterRooms(bookingId ?? ''),
    queryFn: async () => {
      const response = await getSmartMeterRooms(bookingId!);
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch meter details');
      }
      return response.data ?? [];
    },
    enabled: Boolean(bookingId) && enabled,
    staleTime: 30_000,
  });
}

export function useSmartMeterPaymentHistory(bookingId?: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.smartMeterPaymentHistory(bookingId ?? ''),
    queryFn: async () => {
      const response = await getSmartMeterPaymentHistory(bookingId!, { status: 'success' });
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch payment history');
      }
      return response.data?.recharges ?? [];
    },
    enabled: Boolean(bookingId) && enabled,
    staleTime: 30_000,
  });
}
