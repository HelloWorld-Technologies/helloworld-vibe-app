import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Pressable as GesturePressable } from 'react-native-gesture-handler';

import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Typography } from '@/components/ui/typography';
import { fontStyleForWeight } from '@/constants/fonts';
import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';
import type { AppliedDiscount, BookingChargeOption } from '@/types/booking-payment';
import { formatBookingAmount, getAppliedDiscountMessage } from '@/utils/booking-payment';

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
        {charge.description ? (
          <Typography variant="text" size="xs" style={styles.chargeDescription}>
            {charge.description}
          </Typography>
        ) : null}
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

function PayNowButton({
  disabled,
  loading,
  onPress,
}: {
  disabled: boolean;
  loading?: boolean;
  onPress: () => void;
}) {
  const isDisabled = disabled || Boolean(loading);

  return (
    <View collapsable={false} style={styles.payCtaHit}>
      <GesturePressable
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled }}
        disabled={isDisabled}
        onPress={onPress}
        style={({ pressed }) => [
          styles.payCta,
          isDisabled && !loading && styles.payCtaDisabled,
          pressed && !isDisabled && styles.payCtaPressed,
        ]}>
        <View pointerEvents="none" style={styles.payCtaInner}>
          {loading ? (
            <ActivityIndicator color={palette.gray[800]} />
          ) : (
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.85}
              style={styles.payCtaLabel}>
              Pay Now
            </Text>
          )}
        </View>
      </GesturePressable>
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
  const selectedCharges = charges.filter((charge) => selectedIds.has(charge.id));
  const unselectedCharges = charges.filter((charge) => !selectedIds.has(charge.id));

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={styles.sheetBody} pointerEvents="auto" collapsable={false}>
        <ScrollView
          style={styles.sheetScroll}
          bounces={false}
          nestedScrollEnabled
          keyboardShouldPersistTaps="always"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}>
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
        </ScrollView>

        <View style={styles.ctaDock} pointerEvents="auto" collapsable={false}>
          <PayNowButton disabled={Boolean(paying)} loading={paying} onPress={onPayNow} />
        </View>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheetBody: {
    flexShrink: 1,
    flexDirection: 'column',
    overflow: 'hidden',
  },
  sheetScroll: {
    flexGrow: 0,
    flexShrink: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 8,
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
  ctaDock: {
    zIndex: 8,
    elevation: 8,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 4,
    backgroundColor: palette.white,
  },
  payCtaHit: {
    zIndex: 9,
    elevation: 9,
    width: '100%',
  },
  payCta: {
    minHeight: 48,
    width: '100%',
    borderRadius: Radius.sm,
    backgroundColor: palette.lime[300],
    alignSelf: 'stretch',
  },
  payCtaPressed: {
    backgroundColor: palette.lime[400],
  },
  payCtaDisabled: {
    opacity: 0.5,
  },
  payCtaInner: {
    minHeight: 48,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  payCtaLabel: {
    fontSize: 16,
    lineHeight: 24,
    color: palette.gray[800],
    ...fontStyleForWeight('bold'),
  },
});
