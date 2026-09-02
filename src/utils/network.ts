import type { NetInfoState } from '@react-native-community/netinfo';

/** True when the device has no usable internet connection. */
export function isNetworkOffline(state: NetInfoState): boolean {
  if (state.isConnected === false) return true;
  if (state.isInternetReachable === false) return true;
  return false;
}
