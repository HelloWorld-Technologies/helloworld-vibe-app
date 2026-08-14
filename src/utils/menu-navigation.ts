import type { Href } from 'expo-router';

/** In-app routes opened from the profile menu for prospects (pre-tenant). */
export const PROSPECT_MENU_ROUTES: Partial<Record<string, Href>> = {
  'contact-us': '/(tabs)/contact',
  'my-visits': '/my-visits',
  'my-wishlist': '/my-wishlist',
  'community-events': '/community-events',
};

/** In-app routes opened from the profile menu for tenants. */
export const TENANT_MENU_ROUTES: Partial<Record<string, Href>> = {
  'move-in-steps': '/move-in-steps',
  'my-payments': '/(tabs)/payments',
  support: '/(tabs)/support',
  'my-visits': '/my-visits',
  'my-wishlist': '/my-wishlist',
  'community-events': '/community-events',
  'personal-details': '/profile/personal-details',
  'booking-details': '/profile/booking-details',
  'your-vibes': '/move-in-about-you?from=menu',
  'education-professional': '/move-in-background?from=menu',
  'bank-details': '/profile/bank-details',
  'emergency-contact': '/profile/emergency-contact',
  referral: '/profile/referral',
  'move-out': '/profile/move-out',
};

/** External pages opened in the system browser. */
export const MENU_EXTERNAL_URLS = {
  about: 'https://thehelloworld.com/about-us',
  'privacy-policy': 'https://thehelloworld.com/policy?header=false&footer=false',
  'tenancy-policy': 'https://thehelloworld.com/tenant-policy?header=false&footer=false',
  'for-homeowners': 'https://thehelloworld.com/owner',
  'helloworld-living': 'https://thehelloworld.com/about-us',
} as const;

export type MenuExternalUrlKey = keyof typeof MENU_EXTERNAL_URLS;

export function getMenuRoutes(isTenant: boolean) {
  return isTenant ? TENANT_MENU_ROUTES : PROSPECT_MENU_ROUTES;
}

export function getMenuExternalUrl(itemId: string) {
  return MENU_EXTERNAL_URLS[itemId as MenuExternalUrlKey] ?? null;
}

export function getMenuRoute(itemId: string, isTenant: boolean) {
  return getMenuRoutes(isTenant)[itemId] ?? null;
}

export function isTabMenuRoute(route: string) {
  return route.startsWith('/(tabs)/');
}
