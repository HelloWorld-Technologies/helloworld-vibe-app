import { useRouter } from 'expo-router';
import { HwSymbol } from '@/components/ui/hw-symbol';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Typography } from '@/components/ui/typography';
import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';
import type { BookingPaymentSummary } from '@/types/booking-payment';
import { formatBookingAmount, formatBookingMoveInDate, getAppliedDiscountMessage } from '@/utils/booking-payment';

type BookingPaymentFailedViewProps = {
  summary: BookingPaymentSummary;
  errorMessage?: string;
  onRetry: () => void;
};

function DiscountRow({
  discount,
}: {
  discount: BookingPaymentSummary['discounts'][number];
}) {
  const message = getAppliedDiscountMessage(discount);
  const showAmount = discount.amount > 0;

  return (
    <View style={styles.discountBlock}>
      <View style={styles.discountRow}>
        <View style={styles.discountLeft}>
          <View style={styles.discountBadge}>
            <Typography variant="text" size="xs" style={styles.discountBadgeText}>
              {discount.type === 'coupon' ? 'COUPON' : 'REFERRAL'}
            </Typography>
          </View>
          <Typography variant="text" size="xs" style={styles.discountCode}>
            {discount.code}
          </Typography>
        </View>
        {showAmount ? (
          <Typography variant="text" size="sm" weight="medium" style={styles.discountAmount}>
            −{formatBookingAmount(discount.amount)}
          </Typography>
        ) : null}
      </View>
      {message ? (
        <Typography variant="text" size="xs" style={styles.discountHint}>
          {message}
        </Typography>
      ) : null}
    </View>
  );
}

export function BookingPaymentFailedView({
  summary,
  errorMessage,
  onRetry,
}: BookingPaymentFailedViewProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back">
          <HwSymbol name="chevron.left" size={16} weight="semibold" tintColor={palette.gray[800]} />
        </Pressable>
        <Typography variant="text" size="md" weight="bold">
          Payment Failed
        </Typography>
        <Pressable
          onPress={() => router.push('/(tabs)/contact')}
          style={styles.supportButton}
          accessibilityRole="button"
          accessibilityLabel="Contact support">
          <HwSymbol name="headphones" size={14} tintColor={palette.blue[600]} />
          <Typography variant="text" size="sm" weight="medium" color={palette.blue[600]}>
            Support
          </Typography>
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: 120 + insets.bottom }]}>
        <View style={styles.iconWrap}>
          <View style={styles.iconGlow} />
          <View style={styles.iconCircle}>
            <HwSymbol name="xmark" size={28} weight="bold" tintColor={palette.white} />
          </View>
        </View>

        <Typography variant="display" size="sm" weight="bold" style={styles.title}>
          Payment Failed
        </Typography>

        <View style={styles.invoiceBadge}>
          <Typography variant="text" size="sm" weight="medium" color={palette.blue[700]}>
            Invoice ID: {summary.invoiceId}
          </Typography>
        </View>

        {errorMessage ? (
          <Typography variant="text" size="sm" color={palette.red[600]} style={styles.errorMessage}>
            {errorMessage}
          </Typography>
        ) : null}

        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Typography variant="text" size="sm" color={palette.gray[600]}>
              Payment Summary
            </Typography>
            <Typography variant="text" size="sm" color={palette.gray[600]}>
              {formatBookingMoveInDate(summary.date)}
            </Typography>
          </View>

          <View style={styles.divider} />

          {summary.lines.map((line) => (
            <View key={line.label} style={styles.summaryRow}>
              <Typography variant="text" size="sm" weight="medium">
                {line.label}
              </Typography>
              <Typography variant="text" size="sm" weight="bold">
                {formatBookingAmount(line.amount)}
              </Typography>
            </View>
          ))}

          {summary.discounts.map((discount) => (
            <DiscountRow key={`${discount.type}-${discount.code}`} discount={discount} />
          ))}

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Typography variant="text" size="sm" color={palette.gray[600]}>
              Total Amount
            </Typography>
            <Typography variant="display" size="sm" weight="bold">
              {formatBookingAmount(summary.total)}
            </Typography>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Button label="Try Again" onPress={onRetry} />
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
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minWidth: 40,
    justifyContent: 'flex-end',
  },
  content: {
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 16,
  },
  iconWrap: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  iconGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: palette.red[50],
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: palette.red[500],
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
  errorMessage: {
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 8,
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
  discountBlock: {
    gap: 4,
  },
  discountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  discountLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  discountBadge: {
    backgroundColor: palette.lime[200],
    borderRadius: Radius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  discountBadgeText: {
    color: palette.lime[800],
    fontSize: 10,
    lineHeight: 15,
    letterSpacing: 0.12,
  },
  discountCode: {
    flex: 1,
    color: palette.lime[700],
    lineHeight: 18,
  },
  discountAmount: {
    color: palette.lime[700],
    lineHeight: 20,
  },
  discountHint: {
    color: palette.lime[700],
    lineHeight: 17,
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
  },
});
