import { http } from '@/api/http';
import type {
  LocalitySuggestResponse,
  SearchPropertyResult,
} from '@/types/search';

function parseLocalityNames(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];

  const names: string[] = [];
  for (const item of raw) {
    if (typeof item === 'string' && item.trim()) {
      names.push(item.trim());
      continue;
    }
    if (item && typeof item === 'object') {
      const record = item as Record<string, unknown>;
      const name =
        record.display_name ?? record.locality_name ?? record.name ?? record.locality;
      if (typeof name === 'string' && name.trim()) {
        names.push(name.trim());
      }
    }
  }

  return [...new Set(names)];
}

function parsePropertyResults(raw: unknown): SearchPropertyResult[] {
  if (!Array.isArray(raw)) return [];

  const properties: SearchPropertyResult[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const record = item as Record<string, unknown>;
    const id = Number(record.id ?? record.property_id ?? record.propertyId);
    const name = record.name ?? record.display_name ?? record.property_name;
    if (!Number.isFinite(id) || typeof name !== 'string' || !name.trim()) continue;
    properties.push({ id, name: name.trim() });
  }

  return properties;
}

export async function fetchLocalitySuggestions(params: {
  city: string;
  keyword: string;
}): Promise<LocalitySuggestResponse> {
  try {
    const { data } = await http.get<LocalitySuggestResponse>('/v3/locality/suggest', {
      params,
    });
    return {
      ...data,
      data: {
        locality: parseLocalityNames(data?.data?.locality),
        properties: parsePropertyResults(data?.data?.properties),
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Search failed';
    return { success: false, message };
  }
}
