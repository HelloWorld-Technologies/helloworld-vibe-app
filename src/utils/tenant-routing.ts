import type { Href } from 'expo-router';

export function getDefaultTabName(isTenant: boolean) {
  return isTenant ? 'dashboard' : 'home';
}

export function getDefaultTabRoute(isTenant: boolean) {
  return isTenant ? '/(tabs)/dashboard' : '/(tabs)/home';
}

/** Property browsing tab: Explore for tenants, Home for prospects. */
export function getExploreHomeRoute(isTenant: boolean) {
  return isTenant ? '/(tabs)/explore' : '/(tabs)/home';
}

/**
 * My Visits is a root stack screen so it opens from Home, SRP, or HDP.
 * Navigating to `/(tabs)/my-visits` is ignored when already on a tab (Home).
 */
export function getMyVisitsRoute(_isTenant?: boolean): Href {
  return '/my-visits';
}
