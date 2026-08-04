import { useFocusEffect, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MoveInCompletedSection } from '@/components/booking-status/move-in-completed-section';
import { MoveInPendingCard } from '@/components/booking-status/move-in-pending-card';
import { MoveInProgressCard } from '@/components/booking-status/move-in-progress-card';
import { MoveInStepsHeader } from '@/components/booking-status/move-in-steps-header';
import { DashboardMoveInPendingPaymentCard } from '@/components/tenant/dashboard/dashboard-move-in-pending-payment-card';
import { Typography } from '@/components/ui/typography';
import palette from '@/constants/palette';
import { useMoveInPayment } from '@/hooks/use-move-in-payment';
import { useBookingStatus } from '@/queries/use-booking-status';
import { useMoveInPaymentDetails } from '@/queries/use-move-in-payment-details';
import { useTenantProfile, useTenantStore } from '@/stores/tenant-store';
import type { MoveInStep } from '@/types/booking-status';
import { buildMoveInSteps, partitionMoveInSteps } from '@/utils/move-in-steps';
import {
  getMoveInPendingAmount,
  shouldShowMoveInPendingPaymentCard,
} from '@/utils/move-in-payment';
import { resetRootRoute } from '@/utils/navigation-reset';

export function MoveInStepsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const profile = useTenantProfile();
  const { startMoveInPayment } = useMoveInPayment();
  const { data: moveInPayments, refetch: refetchMoveInPayments } = useMoveInPaymentDetails();
  const { data: status, isLoading, isError, refetch, isRefetching } = useBookingStatus();
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);

  const refreshAll = useCallback(async () => {
    await Promise.all([
      refetch(),
      refetchMoveInPayments(),
      useTenantStore.getState().fetchProfile(),
    ]);
  }, [refetch, refetchMoveInPayments]);

  useFocusEffect(
    useCallback(() => {
      void refreshAll();
    }, [refreshAll]),
  );

  const moveInInterests = useTenantStore((state) => state.moveInInterests);
  const moveInBackground = useTenantStore((state) => state.moveInBackground);
  const remainingMoveInAmount = moveInPayments?.finalAmount ?? null;
  const steps = status
    ? buildMoveInSteps(
        status,
        profile,
        moveInInterests,
        moveInBackground,
        remainingMoveInAmount,
      )
    : [];
  const { completed, pending, total, doneCount } = partitionMoveInSteps(steps);
  const moveInDate = status?.move_in_date ?? profile?.propertyInfo?.moveInDate ?? '';
  const showMoveInPendingPayment = shouldShowMoveInPendingPaymentCard(
    profile,
    status,
    remainingMoveInAmount,
  );
  const moveInPendingAmount = getMoveInPendingAmount(profile, remainingMoveInAmount);
  const visiblePending = showMoveInPendingPayment
    ? pending.filter((step) => step.id !== 'advance-charges')
    : pending;
  const isRefreshing = isRefetching || isManualRefreshing;

  function handleMoveInPayment() {
    startMoveInPayment();
  }

  const handleBack = useCallback(() => {
    resetRootRoute('/(tabs)/dashboard');
  }, []);

  async function handleRefreshPress() {
    if (isRefreshing) return;
    setIsManualRefreshing(true);
    try {
      await refreshAll();
    } finally {
      setIsManualRefreshing(false);
    }
  }

  function handleStepPress(step: MoveInStep) {
    if (step.enabled === false) return;
    if (step.route) {
      router.push(step.route as never);
    }
  }

  return (
    <View style={styles.root}>
      <MoveInStepsHeader onBack={handleBack} />

      {isLoading ? (
        <View style={styles.loader}>
          <ActivityIndicator color={palette.helloLime} />
        </View>
      ) : isError || !status ? (
        <View style={styles.loader}>
          <Typography variant="body" color={palette.textSecondary} style={styles.errorText}>
            Unable to load your move-in steps right now.
          </Typography>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => void handleRefreshPress()}
            />
          }
          contentContainerStyle={[
            styles.content,
            { paddingBottom: Math.max(insets.bottom, 24) + 24 },
          ]}>
          {showMoveInPendingPayment ? (
            <DashboardMoveInPendingPaymentCard
              propertyName={profile?.propertyInfo?.name ?? 'Your property'}
              locality={profile?.propertyInfo?.locality}
              imageUrl={profile?.propertyInfo?.imageUrl}
              amount={moveInPendingAmount}
              onPayPress={handleMoveInPayment}
            />
          ) : null}

          {moveInDate ? (
            <MoveInProgressCard doneCount={doneCount} total={total} moveInDate={moveInDate} />
          ) : null}

          {visiblePending.length > 0 ? (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Typography variant="text" size="xl" weight="bold" style={styles.sectionTitle}>
                  Pending Actions
                </Typography>
                <Pressable
                  onPress={() => void handleRefreshPress()}
                  disabled={isRefreshing}
                  hitSlop={8}
                  style={({ pressed }) => [
                    styles.refreshButton,
                    pressed && styles.refreshButtonPressed,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Refresh pending actions">
                  {isRefreshing ? (
                    <ActivityIndicator size="small" color={palette.gray[700]} />
                  ) : (
                    <SymbolView
                      name="arrow.clockwise"
                      size={18}
                      weight="semibold"
                      tintColor={palette.gray[700]}
                    />
                  )}
                </Pressable>
              </View>
              {visiblePending.map((step) => (
                <MoveInPendingCard
                  key={step.id}
                  step={step}
                  onPress={
                    step.actionLabel && step.enabled !== false
                      ? () => handleStepPress(step)
                      : undefined
                  }
                />
              ))}
            </View>
          ) : null}

          <MoveInCompletedSection steps={completed} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.white,
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    textAlign: 'center',
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 16,
    gap: 32,
  },
  section: {
    gap: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  sectionTitle: {
    flex: 1,
  },
  refreshButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.gray[100],
  },
  refreshButtonPressed: {
    opacity: 0.75,
  },
});
