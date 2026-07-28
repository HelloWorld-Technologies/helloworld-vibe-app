import { http } from '@/api/http';
import type { PropertyVisit, VisitTab } from '@/types/visit';

export type VisitSlotTime = {
  label: string;
  value: boolean;
};

export type VisitSlotDay = {
  date: string | number;
  slotId: string | number;
  slots?: VisitSlotTime[];
};

export type VisitSlotsResponse = {
  success: boolean;
  data?: VisitSlotDay[];
  message?: string;
  error?: string;
};

export type CreateVisitPayload = {
  date: string;
  savType: string;
  time: string;
  name: string;
  email: string;
  slotId: string | number;
  propertyId: string | number;
  source: string;
  url?: string;
};

export type CreateVisitResponse = {
  success: boolean;
  message?: string;
  error?: string;
};

export type VisitsPageInfo = {
  nextPage?: number | boolean | null;
  total?: number;
  count?: number;
  page?: number;
  pageSize?: number;
};

export type VisitsListParams = {
  type?: VisitTab;
  page?: number;
  perPage?: number;
};

export type VisitsListResult = {
  data: PropertyVisit[];
  pageInfo?: VisitsPageInfo;
};

export type RescheduleVisitPayload = {
  date: string;
  time: string;
  slotId: string | number;
};

export type VisitMutationResponse = {
  success: boolean;
  message?: string;
  error?: string;
};

export const VISITS_PAGE_SIZE = 20;

function parseVisitsPayload(payload: unknown): PropertyVisit[] {
  if (Array.isArray(payload)) return payload as PropertyVisit[];
  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;
    if (Array.isArray(record.data)) return record.data as PropertyVisit[];
    if (Array.isArray(record.visits)) return record.visits as PropertyVisit[];
    if (Array.isArray(record.list)) return record.list as PropertyVisit[];
  }
  return [];
}

function parsePageInfo(payload: unknown): VisitsPageInfo | undefined {
  if (!payload || typeof payload !== 'object') return undefined;
  const record = payload as Record<string, unknown>;
  const raw = (record.pageInfo ?? record.pagination ?? record.meta ?? record) as Record<
    string,
    unknown
  >;

  if (!raw || typeof raw !== 'object') return undefined;

  const nextPage =
    raw.nextPage ??
    raw.next_page ??
    (typeof raw.hasMore === 'boolean'
      ? raw.hasMore
      : typeof raw.has_next === 'boolean'
        ? raw.has_next
        : typeof raw.hasNextPage === 'boolean'
          ? raw.hasNextPage
          : undefined);

  const total =
    typeof raw.total === 'number'
      ? raw.total
      : typeof raw.totalCount === 'number'
        ? raw.totalCount
        : undefined;

  const count =
    typeof raw.count === 'number'
      ? raw.count
      : typeof raw.pageSize === 'number'
        ? raw.pageSize
        : typeof raw.per_page === 'number'
          ? raw.per_page
          : undefined;

  const page =
    typeof raw.page === 'number'
      ? raw.page
      : typeof raw.currentPage === 'number'
        ? raw.currentPage
        : undefined;

  const pageSize =
    typeof raw.pageSize === 'number'
      ? raw.pageSize
      : typeof raw.per_page === 'number'
        ? raw.per_page
        : undefined;

  if (
    nextPage === undefined &&
    total === undefined &&
    count === undefined &&
    page === undefined &&
    pageSize === undefined
  ) {
    return undefined;
  }

  return {
    nextPage: nextPage as VisitsPageInfo['nextPage'],
    total,
    count,
    page,
    pageSize,
  };
}

export function resolveNextVisitsPage(
  pageInfo: VisitsPageInfo | undefined,
  lastPageParam: number,
  lastPageCount: number,
  pageSize: number,
): number | undefined {
  const next = pageInfo?.nextPage;
  if (next === false || next === null) return undefined;
  if (typeof next === 'number' && next > lastPageParam) return next;
  if (next === true) return lastPageParam + 1;

  if (typeof pageInfo?.total === 'number' && pageInfo.total >= 0) {
    const loaded = lastPageParam * pageSize;
    if (loaded < pageInfo.total) return lastPageParam + 1;
    return undefined;
  }

  if (lastPageCount >= pageSize) return lastPageParam + 1;
  return undefined;
}

export async function getPropertyVisitSlots(
  propertyId: number | string,
): Promise<VisitSlotsResponse> {
  try {
    const { data } = await http.get<VisitSlotsResponse>('api/hello/visit/slots', {
      params: { property_id: propertyId },
    });
    return data;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load visit slots';
    return { success: false, message };
  }
}

export async function getVisitsList(
  params: VisitsListParams = {},
): Promise<VisitsListResult> {
  const page = params.page ?? 1;
  const perPage = params.perPage ?? VISITS_PAGE_SIZE;
  const type = params.type ?? 'upcoming';

  try {
    const { data } = await http.get<unknown>('api/hello/visits', {
      params: {
        type,
        page,
        per_page: perPage,
      },
    });

    if (data && typeof data === 'object' && 'status' in data && (data as { status?: number }).status === 404) {
      return { data: [] };
    }

    return {
      data: parseVisitsPayload(data),
      pageInfo: parsePageInfo(data),
    };
  } catch {
    return { data: [] };
  }
}

export async function rescheduleVisit(
  crmVisitId: string | number,
  payload: RescheduleVisitPayload,
): Promise<VisitMutationResponse> {
  try {
    const { data } = await http.put<VisitMutationResponse | undefined>(
      `api/hello/visit/${crmVisitId}/reschedule`,
      payload,
    );
    if (data && data.success === false) {
      return { success: false, error: data.error || data.message, message: data.message };
    }
    return { success: true, message: data?.message };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to reschedule visit';
    return { success: false, error: message, message };
  }
}

export async function cancelVisit(
  crmVisitId: string | number,
): Promise<VisitMutationResponse> {
  try {
    const { data } = await http.put<VisitMutationResponse | undefined>(
      `api/hello/visit/${crmVisitId}/cancel`,
    );
    if (data && data.success === false) {
      return { success: false, error: data.error || data.message, message: data.message };
    }
    return { success: true, message: data?.message };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to cancel visit';
    return { success: false, error: message, message };
  }
}

export async function createVisit(payload: CreateVisitPayload): Promise<CreateVisitResponse> {
  try {
    const { data } = await http.post<CreateVisitResponse>('v2/visit/create', payload);
    return data;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create visit';
    return { success: false, error: message, message };
  }
}
