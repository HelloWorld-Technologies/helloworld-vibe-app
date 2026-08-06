import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  ZoomIn,
} from 'react-native-reanimated';
import { HwSymbol } from '@/components/ui/hw-symbol';
import { fontStyleForWeight } from '@/constants/fonts';
import palette from '@/constants/palette';
import { VIBE_CHIP_GRADIENT } from '@/constants/vibes';
import { Radius } from '@/constants/theme';

export type VibeChipVariant = 'onDark' | 'onLight';

type VibeChipProps = {
  label: string;
  emoji: string;
  selected: boolean;
  onPress: () => void;
  variant?: VibeChipVariant;
};

function CheckBadge() {
  return (
    <View style={styles.checkBadge}>
      <HwSymbol name="checkmark" size={9} weight="bold" tintColor={palette.white} />
    </View>
  );
}

export function VibeChip({
  label,
  emoji,
  selected,
  onPress,
  variant = 'onDark',
}: VibeChipProps) {
  const scale = useSharedValue(1);
  const didMountRef = useRef(false);
  const labelColor =
    selected || variant === 'onLight' ? palette.gray[800] : palette.gray[200];

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }

    scale.value = withSequence(
      withSpring(selected ? 1.07 : 0.95, {
        damping: 11,
        stiffness: 380,
        mass: 0.6,
      }),
      withSpring(1, {
        damping: 14,
        stiffness: 280,
        mass: 0.7,
      }),
    );
  }, [scale, selected]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const content = (
    <View
      style={[
        styles.inner,
        selected ? styles.innerSelected : variant === 'onDark' ? styles.innerDark : styles.innerLight,
      ]}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
      {selected ? (
        <Animated.View entering={ZoomIn.duration(180).springify()}>
          <CheckBadge />
        </Animated.View>
      ) : null}
    </View>
  );

  return (
    <Animated.View style={animatedStyle}>
      {selected ? (
        <Pressable
          onPress={onPress}
          accessibilityRole="button"
          accessibilityState={{ selected: true }}
          accessibilityLabel={`${label}, selected`}
          style={({ pressed }) => pressed && styles.pressed}>
          <LinearGradient
            colors={[...VIBE_CHIP_GRADIENT]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.gradientBorder}>
            {content}
          </LinearGradient>
        </Pressable>
      ) : (
        <Pressable
          onPress={onPress}
          accessibilityRole="button"
          accessibilityState={{ selected: false }}
          accessibilityLabel={label}
          style={({ pressed }) => [
            styles.chip,
            variant === 'onDark' ? styles.chipDark : styles.chipLight,
            pressed && styles.pressed,
          ]}>
          {content}
        </Pressable>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  gradientBorder: {
    borderRadius: Radius.full,
    padding: 1.5,
  },
  chip: {
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  chipDark: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderColor: 'rgba(255,255,255,0.15)',
  },
  chipLight: {
    backgroundColor: palette.white,
    borderColor: palette.gray[300],
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: Radius.full,
  },
  innerSelected: {
    backgroundColor: palette.white,
  },
  innerDark: {
    backgroundColor: 'transparent',
  },
  innerLight: {
    backgroundColor: palette.white,
  },
  emoji: {
    fontSize: 16,
    lineHeight: 20,
  },
  label: {
    fontSize: 14,
    lineHeight: 20,
    ...fontStyleForWeight('medium'),
  },
  checkBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: palette.lime[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.88,
  },
});
