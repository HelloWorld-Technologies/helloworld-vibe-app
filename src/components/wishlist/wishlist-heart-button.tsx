import { HwSymbol } from '@/components/ui/hw-symbol';
import { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import type { GestureResponderEvent } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';

import palette from '@/constants/palette';

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
      <HwSymbol
        name={isFavorite ? 'heart.fill' : 'heart'}
        size={size}
        tintColor={isFavorite ? activeColor : inactiveColor}
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
