export function getDefaultTabRoute(isTenant: boolean) {
  return isTenant ? '/(tabs)/dashboard' : '/(tabs)/home';
}

/** Property browsing tab: Explore for tenants, Home for prospects. */
export function getExploreHomeRoute(isTenant: boolean) {
  return isTenant ? '/(tabs)/explore' : '/(tabs)/home';
}
