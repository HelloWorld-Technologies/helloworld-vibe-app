import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { Typography } from '@/components/ui/typography';
import type { AppliedDiscount, BookingChargeOption } from '@/types/booking-payment';
import { formatBookingAmount, getAppliedDiscountMessage } from '@/utils/booking-payment';
import { Radius } from '@/constants/theme';

type BookingChargesSheetProps = {
  visible: boolean;
  onClose: () => void;
  charges: BookingChargeOption[];
  selectedIds: Set<string>;
  discounts: AppliedDiscount[];
  total: number;
  onPayNow: () => void;
  paying?: boolean;
};

const SUMMARY_COLORS = {
  primary: '#0A0A0A',
  muted: '#888888',
  sectionLabel: '#AAAAAA',
  requiredBadgeBg: '#EAF3DE',
  requiredBadgeText: '#3B6D11',
  discountBg: '#EAF3DE',
  discountBadgeBg: '#C0DD97',
  discountBadgeText: '#27500A',
  discountText: '#3B6D11',
  rowBorder: '#F0F0F0',
  totalBorder: '#E5E5E5',
} as const;

type ChargeSummaryRowProps = {
  charge: BookingChargeOption;
};

function ChargeSummaryRow({ charge }: ChargeSummaryRowProps) {
  return (
    <View style={styles.chargeRow}>
      <View style={styles.chargeCopy}>
        <Typography variant="text" size="sm" style={styles.chargeLabel}>
          {charge.label}
        </Typography>
        <Typography variant="text" size="xs" style={styles.chargeDescription}>
          {charge.description}
        </Typography>
        {charge.badge ? (
          <View style={styles.requiredBadge}>
            <Typography variant="text" size="xs" style={styles.requiredBadgeText}>
              {charge.badge}
            </Typography>
          </View>
        ) : null}
      </View>
      <Typography variant="text" size="sm" weight="medium" style={styles.chargeAmount}>
        {formatBookingAmount(charge.amount)}
      </Typography>
    </View>
  );
}

function DiscountSummaryRow({ discount }: { discount: AppliedDiscount }) {
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

export function BookingChargesSheet({
  visible,
  onClose,
  charges,
  selectedIds,
  discounts,
  total,
  onPayNow,
  paying,
}: BookingChargesSheetProps) {
  const insets = useSafeAreaInsets();
  const selectedCharges = charges.filter((charge) => selectedIds.has(charge.id));
  const unselectedCharges = charges.filter((charge) => !selectedIds.has(charge.id));

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <ScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <View style={styles.chargeList}>
          {selectedCharges.map((charge) => (
            <ChargeSummaryRow key={charge.id} charge={charge} />
          ))}

          {unselectedCharges.length > 0 ? (
            <>
              <Typography
                variant="text"
                size="xs"
                style={styles.notSelectedLabel}
                accessibilityRole="header">
                NOT SELECTED
              </Typography>

              <View style={styles.unselectedGroup}>
                {unselectedCharges.map((charge) => (
                  <ChargeSummaryRow key={charge.id} charge={charge} />
                ))}
              </View>
            </>
          ) : null}
        </View>

        {discounts.length > 0 ? (
          <View style={styles.discountBox}>
            {discounts.map((discount, index) => (
              <View key={`${discount.type}-${discount.code}`}>
                {index > 0 ? <View style={styles.discountDivider} /> : null}
                <DiscountSummaryRow discount={discount} />
              </View>
            ))}
          </View>
        ) : null}

        <View style={styles.totalBlock}>
          <Typography variant="text" size="sm" style={styles.totalLabel}>
            Total payable now
          </Typography>
          <Typography variant="display" size="sm" weight="bold" style={styles.totalAmount}>
            {formatBookingAmount(total)}
          </Typography>
        </View>

        <Button label="Pay Now" onPress={onPayNow} loading={paying} style={styles.cta} />
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 24,
    paddingTop: 24,
    gap: 16,
  },
  chargeList: {
    gap: 16,
  },
  chargeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    paddingBottom: 9,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: SUMMARY_COLORS.rowBorder,
  },
  chargeCopy: {
    flex: 1,
    gap: 4,
  },
  chargeLabel: {
    color: SUMMARY_COLORS.primary,
    lineHeight: 20,
  },
  chargeDescription: {
    color: SUMMARY_COLORS.muted,
    lineHeight: 17,
  },
  chargeAmount: {
    color: SUMMARY_COLORS.primary,
    lineHeight: 20,
  },
  requiredBadge: {
    alignSelf: 'flex-start',
    backgroundColor: SUMMARY_COLORS.requiredBadgeBg,
    borderRadius: Radius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 2,
  },
  requiredBadgeText: {
    color: SUMMARY_COLORS.requiredBadgeText,
    fontSize: 10,
    lineHeight: 15,
    letterSpacing: 0.12,
  },
  notSelectedLabel: {
    color: SUMMARY_COLORS.sectionLabel,
    fontSize: 10,
    lineHeight: 15,
    letterSpacing: 0.37,
    textTransform: 'uppercase',
  },
  unselectedGroup: {
    gap: 16,
    opacity: 0.4,
  },
  discountBox: {
    backgroundColor: SUMMARY_COLORS.discountBg,
    borderRadius: Radius.md,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 7,
  },
  discountBlock: {
    gap: 4,
  },
  discountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    minHeight: 28,
  },
  discountLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  discountBadge: {
    backgroundColor: SUMMARY_COLORS.discountBadgeBg,
    borderRadius: Radius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  discountBadgeText: {
    color: SUMMARY_COLORS.discountBadgeText,
    fontSize: 10,
    lineHeight: 15,
    letterSpacing: 0.12,
  },
  discountCode: {
    flex: 1,
    color: SUMMARY_COLORS.discountText,
    lineHeight: 18,
  },
  discountAmount: {
    color: SUMMARY_COLORS.discountText,
    lineHeight: 20,
  },
  discountDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: SUMMARY_COLORS.discountBadgeBg,
    marginBottom: 7,
  },
  discountHint: {
    color: SUMMARY_COLORS.discountText,
    lineHeight: 17,
    letterSpacing: 0.06,
  },
  totalBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: SUMMARY_COLORS.totalBorder,
    paddingTop: 16,
    paddingHorizontal: 2,
  },
  totalLabel: {
    color: SUMMARY_COLORS.muted,
    lineHeight: 20,
  },
  totalAmount: {
    color: SUMMARY_COLORS.primary,
    lineHeight: 30,
  },
  cta: {
    marginTop: 0,
  },
});
