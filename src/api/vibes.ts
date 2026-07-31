import { http } from '@/api/http';
import type { Vibe, VibesApiResponse } from '@/types/vibes';

function asVibeList(data: unknown): Vibe[] {
  if (!Array.isArray(data)) return [];
  return data.filter(
    (item): item is Vibe =>
      Boolean(item) &&
      typeof item === 'object' &&
      typeof (item as Vibe).id === 'number' &&
      typeof (item as Vibe).code === 'string' &&
      typeof (item as Vibe).display_name === 'string',
  );
}

export async function getVibesList(): Promise<VibesApiResponse<Vibe[]>> {
  try {
    const { data } = await http.get<VibesApiResponse<Vibe[]>>('vibes/list');
    return {
      success: Boolean(data?.success),
      data: asVibeList(data?.data),
      message: data?.message,
    };
  } catch {
    return { success: false, data: [] };
  }
}

export async function getUserVibes(): Promise<VibesApiResponse<Vibe[]>> {
  try {
    const { data } = await http.get<VibesApiResponse<Vibe[]>>('user/vibes');
    return {
      success: Boolean(data?.success),
      data: asVibeList(data?.data),
      message: data?.message,
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
    return data ?? { success: false };
  } catch (error: unknown) {
    const message =
      error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data
            ?.message
        : undefined;
    return { success: false, message: message ?? 'Failed to save vibes' };
  }
}
