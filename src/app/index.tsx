import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
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
import { useAuthHydrated, useIsAuthenticated } from '@/stores/auth-store';
import { useTenantStore } from '@/stores/tenant-store';
import { getDefaultTabRoute } from '@/utils/tenant-routing';

export default function SplashScreen() {
  const router = useRouter();
  const hydrated = useAuthHydrated();
  const isAuthenticated = useIsAuthenticated();

  useEffect(() => {
    if (!hydrated) return;

    let cancelled = false;

    async function bootstrap() {
      if (!isAuthenticated) {
        router.replace('/login');
        return;
      }

      await useTenantStore.getState().fetchProfile();
      if (cancelled) return;

      const isTenant = Boolean(useTenantStore.getState().profile?.bookingId);
      router.replace(getDefaultTabRoute(isTenant));
    }

    const timer = setTimeout(() => {
      bootstrap();
    }, 2800);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [hydrated, isAuthenticated, router]);

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
