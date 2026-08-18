import Constants from 'expo-constants';
import { Platform } from 'react-native';

export function getAppVersion() {
  return Constants.expoConfig?.version ?? Constants.nativeAppVersion ?? '1.0.0';
}

export function getAppBuild() {
  if (Platform.OS === 'ios') {
    return Constants.expoConfig?.ios?.buildNumber ?? Constants.nativeBuildVersion ?? '';
  }

  if (Platform.OS === 'android') {
    const versionCode = Constants.expoConfig?.android?.versionCode;
    if (versionCode != null) return String(versionCode);
    return Constants.nativeBuildVersion ?? '';
  }

  return Constants.nativeBuildVersion ?? '';
}

/** e.g. `v5.0.0 (151)` */
export function getAppVersionLabel() {
  const version = getAppVersion();
  const build = getAppBuild();
  return build ? `v${version} (${build})` : `v${version}`;
}
