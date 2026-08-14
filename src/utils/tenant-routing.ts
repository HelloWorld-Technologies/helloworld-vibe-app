import type { Href } from 'expo-router';

export function getDefaultTabRoute(isTenant: boolean) {
  return isTenant ? '/(tabs)/dashboard' : '/(tabs)/home';
}

/** Property browsing tab: Explore for tenants, Home for prospects. */
export function getExploreHomeRoute(isTenant: boolean) {
  return isTenant ? '/(tabs)/explore' : '/(tabs)/home';
}

/** Prospects land on the My Visits tab; tenants use the stack screen from the menu. */
export function getMyVisitsRoute(isTenant: boolean): Href {
  return isTenant ? '/my-visits' : '/(tabs)/my-visits';
}
