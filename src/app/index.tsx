import { LinearGradient } from 'expo-linear-gradient';
import { usePathname, useRootNavigationState, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HwLottie } from '@/components/hw-lottie';
import { Typography } from '@/components/ui/typography';
import { LottieAssets } from '@/constants/assets';
import palette from '@/constants/palette';
import {
  SPLASH_GRADIENT,
  SPLASH_GRADIENT_END,
  SPLASH_GRADIENT_START,
} from '@/constants/splash';
import { useAuthHydrated, useAuthStore } from '@/stores/auth-store';
import { useTenantStore } from '@/stores/tenant-store';
import { consumePendingDeepLink } from '@/utils/pending-deep-link';
import { hrefFromHdpPath } from '@/utils/property-deep-link';
import { getDefaultTabRoute } from '@/utils/tenant-routing';

export default function SplashScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const rootNavigationState = useRootNavigationState();
  const hydrated = useAuthHydrated();
  const isAuthenticated = useAuthStore((state) => Boolean(state.token));
  const navigationReady = Boolean(rootNavigationState?.key);

  useEffect(() => {
    if (!hydrated || !navigationReady) return;
    if (pathname.startsWith('/hdp') && isAuthenticated) return;

    let cancelled = false;

    async function bootstrap() {
      if (!useAuthStore.getState().token) {
        router.replace('/login');
        return;
      }

      const pending = await consumePendingDeepLink();
      if (cancelled) return;
      if (pending) {
        router.replace(hrefFromHdpPath(pending));
        return;
      }

      await useTenantStore.getState().fetchProfile();
      if (cancelled) return;

      const isTenant = Boolean(useTenantStore.getState().profile?.bookingId);
      router.replace(getDefaultTabRoute(isTenant));
    }

    const timer = setTimeout(() => {
      void bootstrap();
    }, 2800);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [hydrated, isAuthenticated, navigationReady, pathname, router]);

  return (
    <LinearGradient
      colors={[...SPLASH_GRADIENT]}
      start={SPLASH_GRADIENT_START}
      end={SPLASH_GRADIENT_END}
      style={styles.gradient}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safe}>
        <View style={styles.content}>
          <View style={styles.logoWrap}>
            <HwLottie source={LottieAssets.loginLogo} style={styles.lottie} loop />
          </View>
          <Typography variant='heading' weight="medium" color={palette.white} style={styles.tagline}>
            Find your Vibe!
          </Typography>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safe: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 80,
  },
  logoWrap: {
    width: 280,
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lottie: {
    width: 280,
    height: 280,
  },
  tagline: {
    marginTop: -58,
    textAlign: 'center',
  },
});
