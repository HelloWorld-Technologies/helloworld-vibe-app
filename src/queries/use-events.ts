import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  getEventsList,
  getRegisteredEvents,
  postCancelEventRegistration,
  type EventListType,
} from '@/api/community';
import type { CommunityEventsTab } from '@/constants/community';
import { queryKeys } from '@/queries/keys';
import { useAuthStore } from '@/stores/auth-store';

function listTypeForTab(tab: CommunityEventsTab): EventListType {
  if (tab === 'past') return 'previous';
  return 'upcoming';
}

export function useCommunityEvents(tab: CommunityEventsTab, city?: string) {
  const mobile = useAuthStore((state) => state.mobile) ?? '';

  return useQuery({
    queryKey:
      tab === 'registered'
        ? queryKeys.communityRegisteredEvents(mobile)
        : queryKeys.communityEvents(tab, city ?? ''),
    queryFn: async () => {
      if (tab === 'registered') {
        if (!mobile) return [];
        const result = await getRegisteredEvents(mobile);
        return result.data;
      }

      const result = await getEventsList(city ?? '', listTypeForTab(tab));
      if (!result.success) return [];
      return result.data;
    },
    enabled: tab !== 'registered' || Boolean(mobile),
  });
}

export function useUpcomingEvents(city?: string) {
  return useQuery({
    queryKey: queryKeys.communityEvents('upcoming', city ?? ''),
    queryFn: () => getEventsList(city ?? '', 'upcoming'),
    select: (result) => result.data ?? [],
  });
}

export function useCancelEventRegistration() {
  const queryClient = useQueryClient();
  const mobile = useAuthStore((state) => state.mobile) ?? '';

  return useMutation({
    mutationFn: async (registrationId: number) => {
      if (!mobile) {
        throw new Error('Mobile number is required to cancel registration');
      }
      const result = await postCancelEventRegistration({ registrationId, mobile });
      if (!result.success) {
        throw new Error(result.message ?? 'Failed to cancel registration');
      }
      return result;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.communityRegisteredEvents(mobile),
      });
      void queryClient.invalidateQueries({ queryKey: ['community-events'] });
    },
  });
}
