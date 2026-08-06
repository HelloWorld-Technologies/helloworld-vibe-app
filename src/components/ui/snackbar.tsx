import { HwSymbol } from '@/components/ui/hw-symbol';
import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Typography } from '@/components/ui/typography';
import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';

type SnackbarProps = {
  message: string;
  visible: boolean;
  onDismiss: () => void;
  durationMs?: number;
  /** Extra space above the home indicator / tab bar. */
  bottomOffset?: number;
};

export function Snackbar({
  message,
  visible,
  onDismiss,
  durationMs = 2800,
  bottomOffset = 72,
}: SnackbarProps) {
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(onDismiss, durationMs);
    return () => clearTimeout(timer);
  }, [durationMs, message, onDismiss, visible]);

  if (!visible || !message) return null;

  return (
    <View pointerEvents="box-none" style={styles.host}>
      <Animated.View
        entering={FadeInDown.duration(180)}
        exiting={FadeOutDown.duration(140)}
        style={[
          styles.snackbar,
          { bottom: Math.max(insets.bottom, 8) + bottomOffset },
        ]}>
        <Typography variant="text" size="sm" weight="medium" color={palette.white} style={styles.message}>
          {message}
        </Typography>
        <Pressable
          onPress={onDismiss}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Dismiss">
          <HwSymbol name="xmark" size={14} weight="bold" tintColor={palette.white} />
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    elevation: 1000,
  },
  snackbar: {
    position: 'absolute',
    left: 16,
    right: 16,
    backgroundColor: palette.gray[900],
    borderRadius: Radius.full,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 8,
  },
  message: {
    flex: 1,
  },
});
