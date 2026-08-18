import AsyncStorage from '@react-native-async-storage/async-storage';

import { isHdpHref } from '@/utils/property-deep-link';

const PENDING_DEEP_LINK_KEY = 'hw-pending-deep-link';

export async function savePendingDeepLink(href: string) {
  if (!isHdpHref(href)) return;
  try {
    await AsyncStorage.setItem(PENDING_DEEP_LINK_KEY, href);
  } catch {
    // Opening the property still works if the user is already signed in.
  }
}

export async function consumePendingDeepLink() {
  try {
    const href = await AsyncStorage.getItem(PENDING_DEEP_LINK_KEY);
    if (href) {
      await AsyncStorage.removeItem(PENDING_DEEP_LINK_KEY);
    }
    return href;
  } catch {
    return null;
  }
}

export async function clearPendingDeepLink() {
  try {
    await AsyncStorage.removeItem(PENDING_DEEP_LINK_KEY);
  } catch {
    // Ignore storage failures.
  }
}
