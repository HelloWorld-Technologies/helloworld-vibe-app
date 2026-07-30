import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getSmartMeterConsumption } from '@/api/smart-meter';
import { ProfileStackScreen } from '@/components/profile/profile-stack-screen';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Typography } from '@/components/ui/typography';
import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';
import { useSmartMeterRooms } from '@/queries/use-smart-meter';
import { useTenantProfile } from '@/stores/tenant-store';
import type { SmartMeterConsumptionDeduction } from '@/types/smart-meter';
import { formatDisplayDate, priceFormatter } from '@/utils/tenant-format';

function toApiDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

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

function formatDateTime(value?: string) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
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

  function handleChange(event: DateTimePickerEvent, selected?: Date) {
    if (Platform.OS === 'android') setOpen(false);
    if (event.type === 'dismissed') return;
    if (selected) onChange(startOfDay(selected));
  }

  return (
    <View style={styles.dateField}>
      <Typography variant="label" size="xs" color={palette.gray[500]}>
        {label}
      </Typography>
      <Pressable
        style={styles.dateButton}
        onPress={() => setOpen(true)}
        accessibilityRole="button">
        <Typography variant="text" size="sm" weight="medium">
          {formatDisplayDate(value.toISOString())}
        </Typography>
      </Pressable>
      {open ? (
        <>
          <DateTimePicker
            value={value}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            minimumDate={minimumDate}
            maximumDate={maximumDate}
            onChange={handleChange}
          />
          {Platform.OS === 'ios' ? (
            <Button label="Done" variant="outline" onPress={() => setOpen(false)} />
          ) : null}
        </>
      ) : null}
    </View>
  );
}

export function SmartMeterUsageScreen() {
  const insets = useSafeAreaInsets();
  const profile = useTenantProfile();
  const bookingId = profile?.bookingId;
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
    [bookingId, endDate, startDate],
  );

  useEffect(() => {
    if (bookingId) {
      void fetchConsumption();
    }
    // Initial load only; date changes applied via Apply.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId]);

  const sortedDeductions = useMemo(
    () =>
      [...deductions].sort(
        (a, b) => new Date(b.deductionTime).getTime() - new Date(a.deductionTime).getTime(),
      ),
    [deductions],
  );

  const totals = useMemo(
    () =>
      sortedDeductions.reduce(
        (acc, item) => ({
          units: acc.units + (item.units ?? 0),
          amount: acc.amount + (item.amount ?? 0),
        }),
        { units: 0, amount: 0 },
      ),
    [sortedDeductions],
  );

  function getRoomLabel(item: SmartMeterConsumptionDeduction) {
    return (
      item.roomName ||
      (item.aliste_room_id ? roomNameById.get(item.aliste_room_id) : undefined) ||
      item.aliste_room_id ||
      'Room'
    );
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
          <Typography variant="text" size="sm" color={palette.gray[600]}>
            View electricity usage and deductions for your room
          </Typography>

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
            <View style={styles.centeredInline}>
              <ActivityIndicator color={palette.lime[700]} />
            </View>
          ) : sortedDeductions.length === 0 ? (
            <EmptyState compact title="No usage records" subtitle="Try a different date range." />
          ) : (
            <>
              <View style={styles.summaryCard}>
                <View style={styles.summaryItem}>
                  <Typography variant="label" size="xs" color={palette.gray[500]}>
                    Total units
                  </Typography>
                  <Typography variant="text" size="md" weight="bold">
                    {totals.units.toFixed(2)}
                  </Typography>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                  <Typography variant="label" size="xs" color={palette.gray[500]}>
                    Total amount
                  </Typography>
                  <Typography variant="text" size="md" weight="bold">
                    {priceFormatter(totals.amount)}
                  </Typography>
                </View>
              </View>

              {sortedDeductions.map((item, index) => (
                <View
                  key={`${item.aliste_room_id ?? item.roomName}-${item.deductionTime}-${index}`}
                  style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Typography variant="text" size="sm" weight="bold" style={styles.flex}>
                      {getRoomLabel(item)}
                    </Typography>
                    <View style={styles.typeBadge}>
                      <Typography variant="label" size="xs" color={palette.gray[700]}>
                        {item.type}
                      </Typography>
                    </View>
                  </View>
                  <View style={styles.metaRow}>
                    <Typography variant="text" size="sm" color={palette.gray[500]}>
                      Units
                    </Typography>
                    <Typography variant="text" size="sm" weight="medium">
                      {typeof item.units === 'number' ? item.units.toFixed(2) : item.units}
                    </Typography>
                  </View>
                  <View style={styles.metaRow}>
                    <Typography variant="text" size="sm" color={palette.gray[500]}>
                      Amount
                    </Typography>
                    <Typography variant="text" size="sm" weight="bold">
                      {priceFormatter(item.amount)}
                    </Typography>
                  </View>
                  <Typography variant="label" size="xs" color={palette.gray[500]}>
                    {formatDateTime(item.deductionTime)}
                  </Typography>
                  {item.userMessage || item.note ? (
                    <Typography variant="text" size="xs" color={palette.gray[600]}>
                      {item.userMessage || item.note}
                    </Typography>
                  ) : null}
                </View>
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
    paddingVertical: 40,
    alignItems: 'center',
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 8,
    gap: 16,
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
    borderColor: palette.gray[300],
    backgroundColor: palette.gray[50],
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  summaryCard: {
    backgroundColor: palette.white,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: palette.gray[200],
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    gap: 4,
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
    padding: 16,
    gap: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  flex: {
    flex: 1,
  },
  typeBadge: {
    borderRadius: Radius.full,
    backgroundColor: palette.gray[100],
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
});
