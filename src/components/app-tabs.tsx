import { Tabs } from 'expo-router';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { Platform, StyleSheet } from 'react-native';
import type { SFSymbol } from 'sf-symbols-typescript';

import { HwBottomTabBar } from '@/components/navigation/hw-bottom-tab-bar';
import palette from '@/constants/palette';
import {
  PROSPECT_TAB_ORDER,
  PROSPECT_TAB_ROUTES,
  TENANT_TAB_ORDER,
  TENANT_TAB_ROUTES,
  type ProspectTabRouteName,
  type TenantTabRouteName,
} from '@/constants/tab-bar';
import { useIsTablet } from '@/hooks/use-is-tablet';
import { useIsTenant } from '@/stores/tenant-store';
import { getDefaultTabName } from '@/utils/tenant-routing';

const PROSPECT_TAB_ICONS = {
  home: {
    sf: { default: 'house', selected: 'house.fill' },
    md: { default: 'home', selected: 'home' },
  },
  'my-visits': {
    sf: { default: 'calendar', selected: 'calendar' },
    md: { default: 'event', selected: 'event' },
  },
  wishlist: {
    sf: { default: 'heart', selected: 'heart.fill' },
    md: { default: 'favorite_border', selected: 'favorite' },
  },
  contact: {
    sf: { default: 'headphones', selected: 'headphones' },
    md: { default: 'headset_mic', selected: 'headset_mic' },
  },
} as const satisfies Record<
  ProspectTabRouteName,
  {
    sf: { default: SFSymbol; selected: SFSymbol };
    md: { default: string; selected: string };
  }
>;

const TENANT_TAB_ICONS = {
  dashboard: {
    sf: { default: 'square.grid.2x2', selected: 'square.grid.2x2.fill' },
    md: { default: 'dashboard', selected: 'dashboard' },
  },
  explore: {
    sf: { default: 'building.2', selected: 'building.2.fill' },
    md: { default: 'apartment', selected: 'apartment' },
  },
  payments: {
    sf: { default: 'creditcard', selected: 'creditcard.fill' },
    md: { default: 'payments', selected: 'payments' },
  },
  support: {
    sf: { default: 'headphones', selected: 'headphones' },
    md: { default: 'headset_mic', selected: 'headset_mic' },
  },
} as const satisfies Record<
  TenantTabRouteName,
  {
    sf: { default: SFSymbol; selected: SFSymbol };
    md: { default: string; selected: string };
  }
>;

/** Active tab: icon/label #4C7B0C, indicator/pill #F7FEE7 */
const nativeTabStyle = {
  tintColor: palette.lime[700],
  iconColor: { default: palette.black, selected: palette.lime[700] },
  indicatorColor: palette.lime[50],
  labelStyle: {
    default: { color: palette.black, fontSize: 11 },
    selected: { color: palette.lime[700], fontSize: 11 },
  },
} as const;

function NativeAppTabs({ isTenant }: { isTenant: boolean }) {
  if (isTenant) {
    return (
      <NativeTabs {...nativeTabStyle}>
        {TENANT_TAB_ORDER.map((name) => {
          const meta = TENANT_TAB_ROUTES[name];
          const icons = TENANT_TAB_ICONS[name];

          return (
            <NativeTabs.Trigger key={name} name={name}>
              <NativeTabs.Trigger.Label>{meta.label}</NativeTabs.Trigger.Label>
              <NativeTabs.Trigger.Icon sf={icons.sf} md={icons.md} />
            </NativeTabs.Trigger>
          );
        })}
      </NativeTabs>
    );
  }

  return (
    <NativeTabs {...nativeTabStyle}>
      {PROSPECT_TAB_ORDER.map((name) => {
        const meta = PROSPECT_TAB_ROUTES[name];
        const icons = PROSPECT_TAB_ICONS[name];

        return (
          <NativeTabs.Trigger
            key={name}
            name={name}
            disableTransparentOnScrollEdge={name === 'home'}>
            <NativeTabs.Trigger.Label>{meta.label}</NativeTabs.Trigger.Label>
            <NativeTabs.Trigger.Icon sf={icons.sf} md={icons.md} />
          </NativeTabs.Trigger>
        );
      })}
    </NativeTabs>
  );
}

function CustomAppTabs({
  isTenant,
  floating,
}: {
  isTenant: boolean;
  floating: boolean;
}) {
  const visibleTabs = new Set<string>(isTenant ? TENANT_TAB_ORDER : PROSPECT_TAB_ORDER);
  const initialRouteName = getDefaultTabName(isTenant);
  // Visible tabs first so the default/first route matches the role. Otherwise
  // Android back can land on prospect `home` while the tenant bar shows Dashboard.
  const tabScreenOrder = isTenant
    ? [...TENANT_TAB_ORDER, ...PROSPECT_TAB_ORDER]
    : [...PROSPECT_TAB_ORDER, ...TENANT_TAB_ORDER];

  return (
    <Tabs
      key={isTenant ? 'tenant' : 'prospect'}
      initialRouteName={initialRouteName}
      backBehavior="history"
      tabBar={(props) => (
        <HwBottomTabBar {...props} isTenant={isTenant} floating={floating} />
      )}
      screenOptions={{
        headerShown: false,
        freezeOnBlur: false,
        animation: 'none',
        detachInactiveScreens: false,
        sceneStyle: { backgroundColor: palette.white },
        tabBarStyle: floating
          ? {
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'transparent',
              borderTopWidth: 0,
              elevation: 0,
              shadowOpacity: 0,
            }
          : {
              backgroundColor: palette.white,
              borderTopWidth: StyleSheet.hairlineWidth,
              borderTopColor: palette.gray[200],
              elevation: 0,
              shadowOpacity: 0,
            },
      }}>
      {tabScreenOrder.map((name) => {
        const isVisible = visibleTabs.has(name);

        return (
          <Tabs.Screen
            key={name}
            name={name}
            options={{
              href: isVisible ? undefined : null,
              // Pre-mount visible tabs so switching is instant; keep others lazy.
              lazy: !isVisible,
            }}
          />
        );
      })}
    </Tabs>
  );
}

export default function AppTabs() {
  const isTenant = useIsTenant();
  const isTablet = useIsTablet();

  // NativeTabs stays translucent on iPad — use a solid custom bar on tablet.
  if (Platform.OS === 'ios' && !isTablet) {
    return <NativeAppTabs isTenant={isTenant} />;
  }

  return <CustomAppTabs isTenant={isTenant} floating={Platform.OS === 'android' && !isTablet} />;
}
