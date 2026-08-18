import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { consumeFreshSandboxInstall } from '@/utils/fresh-install';

type AuthState = {
  token: string | null;
  mobile: string | null;
  selectedCity: string | null;
  selectedLocality: string | null;
  hydrated: boolean;
  setToken: (token: string | null) => void;
  setMobile: (mobile: string | null) => void;
  setSelectedCity: (city: string | null) => void;
  setSelectedLocality: (locality: string | null) => void;
  clearSession: () => void;
  setHydrated: (hydrated: boolean) => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      mobile: null,
      selectedCity: null,
      selectedLocality: null,
      hydrated: false,
      setToken: (token) => set({ token }),
      setMobile: (mobile) => set({ mobile }),
      setSelectedCity: (selectedCity) => set({ selectedCity, selectedLocality: null }),
      setSelectedLocality: (selectedLocality) => set({ selectedLocality }),
      clearSession: () => set({ token: null, mobile: null }),
      setHydrated: (hydrated) => set({ hydrated }),
    }),
    {
      name: 'hw-auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        token: state.token,
        mobile: state.mobile,
        selectedCity: state.selectedCity,
        selectedLocality: state.selectedLocality,
      }),
      onRehydrateStorage: () => () => {
        void (async () => {
          try {
            const isFreshInstall = await consumeFreshSandboxInstall();
            if (isFreshInstall) {
              useAuthStore.getState().clearSession();
            }
          } finally {
            useAuthStore.getState().setHydrated(true);
          }
        })();
      },
    },
  ),
);

export function useIsAuthenticated() {
  return useAuthStore((state) => Boolean(state.token));
}

export function useSelectedCity() {
  return useAuthStore((state) => state.selectedCity ?? 'Bangalore');
}

export function useSelectedLocality() {
  return useAuthStore((state) => state.selectedLocality);
}

export function useAuthHydrated() {
  return useAuthStore((state) => state.hydrated);
}
