import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { getTenantProfile } from '@/api/user';
import { EMPTY_MOVE_IN_BACKGROUND } from '@/types/move-in-background';
import type { MoveInBackground } from '@/types/move-in-background';
import type { TenantProfile } from '@/types/tenant';
import { mergeBackgroundWithTenantProfile } from '@/utils/move-in-background';

type TenantState = {
  profile: TenantProfile | null;
  profileLoaded: boolean;
  moveInInterests: string[];
  moveInBackground: MoveInBackground;
  setProfile: (profile: TenantProfile | null) => void;
  setMoveInInterests: (interests: string[]) => void;
  setMoveInBackground: (background: MoveInBackground) => void;
  clearProfile: () => void;
  fetchProfile: () => Promise<void>;
};

export const useTenantStore = create<TenantState>()(
  persist(
    (set) => ({
      profile: null,
      profileLoaded: false,
      moveInInterests: [],
      moveInBackground: EMPTY_MOVE_IN_BACKGROUND,
      setProfile: (profile) => set({ profile, profileLoaded: true }),
      setMoveInInterests: (moveInInterests) => set({ moveInInterests }),
      setMoveInBackground: (moveInBackground) => set({ moveInBackground }),
      clearProfile: () =>
        set({
          profile: null,
          profileLoaded: false,
          moveInInterests: [],
          moveInBackground: EMPTY_MOVE_IN_BACKGROUND,
        }),
      fetchProfile: async () => {
        set({ profileLoaded: false });
        try {
          const data = await getTenantProfile();
          if (data?.status === 404 || !data?.bookingId) {
            set({ profile: null, profileLoaded: true });
            return;
          }

          set((state) => {
            const mergedBackground = mergeBackgroundWithTenantProfile(
              state.moveInBackground,
              data,
            );
            const shouldUpdateBackground =
              mergedBackground.college !== state.moveInBackground.college ||
              mergedBackground.workplace !== state.moveInBackground.workplace;

            return {
              profile: data,
              profileLoaded: true,
              ...(shouldUpdateBackground
                ? { moveInBackground: mergedBackground }
                : null),
            };
          });
        } catch {
          set({ profile: null, profileLoaded: true });
        }
      },
    }),
    {
      name: 'tenant-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        moveInInterests: state.moveInInterests,
        moveInBackground: state.moveInBackground,
      }),
    },
  ),
);

export function useTenantProfile() {
  return useTenantStore((state) => state.profile);
}

export function useIsTenant() {
  return useTenantStore((state) => Boolean(state.profile?.bookingId));
}

export function useTenantProfileLoaded() {
  return useTenantStore((state) => state.profileLoaded);
}
