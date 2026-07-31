import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  DASHBOARD_EVENTS_PAGE_SIZE,
  EVENTS_PAGE_SIZE,
  getEventsList,
  getRegisteredEvents,
  postCancelEventRegistration,
  resolveNextEventsPage,
} from '@/api/community';
import type { EventListType } from '@/types/community';
import type { CommunityEventsTab } from '@/constants/community';
import { queryKeys } from '@/queries/keys';
import { useAuthStore } from '@/stores/auth-store';

function listTypeForTab(tab: CommunityEventsTab): EventListType {
  if (tab === 'past') return 'previous';
  return 'upcoming';
}

/** First-page preview for dashboard — separate key from infinite list. */
export function useUpcomingEvents(city?: string) {
  return useQuery({
    queryKey: queryKeys.communityEvents('upcoming', city ?? '', DASHBOARD_EVENTS_PAGE_SIZE),
    queryFn: async () => {
      const result = await getEventsList({
        city: city ?? '',
        type: 'upcoming',
        page: 1,
        pageSize: DASHBOARD_EVENTS_PAGE_SIZE,
      });
      return result.success ? result.data : [];
    },
  });
}

export function useCommunityEventsInfinite(tab: CommunityEventsTab, city?: string) {
  const mobile = useAuthStore((state) => state.mobile) ?? '';
  const cityKey = city ?? '';

  return useInfiniteQuery({
    queryKey:
      tab === 'registered'
        ? [...queryKeys.communityRegisteredEvents(mobile), 'infinite', EVENTS_PAGE_SIZE]
        : queryKeys.communityEventsInfinite(tab, cityKey, EVENTS_PAGE_SIZE),
    initialPageParam: 1,
    enabled: tab !== 'registered' || Boolean(mobile),
    queryFn: async ({ pageParam }) => {
      if (tab === 'registered') {
        if (!mobile) return { success: true, data: [] };
        return getRegisteredEvents(mobile, {
          page: pageParam,
          pageSize: EVENTS_PAGE_SIZE,
        });
      }

      return getEventsList({
        city: cityKey,
        type: listTypeForTab(tab),
        page: pageParam,
        pageSize: EVENTS_PAGE_SIZE,
      });
    },
    getNextPageParam: (lastPage, _pages, lastPageParam) =>
      resolveNextEventsPage(
        lastPage.pageInfo,
        lastPageParam,
        lastPage.data?.length ?? 0,
        lastPage.pageInfo?.pageSize ?? EVENTS_PAGE_SIZE,
      ),
  });
}

/** @deprecated Prefer useCommunityEventsInfinite for list screens. */
export function useCommunityEvents(tab: CommunityEventsTab, city?: string) {
  const query = useCommunityEventsInfinite(tab, city);
  const events = query.data?.pages.flatMap((page) => page.data ?? []) ?? [];
  return { ...query, data: events };
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
