import { http } from '@/api/http';
import type { CommunityEventDetailResponse } from '@/types/community';

export type CommunityEvent = {
  id: number;
  name: string;
  city?: string;
  display_image?: string;
  start_date?: string;
  event_start_date?: string;
  attendees_count?: number;
  people_attending?: number;
  total_registration?: number;
  female_count?: number;
  is_registered?: boolean;
  registered?: boolean;
  /** Present on `/hello/event/registered` results — needed to cancel. */
  registrationId?: number;
};

export type EventListType = 'all' | 'previous' | 'upcoming';

type ApiSuccessMessage = {
  success?: boolean;
  message?: string;
};

function asEventList(data: unknown): CommunityEvent[] {
  if (!Array.isArray(data)) return [];
  return data.filter(
    (item): item is CommunityEvent =>
      Boolean(item) &&
      typeof item === 'object' &&
      typeof (item as CommunityEvent).id === 'number' &&
      typeof (item as CommunityEvent).name === 'string',
  );
}

function resolveRegistrationId(item: Record<string, unknown>): number | undefined {
  const candidates = [
    item.registrationId,
    item.registration_id,
    (item.registration as { id?: unknown } | undefined)?.id,
  ];
  for (const value of candidates) {
    const id = typeof value === 'number' ? value : Number(value);
    if (Number.isFinite(id) && id > 0) return id;
  }
  return undefined;
}

function normalizeRegisteredEvent(item: unknown): CommunityEvent | null {
  if (!item || typeof item !== 'object') return null;

  const record = item as Record<string, unknown>;
  const nested =
    record.event && typeof record.event === 'object'
      ? (record.event as Record<string, unknown>)
      : null;
  const source = nested ?? record;

  const id = Number(source.id ?? record.event_id ?? record.eventId);
  const name = source.name;
  if (!Number.isFinite(id) || typeof name !== 'string' || !name.trim()) {
    return null;
  }

  return {
    id,
    name,
    city: typeof source.city === 'string' ? source.city : undefined,
    display_image:
      typeof source.display_image === 'string' ? source.display_image : undefined,
    start_date: typeof source.start_date === 'string' ? source.start_date : undefined,
    event_start_date:
      typeof source.event_start_date === 'string' ? source.event_start_date : undefined,
    attendees_count:
      typeof source.attendees_count === 'number' ? source.attendees_count : undefined,
    people_attending:
      typeof source.people_attending === 'number' ? source.people_attending : undefined,
    total_registration:
      typeof source.total_registration === 'number'
        ? source.total_registration
        : undefined,
    female_count: typeof source.female_count === 'number' ? source.female_count : undefined,
    is_registered: true,
    registered: true,
    registrationId: resolveRegistrationId(record) ?? resolveRegistrationId(source),
  };
}

export async function getEventsList(
  city = '',
  type: EventListType = 'upcoming',
): Promise<{ success: boolean; data: CommunityEvent[] }> {
  try {
    const { data } = await http.get('hello/event/list', {
      params: { city, type },
    });
    const events = data?.data ?? data;
    return {
      success: true,
      data: asEventList(events),
    };
  } catch {
    return { success: false, data: [] };
  }
}

export async function getRegisteredEvents(
  mobile: string,
): Promise<{ success: boolean; data: CommunityEvent[]; message?: string }> {
  try {
    const { data } = await http.get<{ success?: boolean; data?: unknown; message?: string }>(
      'hello/event/registered',
      { params: { mobile } },
    );

    const raw = data?.data ?? data;
    const list = Array.isArray(raw)
      ? raw.map(normalizeRegisteredEvent).filter((item): item is CommunityEvent => item != null)
      : [];

    return {
      success: Boolean(data?.success),
      data: list,
      message: data?.message,
    };
  } catch (error: unknown) {
    const message =
      error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
    return {
      success: false,
      data: [],
      message: message ?? 'Failed to load registered events',
    };
  }
}

export async function getHwEventDetail(
  id: number,
): Promise<{ success: boolean; data: CommunityEventDetailResponse | null }> {
  try {
    const { data } = await http.get('hello/event', { params: { id } });
    const payload = data?.data ?? data;
    return { success: true, data: payload ?? null };
  } catch {
    return { success: false, data: null };
  }
}

export async function postBookEvent(payload: {
  id: number;
  email: string;
  name: string;
  mobile: string;
  seatsBooked: number;
}): Promise<{ success: boolean; message?: string }> {
  try {
    const { data } = await http.post<ApiSuccessMessage>('hello/event/assign', payload);
    return {
      success: Boolean(data?.success),
      message: data?.message,
    };
  } catch (error: unknown) {
    const message =
      error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
    return { success: false, message: message ?? 'Failed to register for event' };
  }
}

export async function postCancelEventRegistration(payload: {
  registrationId: number;
  mobile: string;
}): Promise<{ success: boolean; message?: string }> {
  try {
    const { data } = await http.post<ApiSuccessMessage>(
      'hello/event/cancel-registration',
      payload,
    );
    return {
      success: Boolean(data?.success),
      message: data?.message,
    };
  } catch (error: unknown) {
    const message =
      error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
    return {
      success: false,
      message: message ?? 'Failed to cancel registration',
    };
  }
}

export async function postEventRequest(payload: {
  event_name: string;
  category: string;
  additional_details?: string;
}): Promise<{ success: boolean; message?: string }> {
  try {
    const { data } = await http.post<ApiSuccessMessage>(
      'api/hello/community/event/request',
      {
        event_name: payload.event_name,
        category: payload.category,
        additional_details: payload.additional_details ?? '',
      },
    );
    return {
      success: Boolean(data?.success),
      message: data?.message,
    };
  } catch (error: unknown) {
    const message =
      error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
    return { success: false, message: message ?? 'Failed to submit event request' };
  }
}
