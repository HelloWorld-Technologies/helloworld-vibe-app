import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getSmartMeterConsumption, resolveSmartMeterBookingId } from '@/api/smart-meter';
import { ProfileStackScreen } from '@/components/profile/profile-stack-screen';
import { SmartMeterUsageChart } from '@/components/smart-meter/smart-meter-usage-chart';
import { EmptyState } from '@/components/ui/empty-state';
import { Typography } from '@/components/ui/typography';
import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';
import { useSmartMeterRooms } from '@/queries/use-smart-meter';
import { useTenantProfile } from '@/stores/tenant-store';
import type { SmartMeterConsumptionDeduction } from '@/types/smart-meter';
import {
  aggregateUsageByHour,
  filterDeductionsForDay,
  formatUsageDayTitle,
  parseApiDate,
  sumUsage,
  toApiDate,
} from '@/utils/smart-meter-usage';
import { priceFormatter } from '@/utils/tenant-format';

function shiftApiDate(dayKey: string, deltaDays: number) {
  const date = parseApiDate(dayKey);
  if (!date) return dayKey;
  date.setDate(date.getDate() + deltaDays);
  return toApiDate(date);
}

export function SmartMeterUsageDetailsScreen() {
  const insets = useSafeAreaInsets();
  const profile = useTenantProfile();
  const bookingId = resolveSmartMeterBookingId(profile?.bookingId);
  const { date: dateParam } = useLocalSearchParams<{ date?: string }>();
  const dayKey = typeof dateParam === 'string' ? dateParam : toApiDate(new Date());

  const { data: rooms = [] } = useSmartMeterRooms(bookingId);
  const [deductions, setDeductions] = useState<SmartMeterConsumptionDeduction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDay = useCallback(
    async (isRefresh = false) => {
      if (!bookingId) return;
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      try {
        // API date windows can be timezone-shifted; fetch a padded range then filter locally.
        const response = await getSmartMeterConsumption({
          booking_id: bookingId,
          startDate: shiftApiDate(dayKey, -1),
          endDate: shiftApiDate(dayKey, 1),
        });
        const all = response.success ? response.deductions : [];
        setDeductions(filterDeductionsForDay(all, dayKey));
      } catch {
        setDeductions([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [bookingId, dayKey],
  );

  useEffect(() => {
    void fetchDay();
  }, [fetchDay]);

  const hourlyBuckets = useMemo(() => aggregateUsageByHour(deductions), [deductions]);
  const totals = useMemo(() => sumUsage(deductions), [deductions]);
  const roomBalance = useMemo(
    () => rooms.reduce((sum, room) => sum + (room.currentBalance ?? room.balance ?? 0), 0),
    [rooms],
  );

  const isToday = dayKey === toApiDate(new Date());
  const closingBalance = isToday ? roomBalance : null;
  const openingBalance =
    closingBalance != null ? closingBalance + totals.amount : null;

  return (
    <ProfileStackScreen title="Details" centerTitle style={styles.screenBody}>
      {!bookingId ? (
        <View style={styles.centered}>
          <EmptyState
            compact
            title="No active booking"
            subtitle="Usage details are available once you have a booking."
          />
        </View>
      ) : loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={palette.helloLime} />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scroll,
            { paddingBottom: Math.max(insets.bottom, 16) + 16 },
          ]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => void fetchDay(true)} />
          }>
          <Typography variant="text" size="sm" color={palette.textSecondary}>
            {formatUsageDayTitle(dayKey)}
          </Typography>

          {deductions.length === 0 ? (
            <EmptyState compact title="No usage" subtitle="No consumption recorded for this day." />
          ) : (
            <>
              <SmartMeterUsageChart
                title="Hourly usage"
                buckets={hourlyBuckets}
                showAverage
              />

              <View style={styles.card}>
                <Typography variant="text" size="md" weight="bold" color={palette.textPrimary}>
                  Consumption Breakdown
                </Typography>

                <View style={styles.breakdownRow}>
                  <View style={styles.breakdownCopy}>
                    <Typography variant="text" size="sm" weight="medium" color={palette.textPrimary}>
                      Room Charges
                    </Typography>
                    <Typography variant="label" size="xs" color={palette.textPlaceholder}>
                      {totals.units.toFixed(2)} units consumed
                    </Typography>
                  </View>
                  <Typography variant="text" size="sm" weight="bold" color={palette.textPrimary}>
                    {priceFormatter(totals.amount)}
                  </Typography>
                </View>

                <View style={styles.divider} />

                <View style={styles.breakdownRow}>
                  <Typography variant="text" size="sm" weight="medium" color={palette.textPrimary}>
                    Total Usage
                  </Typography>
                  <Typography variant="text" size="sm" weight="bold" color={palette.error}>
                    {priceFormatter(totals.amount)}
                  </Typography>
                </View>
              </View>

              <View style={styles.card}>
                <Typography variant="text" size="md" weight="bold" color={palette.textPrimary}>
                  Ledger View
                </Typography>

                {openingBalance != null ? (
                  <View style={styles.ledgerRow}>
                    <Typography variant="text" size="sm" color={palette.textLabel}>
                      Opening Balance
                    </Typography>
                    <Typography variant="text" size="sm" weight="medium" color={palette.textPrimary}>
                      {priceFormatter(openingBalance)}
                    </Typography>
                  </View>
                ) : null}

                <View style={styles.ledgerRow}>
                  <Typography variant="text" size="sm" color={palette.helloLime}>
                    Recharge
                  </Typography>
                  <Typography variant="text" size="sm" weight="medium" color={palette.helloLime}>
                    + {priceFormatter(0)}
                  </Typography>
                </View>

                <View style={styles.ledgerRow}>
                  <Typography variant="text" size="sm" color={palette.error}>
                    Consumption
                  </Typography>
                  <Typography variant="text" size="sm" weight="medium" color={palette.error}>
                    - {priceFormatter(totals.amount)}
                  </Typography>
                </View>

                {closingBalance != null ? (
                  <View style={styles.closingBar}>
                    <Typography variant="text" size="sm" weight="medium" color={palette.textPrimary}>
                      Closing Balance
                    </Typography>
                    <Typography variant="text" size="sm" weight="bold" color={palette.textPrimary}>
                      {priceFormatter(closingBalance)}
                    </Typography>
                  </View>
                ) : (
                  <View style={styles.closingBar}>
                    <Typography variant="text" size="sm" weight="medium" color={palette.textPrimary}>
                      Day total
                    </Typography>
                    <Typography variant="text" size="sm" weight="bold" color={palette.textPrimary}>
                      {priceFormatter(totals.amount)}
                    </Typography>
                  </View>
                )}
              </View>
            </>
          )}
        </ScrollView>
      )}
    </ProfileStackScreen>
  );
}

const styles = StyleSheet.create({
  screenBody: {
    paddingHorizontal: 0,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 8,
    gap: 16,
  },
  card: {
    backgroundColor: palette.white,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: palette.gray[200],
    padding: 16,
    gap: 12,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  breakdownCopy: {
    flex: 1,
    gap: 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: palette.gray[200],
  },
  ledgerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  closingBar: {
    marginTop: 4,
    marginHorizontal: -16,
    marginBottom: -16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: palette.surfaceDisabled,
    borderBottomLeftRadius: Radius.md,
    borderBottomRightRadius: Radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
});
