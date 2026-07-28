import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { getSupportTickets, resolveNextTicketPage } from '@/api/tickets';
import {
  ACTIVE_TICKET_STATUSES,
  RESOLVED_TICKET_STATUSES,
} from '@/types/ticket';

export const SUPPORT_TICKETS_PAGE_SIZE = 10;
export const DASHBOARD_TICKETS_PAGE_SIZE = 3;

export function useSupportTickets(options?: {
  status?: string | string[];
  pageSize?: number;
}) {
  const pageSize = options?.pageSize ?? SUPPORT_TICKETS_PAGE_SIZE;
  const statusKey = Array.isArray(options?.status)
    ? options.status.join(',')
    : (options?.status ?? 'all');

  return useQuery({
    queryKey: ['support-tickets', statusKey, pageSize],
    queryFn: () =>
      getSupportTickets({
        page: 1,
        pageSize,
        status: options?.status,
      }),
    select: (result) => result.data ?? [],
  });
}

export function useDashboardSupportTickets() {
  return useSupportTickets({
    pageSize: DASHBOARD_TICKETS_PAGE_SIZE,
    status: [...ACTIVE_TICKET_STATUSES],
  });
}

export function useSupportTicketsInfinite(tab: 'active' | 'resolved') {
  const status =
    tab === 'active'
      ? [...ACTIVE_TICKET_STATUSES]
      : [...RESOLVED_TICKET_STATUSES];

  return useInfiniteQuery({
    queryKey: ['support-tickets', 'infinite', tab, SUPPORT_TICKETS_PAGE_SIZE],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      getSupportTickets({
        page: pageParam,
        pageSize: SUPPORT_TICKETS_PAGE_SIZE,
        status,
      }),
    getNextPageParam: (lastPage, _pages, lastPageParam) =>
      resolveNextTicketPage(
        lastPage.pageInfo,
        lastPageParam,
        lastPage.data?.length ?? 0,
        SUPPORT_TICKETS_PAGE_SIZE,
      ),
  });
}
