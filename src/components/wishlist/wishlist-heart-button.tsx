import { HwSymbol } from '@/components/ui/hw-symbol';
import { useEffect, useRef } from 'react';
import { Platform, Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import type { GestureResponderEvent } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import palette from '@/constants/palette';

const HEART_PATH =
  'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z';

function HeartGlyph({
  filled,
  size,
  color,
}: {
  filled: boolean;
  size: number;
  color: string;
}) {
  if (Platform.OS === 'ios') {
    return (
      <HwSymbol
        name={filled ? 'heart.fill' : 'heart'}
        size={size}
        tintColor={color}
      />
    );
  }

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d={HEART_PATH}
        fill={filled ? color : 'none'}
        stroke={color}
        strokeWidth={filled ? 0 : 1.8}
      />
    </Svg>
  );
}

type WishlistHeartButtonProps = {
  isFavorite: boolean;
  onPress?: () => void;
  size?: number;
  inactiveColor?: string;
  activeColor?: string;
  hitSlop?: number;
  style?: StyleProp<ViewStyle>;
  stopPropagation?: boolean;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function WishlistHeartButton({
  isFavorite,
  onPress,
  size = 20,
  inactiveColor = palette.gray[800],
  activeColor = palette.red[500],
  hitSlop = 8,
  style,
  stopPropagation = false,
}: WishlistHeartButtonProps) {
  const scale = useSharedValue(1);
  const didMountRef = useRef(false);

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }

    scale.value = withSequence(
      withSpring(isFavorite ? 1.34 : 0.88, {
        damping: 9,
        stiffness: 360,
        mass: 0.55,
      }),
      withSpring(1, {
        damping: 14,
        stiffness: 280,
        mass: 0.7,
      }),
    );
  }, [isFavorite, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  function handlePress(event: GestureResponderEvent) {
    if (stopPropagation) {
      event.stopPropagation();
    }

    onPress?.();
  }

  return (
    <AnimatedPressable
      onPress={handlePress}
      hitSlop={hitSlop}
      style={[styles.button, style, animatedStyle]}
      accessibilityRole="button"
      accessibilityLabel={isFavorite ? 'Remove from wishlist' : 'Add to wishlist'}
      accessibilityState={{ selected: isFavorite }}>
      <HeartGlyph
        filled={isFavorite}
        size={size}
        color={isFavorite ? activeColor : inactiveColor}
      />
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
