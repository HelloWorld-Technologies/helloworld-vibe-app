import { useEffect, type ReactNode } from 'react';
import { StyleSheet, View, type LayoutChangeEvent, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { UiIcons } from '@/constants/assets';
import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';

/** Shared card layout for stacked accordion items (FAQ, policies, etc.). */
export const accordionStyles = StyleSheet.create({
  list: {
    gap: 8,
  },
  item: {
    backgroundColor: palette.white,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: palette.gray[200],
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: {
    flex: 1,
    color: palette.gray[900],
  },
  bodyContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    lineHeight: 22,
  },
  measure: {
    position: 'absolute',
    left: 0,
    right: 0,
    opacity: 0,
    zIndex: -1,
  },
});

const ChevronDownIcon = UiIcons.chevronDown;

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

  function handleMeasure(event: LayoutChangeEvent) {
    const nextHeight = Math.ceil(event.nativeEvent.layout.height);
    if (nextHeight > 0) {
      contentHeight.value = nextHeight;
    }
  }

  return (
    <View>
      <View
        accessible={false}
        importantForAccessibility="no-hide-descendants"
        collapsable={false}
        pointerEvents="none"
        style={[style, accordionStyles.measure]}
        onLayout={handleMeasure}>
        {children}
      </View>
      <Animated.View style={[animatedStyle, style]}>{children}</Animated.View>
    </View>
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

type AccordionChevronProps = {
  expanded: boolean;
  color?: string;
  collapsedDeg?: number;
  expandedDeg?: number;
};

export function AccordionChevron({
  expanded,
  color = '#323232',
  collapsedDeg = 0,
  expandedDeg = 180,
}: AccordionChevronProps) {
  const chevronStyle = useAnimatedChevronRotation(expanded, collapsedDeg, expandedDeg);

  return (
    <Animated.View style={chevronStyle}>
      <ChevronDownIcon width={14} height={7} color={color} />
    </Animated.View>
  );
}
