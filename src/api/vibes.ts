import { http } from '@/api/http';
import { FALLBACK_API_VIBES } from '@/constants/vibes';
import type { Vibe, VibesApiResponse } from '@/types/vibes';

function asVibeList(data: unknown): Vibe[] {
  const source = Array.isArray(data)
    ? data
    : data && typeof data === 'object' && Array.isArray((data as { vibes?: unknown }).vibes)
      ? (data as { vibes: unknown[] }).vibes
      : data && typeof data === 'object' && Array.isArray((data as { list?: unknown }).list)
        ? (data as { list: unknown[] }).list
        : null;

  if (!source) return [];

  return source.flatMap((item) => {
    if (!item || typeof item !== 'object') return [];
    const record = item as Record<string, unknown>;
    const id = typeof record.id === 'number' ? record.id : Number(record.id);
    const code =
      typeof record.code === 'string'
        ? record.code
        : typeof record.slug === 'string'
          ? record.slug
          : typeof record.name === 'string'
            ? record.name
            : '';
    const displayName =
      typeof record.display_name === 'string'
        ? record.display_name
        : typeof record.displayName === 'string'
          ? record.displayName
          : typeof record.name === 'string'
            ? record.name
            : typeof record.label === 'string'
              ? record.label
              : '';
    // API returns string ids (e.g. "1"); Number("1") is valid.
    if (!Number.isFinite(id) || id <= 0 || !displayName) return [];
    return [{ id, code: code || displayName, display_name: displayName }];
  });
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
    const list = asVibeList(
      data && typeof data === 'object' && 'data' in data ? data.data : data,
    );
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
