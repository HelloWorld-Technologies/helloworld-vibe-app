import { useFocusEffect } from 'expo-router';
import { HwSymbol } from '@/components/ui/hw-symbol';
import { useCallback } from 'react';
import { BackHandler, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Typography } from '@/components/ui/typography';
import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';
import { useBookingDraftStore } from '@/stores/booking-draft-store';
import { useIsTenant, useTenantStore } from '@/stores/tenant-store';
import { formatBookingAmount, formatBookingMoveInDate } from '@/utils/booking-payment';
import { resetRootRoute } from '@/utils/navigation-reset';
import { getExploreHomeRoute } from '@/utils/tenant-routing';

export function BookingSuccessScreen() {
  const insets = useSafeAreaInsets();
  const isTenant = useIsTenant();
  const paymentResult = useBookingDraftStore((state) => state.paymentResult);
  const clearDraft = useBookingDraftStore((state) => state.clearDraft);
  const clearPaymentResult = useBookingDraftStore((state) => state.clearPaymentResult);
  const fetchProfile = useTenantStore((state) => state.fetchProfile);

  const finishBookingFlow = useCallback(
    async (href: '/(tabs)/dashboard' | '/move-in-steps') => {
      clearDraft();
      clearPaymentResult();
      await fetchProfile();
      resetRootRoute(href);
    },
    [clearDraft, clearPaymentResult, fetchProfile],
  );

  const handleGoToDashboard = useCallback(() => {
    void finishBookingFlow('/(tabs)/dashboard');
  }, [finishBookingFlow]);

  const handleViewMoveInSteps = useCallback(() => {
    void finishBookingFlow('/move-in-steps');
  }, [finishBookingFlow]);

  useFocusEffect(
    useCallback(() => {
      if (!paymentResult) {
        resetRootRoute(getExploreHomeRoute(isTenant));
        return undefined;
      }

      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        handleGoToDashboard();
        return true;
      });

      return () => subscription.remove();
    }, [handleGoToDashboard, isTenant, paymentResult]),
  );

  if (!paymentResult) {
    return null;
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable
          onPress={handleGoToDashboard}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go to dashboard">
          <HwSymbol name="chevron.left" size={16} weight="semibold" tintColor={palette.gray[800]} />
        </Pressable>
        <Typography variant="text" size="md" weight="bold">
          Payment Successful
        </Typography>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: 160 + insets.bottom }]}>
        <View style={styles.successIconWrap}>
          <View style={styles.successGlow} />
          <View style={styles.successIcon}>
            <HwSymbol name="checkmark" size={28} weight="bold" tintColor={palette.white} />
          </View>
        </View>

        <Typography variant="display" size="sm" weight="bold" style={styles.title}>
          Booking Confirmed! 🎉
        </Typography>

        <View style={styles.invoiceBadge}>
          <Typography variant="text" size="sm" weight="medium" color={palette.blue[700]}>
            Invoice ID: {paymentResult.invoiceId}
          </Typography>
        </View>

        <Typography variant="text" size="md" color={palette.gray[600]} style={styles.body}>
          Your booking is confirmed with a partial payment. Pay the remaining amount before move-in.
        </Typography>

        <View style={styles.moveInRow}>
          <HwSymbol name="calendar" size={14} tintColor={palette.gray[600]} />
          <Typography variant="text" size="sm" color={palette.gray[600]}>
            Move in Date: {formatBookingMoveInDate(paymentResult.moveInDate)}
          </Typography>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Typography variant="text" size="sm" color={palette.gray[600]}>
              Payment Summary
            </Typography>
            <Typography variant="text" size="sm" color={palette.gray[600]}>
              {formatBookingMoveInDate(paymentResult.paymentDate)}
            </Typography>
          </View>

          <View style={styles.summaryRow}>
            <Typography variant="text" size="sm" weight="medium">
              Token
            </Typography>
            <Typography variant="text" size="sm" weight="bold">
              {formatBookingAmount(paymentResult.paidAmount)}
            </Typography>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Typography variant="text" size="sm" color={palette.gray[600]}>
              Total Amount
            </Typography>
            <Typography variant="display" size="sm" weight="bold">
              {formatBookingAmount(paymentResult.paidAmount)}
            </Typography>
          </View>

          <View style={styles.divider} />

          <Pressable style={styles.receiptRow} accessibilityRole="button">
            <View style={styles.receiptIcon}>
              <HwSymbol name="arrow.down.circle" size={18} tintColor={palette.helloLime} />
            </View>
            <Typography variant="text" size="sm" weight="medium" style={styles.receiptText}>
              Download receipt
            </Typography>
            <HwSymbol name="chevron.right" size={12} tintColor={palette.helloLime} />
          </Pressable>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Button label="View Move-in Steps" onPress={handleViewMoveInSteps} />
        <Button label="Go to Dashboard" variant="outline" onPress={handleGoToDashboard} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: palette.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: palette.gray[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 16,
  },
  successIconWrap: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  successGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: palette.lime[100],
  },
  successIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: palette.helloLime,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
  },
  invoiceBadge: {
    backgroundColor: palette.blue[50],
    borderRadius: Radius.full,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  body: {
    textAlign: 'center',
    lineHeight: 24,
  },
  moveInRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  summaryCard: {
    width: '100%',
    backgroundColor: palette.white,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: palette.gray[200],
    padding: 16,
    gap: 12,
    marginTop: 8,
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: palette.gray[200],
  },
  receiptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: palette.lime[50],
    borderRadius: Radius.sm,
    padding: 12,
  },
  receiptIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: palette.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  receiptText: {
    flex: 1,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: palette.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: palette.gray[200],
    paddingHorizontal: 24,
    paddingTop: 16,
    gap: 12,
  },
});
