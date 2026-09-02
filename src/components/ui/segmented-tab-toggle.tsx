import { useCallback, useEffect, useRef } from 'react';
import {
  Pressable,
  StyleSheet,
  type LayoutChangeEvent,
  View,
  type ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { Typography } from '@/components/ui/typography';
import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';

export type SegmentedTabOption<T extends string> = {
  id: T;
  label: string;
};

type SegmentedTabToggleProps<T extends string> = {
  value: T;
  onChange: (tab: T) => void;
  tabs: SegmentedTabOption<T>[];
  style?: ViewStyle;
};

const TRACK_PADDING = 4;
const TRACK_GAP = 4;
const PILL_SPRING = { damping: 20, stiffness: 240, mass: 0.75 };

export function SegmentedTabToggle<T extends string>({
  value,
  onChange,
  tabs,
  style,
}: SegmentedTabToggleProps<T>) {
  const trackWidth = useSharedValue(0);
  const tabCount = tabs.length;
  const selectedIndex = Math.max(
    0,
    tabs.findIndex((tab) => tab.id === value),
  );
  const activeIndex = useSharedValue(selectedIndex);
  const hasLaidOut = useRef(false);

  useEffect(() => {
    if (!hasLaidOut.current) {
      activeIndex.value = selectedIndex;
      return;
    }

    activeIndex.value = withSpring(selectedIndex, PILL_SPRING);
  }, [activeIndex, selectedIndex]);

  const handleTrackLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const width = event.nativeEvent.layout.width;
      if (width <= 0) return;

      const wasZero = trackWidth.value === 0;
      const isFirstValidLayout = !hasLaidOut.current;
      trackWidth.value = width;

      if (isFirstValidLayout) {
        hasLaidOut.current = true;
      }

      // Snap on first layout (and when recovering from a 0-width pass) so the pill
      // is visible on first paint inside deferred layouts (e.g. SRP ScrollView).
      if (isFirstValidLayout || wasZero) {
        activeIndex.value = selectedIndex;
      }
    },
    [activeIndex, selectedIndex, trackWidth],
  );

  const pillAnimatedStyle = useAnimatedStyle(() => {
    const width = trackWidth.value;
    if (width <= 0 || tabCount === 0) {
      return { opacity: 0 };
    }

    const innerWidth = width - TRACK_PADDING * 2;
    const tabWidth = (innerWidth - TRACK_GAP * (tabCount - 1)) / tabCount;

    return {
      opacity: 1,
      width: tabWidth,
      transform: [
        {
          translateX: TRACK_PADDING + activeIndex.value * (tabWidth + TRACK_GAP),
        },
      ],
    };
  }, [tabCount]);

  return (
    <View
      style={[styles.track, style]}
      onLayout={handleTrackLayout}
      collapsable={false}>
      <Animated.View pointerEvents="none" style={[styles.activePill, pillAnimatedStyle]} />

      {tabs.map((tab) => {
        const active = tab.id === value;

        return (
          <Pressable
            key={tab.id}
            onPress={() => onChange(tab.id)}
            style={styles.tab}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}>
            <Typography
              variant="text"
              size="sm"
              weight="medium"
              color={active ? palette.gray[900] : palette.gray[500]}
              style={styles.tabLabel}>
              {tab.label}
            </Typography>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    backgroundColor: '#EEEEEE',
    borderRadius: Radius.full,
    padding: TRACK_PADDING,
    gap: TRACK_GAP,
    position: 'relative',
  },
  activePill: {
    position: 'absolute',
    top: TRACK_PADDING,
    bottom: TRACK_PADDING,
    left: 0,
    backgroundColor: palette.white,
    borderRadius: Radius.full,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: Radius.full,
    zIndex: 1,
  },
  tabLabel: {
    textAlign: 'center',
  },
});
