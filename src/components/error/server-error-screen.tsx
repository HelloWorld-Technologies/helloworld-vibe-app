import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { HwSymbol } from '@/components/ui/hw-symbol';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Typography } from '@/components/ui/typography';
import { ErrorStateAssets, LogoAssets } from '@/constants/assets';
import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';
import { useIsTenant } from '@/stores/tenant-store';
import { getDefaultTabRoute } from '@/utils/tenant-routing';

const Logo = LogoAssets.helloWorld;

type ServerErrorScreenProps = {
  onRetry?: () => void;
  onHome?: () => void;
};

export function ServerErrorScreen({ onRetry, onHome }: ServerErrorScreenProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isTenant = useIsTenant();

  function handleHome() {
    if (onHome) {
      onHome();
      return;
    }
    router.replace(getDefaultTabRoute(isTenant));
  }

  function handleRetry() {
    if (onRetry) {
      onRetry();
      return;
    }
    if (router.canGoBack()) {
      router.back();
      return;
    }
    handleHome();
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Logo width={132} height={50} accessibilityLabel="HelloWorld" />
        <Pressable
          onPress={() => router.push('/menu')}
          style={styles.menuButton}
          accessibilityRole="button"
          accessibilityLabel="Open menu">
          <HwSymbol name="line.3.horizontal" size={18} tintColor={palette.gray[800]} />
        </Pressable>
      </View>
      <View style={styles.headerDivider} />

      <View style={styles.content}>
        <Image
          source={ErrorStateAssets.error500}
          style={styles.illustration}
          contentFit="contain"
          accessibilityIgnoresInvertColors
          accessibilityLabel="Server error illustration"
        />

        <View style={styles.badge}>
          <Typography variant="text" size="xs" weight="bold" color="#7A3E1D">
            Error 500 · Server Error
          </Typography>
        </View>

        <View style={styles.copy}>
          <Typography
            variant="text"
            size="xl"
            weight="bold"
            color={palette.gray[900]}
            style={styles.title}>
            We&apos;re Fixing Things Up!
          </Typography>
          <Typography
            variant="text"
            size="sm"
            color={palette.gray[600]}
            style={styles.description}>
            Looks like something broke on our end. Our team is already on it, and things
            should be back to normal soon.
          </Typography>
        </View>
      </View>

      <View style={[styles.actions, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
        <Pressable
          onPress={handleHome}
          style={({ pressed }) => [styles.secondaryButton, pressed && styles.secondaryPressed]}
          accessibilityRole="button"
          accessibilityLabel="Take Me Home">
          <Typography variant="text" size="md" weight="bold" color={palette.lime[800]}>
            Take Me Home
          </Typography>
        </Pressable>
        <Button label="Retry" onPress={handleRetry} style={styles.primaryButton} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: palette.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: palette.gray[200],
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    gap: 16,
  },
  illustration: {
    width: 220,
    height: 220,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: '#FCEEE6',
  },
  copy: {
    alignItems: 'center',
    gap: 8,
    maxWidth: 320,
  },
  title: {
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    lineHeight: 22,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  secondaryButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: Radius.sm,
    backgroundColor: palette.lime[50],
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  secondaryPressed: {
    backgroundColor: palette.lime[100],
  },
  primaryButton: {
    flex: 1,
  },
});
