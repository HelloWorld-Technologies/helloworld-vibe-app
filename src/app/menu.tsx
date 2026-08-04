import Constants from 'expo-constants';
import { useFocusEffect, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';

import { MenuSectionCard } from '@/components/menu/menu-section-card';
import { ProfileSummary } from '@/components/menu/profile-summary';
import { Typography } from '@/components/ui/typography';
import { buildTenantMenuSections, MENU_SECTIONS } from '@/constants/menu';
import palette from '@/constants/palette';
import { useBookingStatus } from '@/queries/use-booking-status';
import { useMoveInPaymentDetails } from '@/queries/use-move-in-payment-details';
import { queryClient } from '@/queries/query-client';
import { useAuthStore } from '@/stores/auth-store';
import {
  useIsTenant,
  useTenantProfile,
  useTenantStore,
} from '@/stores/tenant-store';
import {
  getMenuExternalUrl,
  getMenuRoute,
  isTabMenuRoute,
} from '@/utils/menu-navigation';
import { buildMoveInSteps, partitionMoveInSteps } from '@/utils/move-in-steps';

const APP_VERSION = Constants.expoConfig?.version ?? '1.0.0';

export default function MenuScreen() {
  const router = useRouter();
  const mobile = useAuthStore((state) => state.mobile) ?? '';
  const clearSession = useAuthStore((state) => state.clearSession);
  const isTenant = useIsTenant();
  const tenantProfile = useTenantProfile();
  const moveInInterests = useTenantStore((state) => state.moveInInterests);
  const moveInBackground = useTenantStore((state) => state.moveInBackground);
  const { data: bookingStatus } = useBookingStatus();
  const { data: moveInPayments } = useMoveInPaymentDetails();

  const propertyLabel = [tenantProfile?.propertyInfo?.address?.flatNo, tenantProfile?.propertyInfo?.name]
    .filter(Boolean)
    .join(' · ');

  const sections = useMemo(() => {
    if (!isTenant) {
      return MENU_SECTIONS;
    }

    if (!bookingStatus) {
      return buildTenantMenuSections(false);
    }

    const moveInSteps = buildMoveInSteps(
      bookingStatus,
      tenantProfile,
      moveInInterests,
      moveInBackground,
      moveInPayments?.finalAmount ?? null,
    );
    const { pending } = partitionMoveInSteps(moveInSteps);

    return buildTenantMenuSections(pending.length > 0);
  }, [
    bookingStatus,
    isTenant,
    moveInBackground,
    moveInInterests,
    moveInPayments?.finalAmount,
    tenantProfile,
  ]);

  useFocusEffect(
    useCallback(() => {
      if (!isTenant) {
        return;
      }

      void useTenantStore.getState().fetchProfile();
    }, [isTenant]),
  );

  const handleLogout = useCallback(() => {
    clearSession();
    useTenantStore.getState().clearProfile();
    queryClient.clear();
    router.replace('/login');
  }, [clearSession, router]);

  const openExternalUrl = useCallback(async (url: string) => {
    await WebBrowser.openBrowserAsync(url, {
      toolbarColor: palette.white,
      controlsColor: palette.black,
      showTitle: true,
      enableBarCollapsing: false,
    });
  }, []);

  const handleItemPress = useCallback(
    (itemId: string) => {
      if (itemId === 'logout') {
        handleLogout();
        return;
      }

      const externalUrl = getMenuExternalUrl(itemId);
      if (externalUrl) {
        void openExternalUrl(externalUrl);
        return;
      }

      const route = getMenuRoute(itemId, isTenant);
      if (!route) {
        return;
      }

      if (isTabMenuRoute(String(route))) {
        router.replace(route);
        return;
      }

      router.push(route);
    },
    [handleLogout, isTenant, openExternalUrl, router],
  );

  const sectionCards = useMemo(() => {
    let itemIndexOffset = 0;

    return sections.map((section, sectionIndex) => {
      const card = (
        <MenuSectionCard
          key={section.id}
          section={section}
          sectionIndex={sectionIndex}
          itemIndexOffset={itemIndexOffset}
          onItemPress={handleItemPress}
        />
      );

      itemIndexOffset += section.items.length;
      return card;
    });
  }, [handleItemPress, sections]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
          accessibilityRole="button"
          accessibilityLabel="Go back">
          <SymbolView
            name="chevron.left"
            size={18}
            weight="semibold"
            tintColor={palette.gray[800]}
          />
        </Pressable>
        <Typography variant="text" size="lg" weight="bold" style={styles.headerTitle}>
          Profile
        </Typography>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}>
        <Animated.View entering={FadeInDown.duration(220)}>
          <ProfileSummary
            mobile={mobile}
            name={isTenant ? tenantProfile?.userInfo?.name : undefined}
            propertyLabel={isTenant ? propertyLabel : undefined}
          />
        </Animated.View>

        {__DEV__ && !isTenant ? (
          <Pressable
            onPress={() => router.push('/component-showcase')}
            style={({ pressed }) => [styles.devLink, pressed && styles.devLinkPressed]}
            accessibilityRole="button">
            <Typography variant="text" size="sm" weight="medium" color={palette.blue[700]}>
              Component Showcase (dev)
            </Typography>
          </Pressable>
        ) : null}

        {sectionCards}

        <Text style={styles.footer}>
          V {APP_VERSION} | Made with <Text style={styles.heart}>❤️</Text> in Bengaluru
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: palette.gray[50],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  headerSpacer: {
    width: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: palette.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  backButtonPressed: {
    opacity: 0.85,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: palette.black,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 24,
  },
  devLink: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: palette.blue[50],
  },
  devLinkPressed: {
    opacity: 0.85,
  },
  footer: {
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 18,
    color: palette.gray[500],
    marginTop: 8,
  },
  heart: {
    color: palette.red[500],
  },
});
