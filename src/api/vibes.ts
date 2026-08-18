import { http } from '@/api/http';
import { FALLBACK_API_VIBES } from '@/constants/vibes';
import type { Vibe, VibesApiResponse } from '@/types/vibes';

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : null;
}

function unwrapVibeRecord(item: unknown): Record<string, unknown> | null {
  const record = asRecord(item);
  if (!record) return null;

  const nested = record.Vibes ?? record.Vibe ?? record.vibe ?? record.vibes;
  const nestedRecord = asRecord(nested);
  return nestedRecord ?? record;
}

function parseVibeId(record: Record<string, unknown>): number | null {
  const raw = record.id ?? record.vibe_id ?? record.vibeId;
  const id = typeof raw === 'number' ? raw : Number(raw);
  return Number.isFinite(id) && id > 0 ? id : null;
}

function asVibeList(data: unknown): Vibe[] {
  const record = asRecord(data);
  const source = Array.isArray(data)
    ? data
    : Array.isArray(record?.data)
      ? record.data
      : Array.isArray(record?.vibes)
        ? record.vibes
        : Array.isArray(record?.list)
          ? record.list
          : null;

  if (!source) return [];

  return source.flatMap((item) => {
    const vibe = unwrapVibeRecord(item);
    if (!vibe) return [];

    const id = parseVibeId(vibe);
    if (id == null) return [];

    const code =
      typeof vibe.code === 'string'
        ? vibe.code
        : typeof vibe.slug === 'string'
          ? vibe.slug
          : typeof vibe.name === 'string'
            ? vibe.name
            : '';
    const displayName =
      typeof vibe.display_name === 'string'
        ? vibe.display_name
        : typeof vibe.displayName === 'string'
          ? vibe.displayName
          : typeof vibe.name === 'string'
            ? vibe.name
            : typeof vibe.label === 'string'
              ? vibe.label
              : '';

    return [
      {
        id,
        code: code || displayName || String(id),
        display_name: displayName || code || String(id),
      },
    ];
  });
}

export function extractVibeIds(data: unknown): string[] {
  return [...new Set(asVibeList(data).map((vibe) => String(vibe.id)))];
}

function withFallback(list: Vibe[]): Vibe[] {
  if (list.length > 0) return list;
  return FALLBACK_API_VIBES.map((vibe) => ({
    id: vibe.id,
    code: vibe.code,
    display_name: vibe.display_name,
  }));
}

export async function getVibesList(): Promise<VibesApiResponse<Vibe[]>> {
  try {
    const { data } = await http.get<VibesApiResponse<Vibe[]> | Vibe[]>('vibes/list');
    const list = asVibeList(
      data && typeof data === 'object' && 'data' in data ? data.data : data,
    );
    return {
      success: true,
      data: withFallback(list),
      message:
        data && typeof data === 'object' && 'message' in data
          ? (data as VibesApiResponse<Vibe[]>).message
          : undefined,
    };
  } catch {
    return { success: true, data: withFallback([]) };
  }
}

export async function getUserVibes(): Promise<VibesApiResponse<Vibe[]>> {
  try {
    const { data } = await http.get<VibesApiResponse<Vibe[]> | Vibe[]>('user/vibes');
    const payload =
      data && typeof data === 'object' && 'data' in data
        ? (data as VibesApiResponse<Vibe[]>).data
        : data;
    const list = asVibeList(payload);
    return {
      success: Array.isArray(data)
        ? true
        : (data as VibesApiResponse<Vibe[]>)?.success !== false,
      data: list,
      message:
        data && typeof data === 'object' && 'message' in data
          ? (data as VibesApiResponse<Vibe[]>).message
          : undefined,
    };
  } catch {
    return { success: false, data: [] };
  }
}

export async function postUserVibes(
  vibeIds: number[],
): Promise<VibesApiResponse<unknown>> {
  try {
    const { data } = await http.post<VibesApiResponse<unknown>>('user/vibes', {
      vibeIds,
    });
    // Match legacy: only treat an explicit `success: false` as failure.
    if (data?.success === false) {
      return { success: false, message: data.message ?? 'Failed to save vibes' };
    }
    return { success: true, data: data?.data, message: data?.message };
  } catch (error: unknown) {
    const message =
      error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data
            ?.message
        : undefined;
    return { success: false, message: message ?? 'Failed to save vibes' };
  }
}
