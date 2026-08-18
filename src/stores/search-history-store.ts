import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { SearchHistoryItem } from '@/types/search';

export const SEARCH_HISTORY_LIMIT = 5;

type SearchHistoryState = {
  byCity: Record<string, SearchHistoryItem[]>;
  addSearch: (city: string, item: SearchHistoryItem) => void;
  clearCity: (city: string) => void;
};

function normalizeCity(city: string) {
  return city.trim().toLowerCase();
}

export function normalizeSearchHistoryItem(value: unknown): SearchHistoryItem | null {
  if (typeof value === 'string') {
    const locality = value.trim();
    if (!locality) return null;
    return {
      type: 'locality',
      id: `locality:${locality.toLowerCase()}`,
      label: locality,
      locality,
    };
  }

  if (!value || typeof value !== 'object') return null;
  const record = value as Record<string, unknown>;
  const label = typeof record.label === 'string' ? record.label.trim() : '';
  const locality =
    typeof record.locality === 'string' ? record.locality.trim() : label;
  const propertyId = Number(record.propertyId);
  const isProperty =
    record.type === 'property' || (Number.isFinite(propertyId) && propertyId > 0);

  if (isProperty) {
    const propertyName =
      (typeof record.propertyName === 'string' && record.propertyName.trim()) || label;
    if (!Number.isFinite(propertyId) || propertyId <= 0 || !propertyName) return null;
    return {
      type: 'property',
      id: typeof record.id === 'string' && record.id ? record.id : `property:${propertyId}`,
      label: propertyName,
      propertyId,
      propertyName,
    };
  }

  if (!locality) return null;
  return {
    type: 'locality',
    id: typeof record.id === 'string' && record.id ? record.id : `locality:${locality.toLowerCase()}`,
    label: locality,
    locality,
  };
}

function upsertHistory(
  current: SearchHistoryItem[] | undefined,
  item: SearchHistoryItem,
): SearchHistoryItem[] {
  const nextItem = normalizeSearchHistoryItem(item);
  if (!nextItem) return current ?? [];
  const existing = (current ?? [])
    .map(normalizeSearchHistoryItem)
    .filter((entry): entry is SearchHistoryItem => entry != null);
  const withoutDuplicate = existing.filter((entry) => entry.id !== nextItem.id);
  return [nextItem, ...withoutDuplicate].slice(0, SEARCH_HISTORY_LIMIT);
}

function normalizeCityHistory(items: unknown): SearchHistoryItem[] {
  if (!Array.isArray(items)) return [];
  return items
    .map(normalizeSearchHistoryItem)
    .filter((item): item is SearchHistoryItem => item != null);
}

export const useSearchHistoryStore = create<SearchHistoryState>()(
  persist(
    (set) => ({
      byCity: {},
      addSearch: (city, item) => {
        const key = normalizeCity(city);
        if (!key) return;

        set((state) => ({
          byCity: {
            ...state.byCity,
            [key]: upsertHistory(state.byCity[key], item),
          },
        }));
      },
      clearCity: (city) => {
        const key = normalizeCity(city);
        set((state) => {
          if (!state.byCity[key]) return state;
          const next = { ...state.byCity };
          delete next[key];
          return { byCity: next };
        });
      },
    }),
    {
      name: 'hw-search-history',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ byCity: state.byCity }),
      merge: (persisted, current) => {
        const stored = persisted as Partial<SearchHistoryState> | undefined;
        const byCity = Object.fromEntries(
          Object.entries(stored?.byCity ?? {}).map(([city, items]) => [
            city,
            normalizeCityHistory(items),
          ]),
        );
        return {
          ...current,
          ...stored,
          byCity,
        };
      },
    },
  ),
);

const EMPTY_HISTORY: SearchHistoryItem[] = [];

export function useSearchHistory(city: string): SearchHistoryItem[] {
  const key = normalizeCity(city);
  return useSearchHistoryStore((state) => state.byCity[key] ?? EMPTY_HISTORY);
}
