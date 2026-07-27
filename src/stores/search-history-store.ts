import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export const SEARCH_HISTORY_LIMIT = 5;

export type SearchHistoryLocalityItem = {
  type: 'locality';
  id: string;
  label: string;
  locality: string;
};

export type SearchHistoryPropertyItem = {
  type: 'property';
  id: string;
  label: string;
  propertyId: number;
  propertyName: string;
};

export type SearchHistoryItem = SearchHistoryLocalityItem | SearchHistoryPropertyItem;

type SearchHistoryState = {
  byCity: Record<string, SearchHistoryItem[]>;
  addSearch: (city: string, item: SearchHistoryItem) => void;
  clearCity: (city: string) => void;
};

function normalizeCity(city: string) {
  return city.trim().toLowerCase();
}

function upsertHistory(
  current: SearchHistoryItem[] | undefined,
  item: SearchHistoryItem,
): SearchHistoryItem[] {
  const existing = current ?? [];
  const withoutDuplicate = existing.filter((entry) => entry.id !== item.id);
  return [item, ...withoutDuplicate].slice(0, SEARCH_HISTORY_LIMIT);
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
    },
  ),
);

export function useSearchHistory(city: string): SearchHistoryItem[] {
  const key = normalizeCity(city);
  return useSearchHistoryStore((state) => state.byCity[key] ?? []);
}
