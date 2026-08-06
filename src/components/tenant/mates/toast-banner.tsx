import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { HwSymbol } from '@/components/ui/hw-symbol';
import { Typography } from '@/components/ui/typography';
import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';

type ToastBannerProps = {
  message: string;
  visible: boolean;
  onDismiss: () => void;
  durationMs?: number;
};

export function ToastBanner({ message, visible, onDismiss, durationMs = 4000 }: ToastBannerProps) {
  const [shown, setShown] = useState(visible);

  useEffect(() => {
    setShown(visible);
    if (!visible) return;
    const timer = setTimeout(() => {
      setShown(false);
      onDismiss();
    }, durationMs);
    return () => clearTimeout(timer);
  }, [durationMs, onDismiss, visible]);

  if (!shown) return null;

  return (
    <View style={styles.container}>
      <Typography variant="text" size="sm" color={palette.white} style={styles.message}>
        {message}
      </Typography>
      <Pressable onPress={onDismiss} hitSlop={8} accessibilityRole="button" accessibilityLabel="Dismiss">
        <HwSymbol name="xmark" size={14} tintColor={palette.white} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 96,
    backgroundColor: palette.gray[800],
    borderRadius: Radius.full,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  message: {
    flex: 1,
  },
});
