import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type SelectedVibesState = {
  selectedIds: string[];
  setSelectedIds: (ids: string[]) => void;
  clearSelectedIds: () => void;
};

export const useSelectedVibesStore = create<SelectedVibesState>()(
  persist(
    (set) => ({
      selectedIds: [],
      setSelectedIds: (selectedIds) => set({ selectedIds }),
      clearSelectedIds: () => set({ selectedIds: [] }),
    }),
    {
      name: 'hw-selected-vibes',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ selectedIds: state.selectedIds }),
    },
  ),
);

export function useSelectedVibeIds() {
  return useSelectedVibesStore((state) => state.selectedIds);
}

/** Chip ids from `mapVibesToListItems` are numeric API ids as strings. */
export function toVibeApiIds(selectedIds: readonly string[]): number[] {
  const ids: number[] = [];
  const seen = new Set<number>();

  for (const raw of selectedIds) {
    const id = Number(raw);
    if (!Number.isFinite(id) || id <= 0 || seen.has(id)) continue;
    seen.add(id);
    ids.push(id);
  }

  return ids;
}
