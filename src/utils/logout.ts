import { useNavigation } from 'expo-router';
import { useCallback } from 'react';

import { queryClient } from '@/queries/query-client';
import { useAuthStore } from '@/stores/auth-store';
import { useTenantStore } from '@/stores/tenant-store';
import { resetRootRoute } from '@/utils/navigation-reset';

function clearAppSession() {
  useAuthStore.getState().clearSession();
  useTenantStore.getState().clearProfile();
  queryClient.clear();
}

/** Clears session state and resets the root stack to login so back cannot re-enter the app. */
export function logoutToLogin() {
  resetRootRoute('/login');
  clearAppSession();
}

/** Preferred logout from a screen — atomically replaces the root stack with login. */
export function useLogoutToLogin() {
  const navigation = useNavigation();

  return useCallback(() => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'login' }],
    });
    clearAppSession();
  }, [navigation]);
}
