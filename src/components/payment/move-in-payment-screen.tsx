import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getMoveInPaymentDetails } from '@/api/booking';
import { MoveInPaymentSkeleton } from '@/components/skeleton';
import { TenantScreenHeader } from '@/components/tenant/tenant-screen-header';
import { Button } from '@/components/ui/button';
import { Typography } from '@/components/ui/typography';
import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';
import { useMoveInPayment } from '@/hooks/use-move-in-payment';
import type { MoveInPaymentDetails, MoveInPaymentLineItem } from '@/types/move-in-payment';
import {
  buildMoveInPaymentParams,
  parseMoveInPaymentLineItems,
} from '@/utils/move-in-payment-checkout';
import { priceFormatter } from '@/utils/tenant-format';

function SummaryRow({
  label,
  value,
  bold,
  accent,
}: {
  label: string;
  value: string;
  bold?: boolean;
  accent?: string;
}) {
  return (
    <View style={styles.summaryRow}>
      <Typography
        variant="text"
        size={bold ? 'md' : 'sm'}
        weight={bold ? 'bold' : 'medium'}
        color={palette.gray[700]}>
        {label}
      </Typography>
      <Typography
        variant="text"
        size={bold ? 'md' : 'sm'}
        weight={bold ? 'bold' : 'medium'}
        color={accent ?? palette.gray[900]}>
        {value}
      </Typography>
    </View>
  );
}

function LineRow({
  item,
  showBorder,
}: {
  item: MoveInPaymentLineItem;
  showBorder: boolean;
}) {
  return (
    <View style={[styles.lineRow, showBorder && styles.lineRowBorder]}>
      <View style={styles.lineCopy}>
        <Typography
          variant="text"
          size="sm"
          weight="medium"
          color={palette.gray[900]}
          style={styles.capitalize}>
          {item.title}
        </Typography>
        <Typography
          variant="label"
          size="xs"
          weight="medium"
          color={item.paid ? palette.lime[700] : palette.red[800]}>
          {item.paid ? 'Paid' : 'Remaining'}
        </Typography>
      </View>
      <Typography variant="text" size="sm" weight="bold" color={palette.gray[900]}>
        {priceFormatter(item.amount)}
      </Typography>
    </View>
  );
}

export function MoveInPaymentScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { profile, mobile } = useMoveInPayment();
  const [payments, setPayments] = useState<MoveInPaymentDetails | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchPaymentLineItems = useCallback(async () => {
    if (!profile?.bookingId) {
      setErrorMessage('Booking details are unavailable right now.');
      setPayments(null);
      setIsLoading(false);
      return;
    }

    const { data, success, message } = await getMoveInPaymentDetails(profile.bookingId);
    if (success && data) {
      setPayments(data);
      setErrorMessage('');
    } else {
      setPayments(null);
      setErrorMessage(message || 'Failed to fetch payment details');
    }
    setIsLoading(false);
  }, [profile?.bookingId]);

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      void fetchPaymentLineItems();
    }, [fetchPaymentLineItems]),
  );

  async function onRefresh() {
    setIsRefreshing(true);
    await fetchPaymentLineItems();
    setIsRefreshing(false);
  }

  function handleMoveInPayment() {
    if (!profile || !payments?.finalAmount) return;

    router.push({
      pathname: '/complete-payment',
      params: buildMoveInPaymentParams(profile, payments.finalAmount, mobile ?? ''),
    });
  }

  const lineItems = useMemo(
    () => (payments ? parseMoveInPaymentLineItems(payments) : []),
    [payments],
  );
  const remainingItems = lineItems.filter((item) => !item.paid);
  const paidItems = lineItems.filter((item) => item.paid);
  const paidTotal = paidItems.reduce((sum, item) => sum + item.amount, 0);
  const remainingTotal = remainingItems.reduce((sum, item) => sum + item.amount, 0);
  const canPay = Boolean(payments?.finalAmount && payments.finalAmount > 0);

  return (
    <View style={styles.root}>
      <TenantScreenHeader title="Move-in Payment" onBack={() => router.back()} />

      {isLoading ? (
        <MoveInPaymentSkeleton />
      ) : errorMessage ? (
        <View style={styles.centered}>
          <Typography variant="text" size="md" color={palette.textSecondary} style={styles.errorText}>
            {errorMessage}
          </Typography>
          <Button
            label="Try again"
            onPress={() => void fetchPaymentLineItems()}
            style={styles.retry}
          />
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: Math.max(insets.bottom, 16) + 24 },
          ]}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={() => void onRefresh()} />
          }
          showsVerticalScrollIndicator={false}>
          <View style={styles.headerCard}>
            <View style={styles.headerTop}>
              <View style={styles.headerCopy}>
                <Typography variant="text" size="lg" weight="bold" color={palette.gray[900]}>
                  Move-in charges
                </Typography>
                {profile?.propertyInfo?.name ? (
                  <Typography variant="text" size="sm" color={palette.gray[600]}>
                    {profile.propertyInfo.name}
                  </Typography>
                ) : null}
              </View>
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: canPay ? palette.yellow[50] : palette.lime[50],
                  },
                ]}>
                <Typography
                  variant="label"
                  size="xs"
                  weight="medium"
                  color={canPay ? palette.red[800] : palette.lime[700]}>
                  {canPay ? 'Pending' : 'Paid'}
                </Typography>
              </View>
            </View>

            <View style={styles.metaGrid}>
              <View style={styles.metaItem}>
                <Typography variant="label" size="xs" color={palette.gray[500]}>
                  Remaining
                </Typography>
                <Typography variant="text" size="sm" weight="medium">
                  {priceFormatter(payments?.finalAmount ?? remainingTotal)}
                </Typography>
              </View>
              <View style={styles.metaItem}>
                <Typography variant="label" size="xs" color={palette.gray[500]}>
                  Already paid
                </Typography>
                <Typography variant="text" size="sm" weight="medium">
                  {priceFormatter(paidTotal)}
                </Typography>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Typography variant="text" size="md" weight="bold" style={styles.sectionTitle}>
              Item details
            </Typography>

            {lineItems.length === 0 ? (
              <View style={styles.emptyLines}>
                <Typography variant="text" size="sm" color={palette.gray[600]}>
                  No payment items found right now.
                </Typography>
              </View>
            ) : (
              <View style={styles.linesCard}>
                {lineItems.map((item, index) => (
                  <LineRow
                    key={item.title}
                    item={item}
                    showBorder={index < lineItems.length - 1}
                  />
                ))}
              </View>
            )}
          </View>

          {payments ? (
            <View style={styles.summaryCard}>
              {payments.cgst ? (
                <SummaryRow label="CGST" value={priceFormatter(payments.cgst)} />
              ) : null}
              {payments.sgst ? (
                <SummaryRow label="SGST" value={priceFormatter(payments.sgst)} />
              ) : null}
              {paidTotal > 0 ? (
                <SummaryRow label="Payment made" value={priceFormatter(paidTotal)} />
              ) : null}
              <SummaryRow
                label="Balance"
                value={priceFormatter(payments.finalAmount ?? remainingTotal)}
                bold
                accent={
                  (payments.finalAmount ?? remainingTotal) > 0
                    ? palette.red[800]
                    : palette.lime[700]
                }
              />
            </View>
          ) : null}

          {canPay ? (
            <View style={styles.actions}>
              <Button label="Complete Payment" onPress={handleMoveInPayment} />
            </View>
          ) : null}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.gray[50],
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 12,
    gap: 16,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 16,
  },
  errorText: {
    textAlign: 'center',
  },
  retry: {
    alignSelf: 'center',
    minWidth: 140,
  },
  headerCard: {
    backgroundColor: palette.white,
    borderRadius: Radius.sm,
    padding: 16,
    gap: 14,
    shadowColor: '#8690A3',
    shadowOffset: { width: 0, height: 1.3 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 2,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  headerCopy: {
    flex: 1,
    gap: 4,
  },
  badge: {
    borderRadius: Radius.full,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  metaGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flex: 1,
    gap: 4,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    color: palette.gray[900],
  },
  emptyLines: {
    backgroundColor: palette.white,
    borderRadius: Radius.sm,
    padding: 16,
  },
  linesCard: {
    backgroundColor: palette.white,
    borderRadius: Radius.sm,
    overflow: 'hidden',
    shadowColor: '#8690A3',
    shadowOffset: { width: 0, height: 1.3 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 2,
  },
  lineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  lineRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.gray[200],
  },
  lineCopy: {
    flex: 1,
    gap: 4,
  },
  capitalize: {
    textTransform: 'capitalize',
  },
  summaryCard: {
    backgroundColor: palette.white,
    borderRadius: Radius.sm,
    padding: 16,
    gap: 12,
    shadowColor: '#8690A3',
    shadowOffset: { width: 0, height: 1.3 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  actions: {
    gap: 12,
    marginTop: 4,
  },
});
