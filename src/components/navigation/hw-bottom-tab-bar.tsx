import { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TabBarIcon } from '@/components/tab-bar-icon';
import { fontStyleForWeight } from '@/constants/fonts';
import palette from '@/constants/palette';
import {
  PROSPECT_TAB_ORDER,
  PROSPECT_TAB_ROUTES,
  TENANT_TAB_ORDER,
  TENANT_TAB_ROUTES,
  type ProspectTabRouteName,
  type TabBarIconName,
  type TenantTabRouteName,
} from '@/constants/tab-bar';

type TabRoute = { key: string; name: string; params?: object };

type HwBottomTabBarProps = {
  state: {
    index: number;
    routes: TabRoute[];
  };
  navigation: {
    emit: (event: {
      type: 'tabPress';
      target: string;
      canPreventDefault: true;
    }) => { defaultPrevented: boolean };
    navigate: (name: string, params?: object) => void;
    jumpTo?: (name: string, params?: object) => void;
  };
  isTenant?: boolean;
  /** Absolute floating pill (Android). */
  floating?: boolean;
};

const PILL_TIMING = { duration: 180, easing: Easing.out(Easing.cubic) };
const FLOATING_OUTER_PAD = 16;
const FLOATING_INNER_PAD = 8;
const DEFAULT_BAR_PAD = 8;
const ACTIVE_PILL_INSET = 0;

type TabMeta = {
  label: string;
  icon: TabBarIconName;
};

function getTabMeta(isTenant: boolean, name: string): TabMeta | null {
  if (isTenant && name in TENANT_TAB_ROUTES) {
    return TENANT_TAB_ROUTES[name as TenantTabRouteName];
  }
  if (!isTenant && name in PROSPECT_TAB_ROUTES) {
    return PROSPECT_TAB_ROUTES[name as ProspectTabRouteName];
  }
  return null;
}

export function HwBottomTabBar({
  state,
  navigation,
  isTenant = false,
  floating = false,
}: HwBottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const [barWidth, setBarWidth] = useState(0);
  const activeIndex = useSharedValue(0);

  const tabOrder = isTenant ? TENANT_TAB_ORDER : PROSPECT_TAB_ORDER;
  const visibleTabs = tabOrder
    .map((name) => {
      const route = state.routes.find((item) => item.name === name);
      const meta = getTabMeta(isTenant, name);
      if (!route || !meta) return null;
      return { route, meta };
    })
    .filter(Boolean) as { route: TabRoute; meta: TabMeta }[];

  const focusedName = state.routes[state.index]?.name;
  const focusedVisibleIndex = Math.max(
    0,
    visibleTabs.findIndex((tab) => tab.route.name === focusedName),
  );

  const barPad = floating ? FLOATING_INNER_PAD : DEFAULT_BAR_PAD;

  useEffect(() => {
    activeIndex.value = withTiming(focusedVisibleIndex, PILL_TIMING);
  }, [focusedVisibleIndex, activeIndex]);

  const pillAnimatedStyle = useAnimatedStyle(() => {
    const tabCount = visibleTabs.length;
    if (barWidth === 0 || tabCount === 0) {
      return { opacity: 0 };
    }

    const contentWidth = Math.max(barWidth - barPad * 2, 0);
    const tabWidth = contentWidth / tabCount;

    return {
      opacity: 1,
      width: tabWidth - ACTIVE_PILL_INSET * 2,
      transform: [
        {
          translateX: barPad + activeIndex.value * tabWidth + ACTIVE_PILL_INSET,
        },
      ],
    };
  });

  return (
    <View
      style={[
        styles.wrapper,
        floating ? styles.wrapperFloating : null,
        floating
          ? {
              paddingTop: FLOATING_OUTER_PAD,
              paddingHorizontal: FLOATING_OUTER_PAD,
              paddingBottom: FLOATING_OUTER_PAD + insets.bottom,
            }
          : { paddingBottom: Math.max(insets.bottom, 12) },
      ]}
      pointerEvents="box-none">
      {/* Elevation on an outer shell — overflow:hidden on the bar would clip Android shadows. */}
      <View style={floating ? styles.barElevation : null}>
        <View
          style={[styles.bar, floating ? styles.barFloating : null, { padding: barPad }]}
          onLayout={(event) => setBarWidth(event.nativeEvent.layout.width)}
          pointerEvents="auto">
          <Animated.View
            style={[styles.activePill, { top: barPad, bottom: barPad }, pillAnimatedStyle]}
            pointerEvents="none"
          />

          {visibleTabs.map(({ route, meta }) => {
            const isFocused = focusedName === route.name;

            function onPress() {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                if (typeof navigation.jumpTo === 'function') {
                  navigation.jumpTo(route.name, route.params);
                } else {
                  navigation.navigate(route.name, route.params);
                }
              }
            }

            const color = isFocused ? palette.lime[700] : palette.black;

            return (
              <Pressable
                key={route.key}
                onPress={onPress}
                style={[styles.tab, floating ? styles.tabFloating : null]}
                accessibilityRole="button"
                accessibilityState={{ selected: isFocused }}
                accessibilityLabel={meta.label}>
                <TabBarIcon name={meta.icon} size={22} color={color} />
                <Text style={[styles.label, { color }, isFocused && styles.labelActive]}>
                  {meta.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 16,
    paddingTop: 8,
    backgroundColor: palette.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: palette.gray[200],
  },
  wrapperFloating: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    paddingHorizontal: 0,
    paddingTop: 0,
    pointerEvents: 'box-none',
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: palette.gray[50],
    borderRadius: 999,
    position: 'relative',
  },
  barElevation: {
    borderRadius: 999,
    backgroundColor: palette.white,
    // Android shadow
    elevation: Platform.OS === 'android' ? 2 : 0,
  },
  barFloating: {
    backgroundColor: palette.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.gray[200],
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    padding: 8,
    minHeight: 56,
    zIndex: 1,
  },
  tabFloating: {
    minHeight: 0,
  },
  activePill: {
    position: 'absolute',
    left: 0,
    backgroundColor: palette.lime[50],
    borderRadius: 999,
  },
  label: {
    fontSize: 11,
    lineHeight: 14,
    ...fontStyleForWeight('medium'),
    textAlign: 'center',
  },
  labelActive: {
    ...fontStyleForWeight('bold'),
  },
});
