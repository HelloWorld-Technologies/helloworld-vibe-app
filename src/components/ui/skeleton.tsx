import { useEffect } from 'react';
import { StyleSheet, View, type DimensionValue, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';

type SkeletonProps = {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
};

/** Soft pulse bone — vibe-native loading placeholder. */
export function Skeleton({
  width = '100%',
  height = 16,
  borderRadius = Radius.sm,
  style,
}: SkeletonProps) {
  const opacity = useSharedValue(0.55);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.bone,
        { width, height, borderRadius },
        animatedStyle,
        style,
      ]}
    />
  );
}

type SkeletonBlockProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

/** Groups skeleton bones without animating each independently (shared layout only). */
export function SkeletonBlock({ children, style }: SkeletonBlockProps) {
  return <View style={style}>{children}</View>;
}

const styles = StyleSheet.create({
  bone: {
    backgroundColor: palette.gray[200],
  },
});
