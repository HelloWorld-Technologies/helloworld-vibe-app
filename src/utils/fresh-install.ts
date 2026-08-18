import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';

const SANDBOX_MARKER = 'hw-sandbox-v1';

/** Keys from this app and the previous HelloWorld app that share the same bundle id. */
const LEFTOVER_AUTH_KEYS = ['hw-auth', 'token', 'mobile'];

function markerUri() {
  const cache = FileSystem.cacheDirectory;
  return cache ? `${cache}${SANDBOX_MARKER}` : null;
}

async function sandboxMarkerExists() {
  const uri = markerUri();
  if (!uri) {
    return (await AsyncStorage.getItem(SANDBOX_MARKER)) === '1';
  }

  const info = await FileSystem.getInfoAsync(uri);
  return info.exists;
}

async function writeSandboxMarker() {
  const uri = markerUri();
  if (!uri) {
    await AsyncStorage.setItem(SANDBOX_MARKER, '1');
    return;
  }

  await FileSystem.writeAsStringAsync(uri, '1');
}

/**
 * True on the first launch of a new app sandbox (reinstall, backup restore of
 * documents but not cache, or first run of vibe-app over the old HelloWorld app).
 * Cache is wiped on uninstall and is not part of Android/iCloud backup.
 */
export async function consumeFreshSandboxInstall() {
  if (await sandboxMarkerExists()) {
    return false;
  }

  await AsyncStorage.multiRemove(LEFTOVER_AUTH_KEYS);
  await writeSandboxMarker();
  return true;
}
