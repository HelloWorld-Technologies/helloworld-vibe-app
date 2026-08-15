import type { ReactNode } from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';

type ParallaxLayerProps = {
  animationValue: SharedValue<number>;
  children: ReactNode;
  offset?: number;
  style?: StyleProp<ViewStyle>;
};

export function ParallaxLayer({
  animationValue,
  children,
  offset = 36,
  style,
}: ParallaxLayerProps) {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          animationValue.value,
          [-1, 0, 1],
          [-offset, 0, offset],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

  return (
    <Animated.View style={[styles.clip, style]}>
      <Animated.View style={[styles.fill, animatedStyle]}>{children}</Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  clip: {
    overflow: 'hidden',
    width: '100%',
    height: '100%',
  },
  fill: {
    width: '100%',
    height: '100%',
  },
});
