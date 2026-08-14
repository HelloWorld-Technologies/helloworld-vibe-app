import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getSmartMeterConsumption, resolveSmartMeterBookingId } from '@/api/smart-meter';
import { ProfileStackScreen } from '@/components/profile/profile-stack-screen';
import { SmartMeterUsageChart } from '@/components/smart-meter/smart-meter-usage-chart';
import { PaymentListSkeleton } from '@/components/skeleton';
import { Button } from '@/components/ui/button';
import { CalendarPickerModal } from '@/components/ui/calendar-picker-modal';
import { EmptyState } from '@/components/ui/empty-state';
import { HwSymbol } from '@/components/ui/hw-symbol';
import { Typography } from '@/components/ui/typography';
import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';
import { useSmartMeterRooms } from '@/queries/use-smart-meter';
import { useTenantProfile } from '@/stores/tenant-store';
import type { SmartMeterConsumptionDeduction } from '@/types/smart-meter';
import {
  aggregateUsageByDay,
  filterDeductionsForDay,
  formatUsageDayLabel,
  formatUsageDayTitle,
  toApiDate,
  type UsageBucket,
} from '@/utils/smart-meter-usage';
import { formatDisplayDate, priceFormatter } from '@/utils/tenant-format';

function startOfDay(date: Date) {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
}

function parseMoveInDate(moveInDate?: string) {
  if (!moveInDate) return null;
  const parsed = startOfDay(new Date(moveInDate));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getDefaultStartDate(moveInDate: Date | null) {
  const date = new Date();
  date.setDate(date.getDate() - 30);
  const defaultStart = startOfDay(date);
  if (moveInDate && defaultStart < moveInDate) return moveInDate;
  return defaultStart;
}

type DateFieldProps = {
  label: string;
  value: Date;
  minimumDate?: Date;
  maximumDate?: Date;
  onChange: (date: Date) => void;
};

function DateField({ label, value, minimumDate, maximumDate, onChange }: DateFieldProps) {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.dateField}>
      <Typography variant="label" size="xs" color={palette.textPlaceholder}>
        {label}
      </Typography>
      <Pressable
        style={styles.dateButton}
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`Select ${label.toLowerCase()} date`}>
        <Typography variant="text" size="sm" weight="medium" color={palette.textPrimary}>
          {formatDisplayDate(value.toISOString())}
        </Typography>
      </Pressable>
      <CalendarPickerModal
        visible={open}
        value={value}
        minDate={minimumDate}
        maxDate={maximumDate}
        onClose={() => setOpen(false)}
        onApply={(date) => onChange(startOfDay(date))}
      />
    </View>
  );
}

export function SmartMeterUsageScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const profile = useTenantProfile();
  const bookingId = resolveSmartMeterBookingId(profile?.bookingId);
  const { data: rooms = [] } = useSmartMeterRooms(bookingId);

  const moveInDate = useMemo(
    () => parseMoveInDate(profile?.propertyInfo?.moveInDate),
    [profile?.propertyInfo?.moveInDate],
  );
  const today = useMemo(() => startOfDay(new Date()), []);

  const [startDate, setStartDate] = useState(() => getDefaultStartDate(moveInDate));
  const [endDate, setEndDate] = useState(() => startOfDay(new Date()));
  const [deductions, setDeductions] = useState<SmartMeterConsumptionDeduction[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    const clampToRange = (date: Date) => {
      let next = date;
      if (moveInDate && next < moveInDate) next = moveInDate;
      if (next > today) next = today;
      return next;
    };

    setStartDate((prev) => clampToRange(prev));
    setEndDate((prev) => clampToRange(prev));
  }, [moveInDate, today]);

  const roomNameById = useMemo(() => {
    const map = new Map<string, string>();
    rooms.forEach((room) => {
      map.set(room.id, room.physical_id ?? room.name);
    });
    return map;
  }, [rooms]);

  const fetchConsumption = useCallback(
    async (isRefresh = false) => {
      if (!bookingId) return;

      if (startDate > endDate) {
        Alert.alert('Invalid date range', 'Start date must be before end date.');
        return;
      }

      if (moveInDate && startDate < moveInDate) {
        Alert.alert(
          'Invalid date range',
          `Start date cannot be before your move-in date (${formatDisplayDate(moveInDate.toISOString())}).`,
        );
        return;
      }

      if (endDate > today) {
        Alert.alert('Invalid date range', 'End date cannot be after today.');
        return;
      }

      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      try {
        const response = await getSmartMeterConsumption({
          booking_id: bookingId,
          startDate: toApiDate(startDate),
          endDate: toApiDate(endDate),
        });

        if (response.success) {
          setDeductions(response.deductions);
        } else {
          setDeductions([]);
          Alert.alert('Unable to load usage', response.message ?? 'Please try again.');
        }
      } catch {
        setDeductions([]);
        Alert.alert('Error', 'Something went wrong. Please try again.');
      } finally {
        setLoading(false);
        setRefreshing(false);
        setHasFetched(true);
      }
    },
    [bookingId, endDate, moveInDate, startDate, today],
  );

  useEffect(() => {
    if (bookingId) {
      void fetchConsumption();
    }
    // Initial load only; date changes applied via Apply.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId]);

  const dayBuckets = useMemo(() => aggregateUsageByDay(deductions), [deductions]);

  const dayGroups = useMemo(
    () =>
      [...dayBuckets].sort((a, b) => b.key.localeCompare(a.key)).map((bucket) => {
        const items = filterDeductionsForDay(deductions, bucket.key);
        const roomLabels = [
          ...new Set(
            items.map(
              (item) =>
                item.roomName ||
                (item.aliste_room_id ? roomNameById.get(item.aliste_room_id) : undefined) ||
                item.aliste_room_id ||
                'Room',
            ),
          ),
        ];
        return {
          ...bucket,
          roomLabel: roomLabels.filter(Boolean).join(', ') || 'Room',
        };
      }),
    [dayBuckets, deductions, roomNameById],
  );

  const totals = useMemo(
    () =>
      dayBuckets.reduce(
        (acc, item) => ({
          units: acc.units + item.units,
          amount: acc.amount + item.amount,
        }),
        { units: 0, amount: 0 },
      ),
    [dayBuckets],
  );

  function openDayDetails(bucket: UsageBucket) {
    if (!bucket.key || bucket.key === 'unknown') return;
    router.push({
      pathname: '/smart-meter-usage-details',
      params: { date: bucket.key },
    });
  }

  return (
    <ProfileStackScreen title="Usage" centerTitle style={styles.screenBody}>
      {!bookingId ? (
        <View style={styles.centered}>
          <EmptyState
            compact
            title="No active booking"
            subtitle="Usage history is available once you have a booking."
          />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scroll,
            { paddingBottom: Math.max(insets.bottom, 16) + 16 },
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void fetchConsumption(true)}
            />
          }>
          <View style={styles.filterCard}>
            <Typography variant="text" size="md" weight="bold">
              Date range
            </Typography>
            <View style={styles.dateRow}>
              <DateField
                label="From"
                value={startDate}
                minimumDate={moveInDate ?? undefined}
                maximumDate={endDate < today ? endDate : today}
                onChange={setStartDate}
              />
              <DateField
                label="To"
                value={endDate}
                minimumDate={moveInDate && moveInDate > startDate ? moveInDate : startDate}
                maximumDate={today}
                onChange={setEndDate}
              />
            </View>
            <Button
              label="Apply"
              onPress={() => void fetchConsumption()}
              loading={loading && !refreshing}
              disabled={loading}
            />
          </View>

          {loading && !hasFetched ? (
            <PaymentListSkeleton style={styles.centeredInline} />
          ) : dayGroups.length === 0 ? (
            <EmptyState compact title="No usage records" subtitle="Try a different date range." />
          ) : (
            <>
              <View style={styles.summaryCard}>
                <View style={styles.summaryItem}>
                  <Typography variant="label" size="xs" color={palette.textPlaceholder}>
                    Total units
                  </Typography>
                  <Typography variant="text" size="md" weight="bold" color={palette.textPrimary}>
                    {totals.units.toFixed(2)}
                  </Typography>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                  <Typography variant="label" size="xs" color={palette.textPlaceholder}>
                    Total amount
                  </Typography>
                  <Typography variant="text" size="md" weight="bold" color={palette.textPrimary}>
                    {priceFormatter(totals.amount)}
                  </Typography>
                </View>
              </View>

              <SmartMeterUsageChart
                title="Daily usage"
                buckets={dayBuckets}
                showAverage
                onBarPress={openDayDetails}
              />

              {dayGroups.map((group) => (
                <Pressable
                  key={group.key}
                  style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
                  onPress={() => openDayDetails(group)}
                  accessibilityRole="button"
                  accessibilityLabel={`Open usage details for ${formatUsageDayTitle(group.key)}`}>
                  <View style={styles.cardMain}>
                    <View style={styles.cardCopy}>
                      <Typography variant="text" size="sm" weight="bold" color={palette.textPrimary}>
                        {group.roomLabel}
                      </Typography>
                      <Typography variant="label" size="xs" color={palette.textPlaceholder}>
                        {formatUsageDayLabel(group.key)}
                      </Typography>
                    </View>
                    <View style={styles.cardValues}>
                      <Typography variant="text" size="sm" weight="medium" color={palette.textPrimary}>
                        {group.units.toFixed(2)} units
                      </Typography>
                      <Typography variant="text" size="sm" weight="bold" color={palette.textPrimary}>
                        {priceFormatter(group.amount)}
                      </Typography>
                    </View>
                  </View>
                  <HwSymbol
                    name="chevron.right"
                    size={14}
                    weight="semibold"
                    tintColor={palette.gray[400]}
                  />
                </Pressable>
              ))}
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
  centeredInline: {
    marginTop: 8,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 8,
    gap: 12,
  },
  filterCard: {
    backgroundColor: palette.white,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: palette.gray[200],
    padding: 16,
    gap: 12,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateField: {
    flex: 1,
    gap: 6,
  },
  dateButton: {
    minHeight: 44,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: palette.borderDefault,
    backgroundColor: palette.gray[50],
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  summaryCard: {
    backgroundColor: palette.white,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: palette.gray[200],
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    gap: 2,
  },
  summaryDivider: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: palette.gray[200],
    marginHorizontal: 12,
  },
  card: {
    backgroundColor: palette.white,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: palette.gray[200],
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cardPressed: {
    backgroundColor: palette.gray[50],
  },
  cardMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  cardCopy: {
    flexShrink: 1,
    gap: 2,
  },
  cardValues: {
    alignItems: 'flex-end',
    gap: 2,
  },
});
