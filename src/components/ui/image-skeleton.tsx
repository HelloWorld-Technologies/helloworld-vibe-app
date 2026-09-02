import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  type DimensionValue,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import palette from '@/constants/palette';

/** Neutral gray base — matches surfaceDisabled / card placeholders. */
const BASE_GRADIENT = [palette.gray[200], palette.gray[100], palette.gray[200]] as const;

/** Soft lime sweep — helloLime family at low opacity for brand shimmer. */
const SHIMMER_GRADIENT = [
  'transparent',
  `${palette.lime[50]}B3`,
  `${palette.lime[100]}80`,
  `${palette.lime[50]}B3`,
  'transparent',
] as const;

type ImageSkeletonProps = {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
};

/** Gradient shimmer placeholder for remote images — HW vibe lime on gray. */
export function ImageSkeleton({
  width = '100%',
  height = '100%',
  borderRadius = 0,
  style,
}: ImageSkeletonProps) {
  const [layoutWidth, setLayoutWidth] = useState(0);
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.ease) }),
      -1,
      false,
    );
  }, [progress]);

  const onLayout = (event: LayoutChangeEvent) => {
    setLayoutWidth(event.nativeEvent.layout.width);
  };

  const shimmerBandWidth = layoutWidth > 0 ? layoutWidth * 0.55 : 0;

  const shimmerStyle = useAnimatedStyle(() => {
    if (shimmerBandWidth <= 0) {
      return { opacity: 0 };
    }

    return {
      opacity: 1,
      transform: [
        {
          translateX: interpolate(
            progress.value,
            [0, 1],
            [-shimmerBandWidth, layoutWidth + shimmerBandWidth],
          ),
        },
      ],
    };
  }, [layoutWidth, shimmerBandWidth]);

  return (
    <View
      style={[{ width, height, borderRadius, overflow: 'hidden' }, style]}
      onLayout={onLayout}>
      <LinearGradient
        colors={[...BASE_GRADIENT]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {shimmerBandWidth > 0 ? (
        <Animated.View
          style={[styles.shimmerBand, { width: shimmerBandWidth }, shimmerStyle]}>
          <LinearGradient
            colors={[...SHIMMER_GRADIENT]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  shimmerBand: {
    ...StyleSheet.absoluteFillObject,
    height: '100%',
  },
});
