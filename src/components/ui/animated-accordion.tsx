import { useEffect, useState, type ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const EXPAND_MS = 280;
const CHEVRON_MS = 220;

type AnimatedAccordionContentProps = {
  expanded: boolean;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function AnimatedAccordionContent({
  expanded,
  children,
  style,
}: AnimatedAccordionContentProps) {
  const [measuredHeight, setMeasuredHeight] = useState(0);
  const expandProgress = useSharedValue(expanded ? 1 : 0);
  const contentHeight = useSharedValue(0);

  useEffect(() => {
    expandProgress.value = withTiming(expanded ? 1 : 0, {
      duration: EXPAND_MS,
      easing: Easing.out(Easing.cubic),
    });
  }, [expandProgress, expanded]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: contentHeight.value > 0 ? contentHeight.value * expandProgress.value : 0,
    opacity: interpolate(expandProgress.value, [0, 0.35, 1], [0, 0.7, 1]),
    overflow: 'hidden' as const,
  }));

  function handleLayout(height: number) {
    const nextHeight = Math.ceil(height);
    if (nextHeight <= 0) return;
    contentHeight.value = nextHeight;
    if (measuredHeight === 0) {
      expandProgress.value = expanded ? 1 : 0;
    }
    if (nextHeight !== measuredHeight) {
      setMeasuredHeight(nextHeight);
    }
  }

  if (!expanded && measuredHeight === 0) {
    return null;
  }

  if (expanded && measuredHeight === 0) {
    return (
      <View
        collapsable={false}
        style={style}
        onLayout={(event) => handleLayout(event.nativeEvent.layout.height)}>
        {children}
      </View>
    );
  }

  return (
    <Animated.View style={[animatedStyle, style]}>
      <View
        collapsable={false}
        onLayout={(event) => handleLayout(event.nativeEvent.layout.height)}>
        {children}
      </View>
    </Animated.View>
  );
}

export function useAnimatedChevronRotation(
  expanded: boolean,
  collapsedDeg = 0,
  expandedDeg = 180,
) {
  const rotation = useSharedValue(expanded ? expandedDeg : collapsedDeg);

  useEffect(() => {
    rotation.value = withTiming(expanded ? expandedDeg : collapsedDeg, {
      duration: CHEVRON_MS,
      easing: Easing.out(Easing.cubic),
    });
  }, [collapsedDeg, expanded, expandedDeg, rotation]);

  return useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));
}
