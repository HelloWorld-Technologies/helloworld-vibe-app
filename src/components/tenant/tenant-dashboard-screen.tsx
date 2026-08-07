import { useQueryClient } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getPropertyManagerByBookingId } from '@/api/user';
import { DashboardIcon } from '@/components/dashboard/dashboard-icon';
import { DashboardEventsSection } from '@/components/tenant/dashboard/dashboard-events-section';
import { DashboardMoveInPendingPaymentCard } from '@/components/tenant/dashboard/dashboard-move-in-pending-payment-card';
import {
  DashboardMoveInStepsCard,
  useMoveInDashboardCard,
} from '@/components/tenant/dashboard/dashboard-move-in-steps-card';
import { DashboardPmCard } from '@/components/tenant/dashboard/dashboard-pm-card';
import { DashboardQuickActions } from '@/components/tenant/dashboard/dashboard-quick-actions';
import { DashboardReferralCard } from '@/components/tenant/dashboard/dashboard-referral-card';
import { DashboardRentCard } from '@/components/tenant/dashboard/dashboard-rent-card';
import { DashboardSmartMeterCard } from '@/components/tenant/dashboard/dashboard-smart-meter-card';
import { DashboardSupportPreview } from '@/components/tenant/dashboard/dashboard-support-preview';
import { RaiseRequestSheet } from '@/components/tenant/raise-request-sheet';
import { RatingAndReviewSheet } from '@/components/tenant/rating-and-review-sheet';
import { Snackbar } from '@/components/ui/snackbar';
import { Typography } from '@/components/ui/typography';
import {
  DASHBOARD_HEADER_GRADIENT,
  DASHBOARD_SECTION_GAP,
  DASHBOARD_SHEET_OVERLAP,
  DASHBOARD_SHEET_RADIUS,
} from '@/constants/dashboard';
import palette from '@/constants/palette';
import { TAB_BAR_HEIGHT, TAB_SCREEN_EXTRA_PADDING } from '@/constants/tab-bar';
import { Radius } from '@/constants/theme';
import { useInvoicePayment } from '@/hooks/use-invoice-payment';
import { useMoveInPayment } from '@/hooks/use-move-in-payment';
import { useRaiseSupportRequest } from '@/hooks/use-raise-support-request';
import { useTabBarInset } from '@/hooks/use-tab-bar-inset';
import { queryKeys } from '@/queries/keys';
import { useBookingStatus } from '@/queries/use-booking-status';
import { useUpcomingEvents } from '@/queries/use-events';
import { useMoveInPaymentDetails } from '@/queries/use-move-in-payment-details';
import { usePendingReviews } from '@/queries/use-pending-reviews';
import { useDashboardSupportTickets } from '@/queries/use-support-tickets';
import { useTenantInvoices } from '@/queries/use-tenant-invoices';
import { useTenantProfile, useTenantStore } from '@/stores/tenant-store';
import {
  getMoveInPendingAmount,
  shouldShowMoveInPendingPaymentCard,
} from '@/utils/move-in-payment';

export function TenantDashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const tabBarInset = useTabBarInset();
  const queryClient = useQueryClient();
  const { payInvoice } = useInvoicePayment();
  const { startMoveInPayment } = useMoveInPayment();
  const profile = useTenantProfile();
  const { data: bookingStatus, refetch: refetchBookingStatus } = useBookingStatus();
  const { data: invoices, isLoading: invoicesLoading, refetch: refetchInvoices } = useTenantInvoices();
  const { data: tickets, refetch: refetchTickets } = useDashboardSupportTickets();
  const { data: events, isLoading: eventsLoading, refetch: refetchEvents } = useUpcomingEvents();
  const {
    data: pendingReviews,
    refetch: refetchPendingReviews,
  } = usePendingReviews();
  const {
    data: moveInPayments,
    refetch: refetchMoveInPayments,
  } = useMoveInPaymentDetails();
  const { sheetVisible, openRaiseRequest, closeRaiseRequest, submitRaiseRequest } =
    useRaiseSupportRequest();
  const [copySnackbarVisible, setCopySnackbarVisible] = useState(false);
  const dismissCopySnackbar = useCallback(() => {
    setCopySnackbarVisible(false);
  }, []);
  const [refreshing, setRefreshing] = useState(false);
  const [pmName, setPmName] = useState(profile?.propertyInfo?.propertyManager?.name ?? '');
  const [pmPhone, setPmPhone] = useState(profile?.propertyInfo?.propertyManager?.mobile ?? '');
  const [pmPhoto, setPmPhoto] = useState<string | null>(null);

  const nextPending = invoices?.pending?.[0];
  const propertyLabel = [profile?.propertyInfo?.address?.flatNo, profile?.propertyInfo?.name]
    .filter(Boolean)
    .join(' · ');
  const creditInfo = profile?.creditInfo;
  const rentAmount = nextPending?.balance ?? profile?.paymentInfo?.rent ?? 0;
  const { visible: showMoveInCard } = useMoveInDashboardCard();
  const remainingMoveInAmount = moveInPayments?.finalAmount ?? null;
  const showMoveInPendingPayment = shouldShowMoveInPendingPaymentCard(
    profile,
    bookingStatus,
    remainingMoveInAmount,
  );
  const moveInPendingAmount = getMoveInPendingAmount(profile, remainingMoveInAmount);
  const propertyLocality = profile?.propertyInfo?.locality;
  const showSmartMeter = Boolean(profile?.propertyInfo?.isSmartMeterEnabled);

  useEffect(() => {
    if (!profile?.bookingId) return;
    getPropertyManagerByBookingId(profile.bookingId).then((res) => {
      if (res?.success && res?.data) {
        setPmName(res.data.name ?? '');
        setPmPhone(res.data.phone ?? res.data.mobile ?? '');
        setPmPhoto(res.data.photo ?? res.data.image ?? null);
      }
    });
  }, [profile?.bookingId]);

  async function onRefresh() {
    setRefreshing(true);
    await Promise.all([
      refetchInvoices(),
      refetchTickets(),
      refetchEvents(),
      refetchPendingReviews(),
      refetchBookingStatus(),
      refetchMoveInPayments(),
      useTenantStore.getState().fetchProfile(),
      profile?.bookingId
        ? queryClient.invalidateQueries({
            queryKey: queryKeys.smartMeterRooms(profile.bookingId),
          })
        : Promise.resolve(),
    ]);
    setRefreshing(false);
  }

  function callPropertyManager() {
    if (!pmPhone) return;
    const url = Platform.OS === 'android' ? `tel:${pmPhone}` : `telprompt:${pmPhone}`;
    Linking.openURL(url);
  }

  function handlePayNow() {
    if (showMoveInPendingPayment) {
      startMoveInPayment();
      return;
    }
    if (nextPending) {
      payInvoice(nextPending);
      return;
    }
    router.push('/(tabs)/payments');
  }

  function handleQuickAction(id: string) {
    if (id === 'refer') {
      router.push('/profile/referral');
      return;
    }
    if (id === 'visitors') {
      router.push('/visitors');
      return;
    }
    if (id === 'roommates') {
      router.push('/roommates');
      return;
    }
    if (id === 'sos') {
      router.push('/sos');
      return;
    }
    router.push('/(tabs)/support');
  }

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[...DASHBOARD_HEADER_GRADIENT.colors]}
        start={DASHBOARD_HEADER_GRADIENT.start}
        end={DASHBOARD_HEADER_GRADIENT.end}
        style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerRow}>
          <View style={styles.greetingBlock}>
            <Typography variant="display" size="xs" weight="bold" color={palette.white}>
              👋 Hello, {profile?.userInfo?.name?.split(' ')[0] ?? 'there'}!
            </Typography>
            <Typography variant="label" size="xs" color={palette.gray[300]}>
              {profile?.propertyInfo?.name || ''}
            </Typography>
          </View>
          <View style={styles.headerActions}>
            <Pressable style={styles.iconButton} accessibilityRole="button">
              <DashboardIcon name="notification" size={20} color={palette.gray[800]} />
              <View style={styles.notificationDot} />
            </Pressable>
            <Pressable
              style={styles.iconButton}
              onPress={() => router.push('/menu')}
              accessibilityRole="button">
              <DashboardIcon name="profile" size={20} color={palette.gray[800]} />
            </Pressable>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.sheet}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Platform.OS === 'ios' ? tabBarInset -100 + TAB_SCREEN_EXTRA_PADDING : tabBarInset + TAB_SCREEN_EXTRA_PADDING },
        ]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}>
        {showMoveInPendingPayment ? (
          <DashboardMoveInPendingPaymentCard
            propertyName={profile?.propertyInfo?.name ?? 'Your property'}
            locality={propertyLocality}
            imageUrl={profile?.propertyInfo?.imageUrl}
            amount={moveInPendingAmount}
            onPayPress={handlePayNow}
          />
        ) : showMoveInCard ? (
          <DashboardMoveInStepsCard />
        ) : (
          <DashboardRentCard
            dueDate={nextPending?.due_date}
            amount={rentAmount}
            onPayPress={handlePayNow}
          />
        )}

        {pmName ? (
          <DashboardPmCard
            name={pmName}
            phone={pmPhone}
            photoUrl={pmPhoto}
            onCallPress={callPropertyManager}
          />
        ) : null}

        <DashboardQuickActions onActionPress={handleQuickAction} />

        {showSmartMeter ? <DashboardSmartMeterCard /> : null}

        <DashboardSupportPreview
          tickets={tickets ?? []}
          onRaiseRequest={openRaiseRequest}
        />

        <DashboardEventsSection events={events ?? []} isLoading={eventsLoading} />

        <DashboardReferralCard
          unlockedAmount={creditInfo?.balanceCredits ?? creditInfo?.totalCredits ?? 0}
          friendsJoined={creditInfo?.friendsJoined ?? 0}
          referralCode={creditInfo?.referralCode}
          onViewRewards={() => router.push('/profile/referral')}
          onCopied={() => setCopySnackbarVisible(true)}
        />

        {invoicesLoading ? (
          <ActivityIndicator color={palette.lime[700]} style={styles.loader} />
        ) : null}
      </ScrollView>

      <RaiseRequestSheet
        visible={sheetVisible}
        onClose={closeRaiseRequest}
        onSubmit={submitRaiseRequest}
      />

      {(pendingReviews?.length ?? 0) > 0 ? (
        <RatingAndReviewSheet
          pendingReviews={pendingReviews}
          autoOpen
          onCompleted={() => void refetchPendingReviews()}
        />
      ) : null}

      <Snackbar
        message="Referral code copied"
        visible={copySnackbarVisible}
        onDismiss={dismissCopySnackbar}
        bottomOffset={TAB_BAR_HEIGHT + 12}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.gray[800],
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: DASHBOARD_SHEET_OVERLAP + 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  greetingBlock: {
    flex: 1,
    gap: 4,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    backgroundColor: palette.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: Radius.full,
    backgroundColor: palette.red[500],
    borderWidth: 1.5,
    borderColor: palette.white,
  },
  sheet: {
    flex: 1,
    marginTop: -DASHBOARD_SHEET_OVERLAP,
    backgroundColor: palette.white,
    borderTopLeftRadius: DASHBOARD_SHEET_RADIUS,
    borderTopRightRadius: DASHBOARD_SHEET_RADIUS,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    gap: DASHBOARD_SECTION_GAP,
  },
  loader: {
    marginTop: 8,
  },
});
