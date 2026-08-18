import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import { DashboardImages } from '@/constants/assets';
import { DASHBOARD_MOVE_IN_CARD_GRADIENT } from '@/constants/dashboard';
import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';
import { useBookingStatus } from '@/queries/use-booking-status';
import { useMoveInPaymentDetails } from '@/queries/use-move-in-payment-details';
import { useUserVibes } from '@/queries/use-vibes';
import { useTenantProfile, useTenantStore } from '@/stores/tenant-store';
import { buildMoveInPendingMessage, buildMoveInSteps, partitionMoveInSteps } from '@/utils/move-in-steps';

export function useMoveInDashboardCard() {
  const profile = useTenantProfile();
  const moveInInterests = useTenantStore((state) => state.moveInInterests);
  const moveInBackground = useTenantStore((state) => state.moveInBackground);
  const { data: status } = useBookingStatus();
  const { data: moveInPayments } = useMoveInPaymentDetails();
  useUserVibes();

  if (!profile?.bookingId || !status) {
    return { visible: false, pendingCount: 0 };
  }

  const { pending } = partitionMoveInSteps(
    buildMoveInSteps(
      status,
      profile,
      moveInInterests,
      moveInBackground,
      moveInPayments?.finalAmount ?? null,
    ),
  );
  return { visible: pending.length > 0, pendingCount: pending.length };
}

export function DashboardMoveInStepsCard() {
  const router = useRouter();
  const { visible, pendingCount } = useMoveInDashboardCard();

  if (!visible) {
    return null;
  }

  return (
    <LinearGradient
      colors={[...DASHBOARD_MOVE_IN_CARD_GRADIENT.colors]}
      start={DASHBOARD_MOVE_IN_CARD_GRADIENT.start}
      end={DASHBOARD_MOVE_IN_CARD_GRADIENT.end}
      style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.copy}>
          <Typography variant="text" size="lg" weight="medium" color="#171717">
            Move-in pending
          </Typography>
          <Typography variant="text" size="xs" color={palette.gray[500]} style={styles.subtext}>
            {buildMoveInPendingMessage(pendingCount)}
          </Typography>
        </View>
        <Image source={DashboardImages.moveInKeys} style={styles.illustration} contentFit="contain" />
      </View>
      <Pressable
        style={styles.continueButton}
        onPress={() => router.push('/move-in-steps')}
        accessibilityRole="button"
        accessibilityLabel="Continue move-in steps">
        <Typography variant="text" size="sm" weight="bold" color={palette.gray[800]}>
          Continue
        </Typography>
      </Pressable>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.md,
    padding: 16,
    gap: 8,
    shadowColor: '#8690A3',
    shadowOffset: { width: 0, height: 1.3 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 3,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  copy: {
    flex: 1,
    gap: 8,
    paddingTop: 2,
  },
  subtext: {
    maxWidth: '100%',
  },
  illustration: {
    width: 109,
    height: 92,
  },
  continueButton: {
    minHeight: 36,
    borderRadius: Radius.sm,
    backgroundColor: palette.lime[400],
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0A0D12',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
});
