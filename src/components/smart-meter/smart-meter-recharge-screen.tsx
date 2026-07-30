import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { rechargeSmartMeter } from '@/api/smart-meter';
import { ProfileStackScreen } from '@/components/profile/profile-stack-screen';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { TextField } from '@/components/ui/text-field';
import { Typography } from '@/components/ui/typography';
import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';
import { queryKeys } from '@/queries/keys';
import { useSmartMeterRooms } from '@/queries/use-smart-meter';
import { useTenantProfile } from '@/stores/tenant-store';
import type { SmartMeterRoom } from '@/types/smart-meter';
import { priceFormatter } from '@/utils/tenant-format';

export function SmartMeterRechargeScreen() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const profile = useTenantProfile();
  const bookingId = profile?.bookingId;
  const propertyId = profile?.propertyInfo?.propertyId;

  const { data: rooms = [], isLoading, isError, refetch, isRefetching } =
    useSmartMeterRooms(bookingId);

  const [selectedRoom, setSelectedRoom] = useState<SmartMeterRoom | null>(null);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function openRecharge(room: SmartMeterRoom) {
    setSelectedRoom(room);
    setAmount(String(room.minRecharge || 100));
    setNote('');
  }

  function closeRecharge() {
    setSelectedRoom(null);
    setAmount('');
    setNote('');
  }

  async function handleRecharge() {
    if (!selectedRoom || !bookingId || !propertyId) {
      Alert.alert('Unable to recharge', 'Missing booking or property details.');
      return;
    }

    const parsedAmount = Number.parseInt(amount, 10);
    const minRecharge = selectedRoom.minRecharge ?? 100;
    if (!Number.isFinite(parsedAmount) || parsedAmount < minRecharge) {
      Alert.alert('Invalid amount', `Minimum recharge is ${priceFormatter(minRecharge)}`);
      return;
    }

    setSubmitting(true);
    try {
      const response = await rechargeSmartMeter({
        aliste_room_id: selectedRoom.id,
        property_id: propertyId,
        amount: parsedAmount,
        booking_id: bookingId,
        note: note.trim() || undefined,
        is_short_stay: false,
      });

      const paymentLink = response.data?.data?.paymentLink;
      if (response.success && paymentLink) {
        closeRecharge();
        await Linking.openURL(paymentLink);
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: queryKeys.smartMeterRooms(bookingId) }),
          queryClient.invalidateQueries({
            queryKey: queryKeys.smartMeterPaymentHistory(bookingId),
          }),
        ]);
        return;
      }

      Alert.alert('Recharge failed', response.message ?? 'Could not create payment link.');
    } catch {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ProfileStackScreen title="Recharge Meter" centerTitle style={styles.screenBody}>
      {!bookingId ? (
        <View style={styles.centered}>
          <EmptyState
            compact
            title="No active booking"
            subtitle="Smart meter recharge is available once you have a booking."
          />
        </View>
      ) : isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={palette.lime[700]} />
        </View>
      ) : isError || rooms.length === 0 ? (
        <ScrollView
          contentContainerStyle={styles.emptyScroll}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={() => void refetch()} />
          }>
          <EmptyState
            compact
            title="No meter linked"
            subtitle="No electricity meter is linked to your room yet. Pull to refresh."
            actionLabel="Retry"
            onAction={() => void refetch()}
          />
        </ScrollView>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scroll,
            { paddingBottom: Math.max(insets.bottom, 16) + 16 },
          ]}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={() => void refetch()} />
          }>
          <Typography variant="text" size="sm" color={palette.gray[600]}>
            View balance and recharge your room meter
          </Typography>

          {rooms.map((room) => (
            <View key={room.id} style={styles.roomCard}>
              <View style={styles.roomHeader}>
                <Typography variant="text" size="md" weight="bold" style={styles.roomName}>
                  {room.physical_id ?? room.name}
                </Typography>
                {room.blocked ? (
                  <View style={styles.blockedBadge}>
                    <Typography variant="label" size="xs" weight="medium" color={palette.red[800]}>
                      Blocked
                    </Typography>
                  </View>
                ) : null}
              </View>

              <View style={styles.metaRow}>
                <Typography variant="text" size="sm" color={palette.gray[500]}>
                  Current balance
                </Typography>
                <Typography variant="text" size="sm" weight="bold">
                  {priceFormatter(room.currentBalance ?? room.balance)}
                </Typography>
              </View>
              <View style={styles.metaRow}>
                <Typography variant="text" size="sm" color={palette.gray[500]}>
                  Min recharge
                </Typography>
                <Typography variant="text" size="sm" weight="medium">
                  {priceFormatter(room.minRecharge)}
                </Typography>
              </View>

              {!room.blocked ? (
                <Button label="Recharge meter" onPress={() => openRecharge(room)} />
              ) : null}
            </View>
          ))}
        </ScrollView>
      )}

      <BottomSheet visible={selectedRoom != null} onClose={closeRecharge}>
        <View style={[styles.sheetContent, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
          <Typography variant="text" size="xl" weight="bold">
            Recharge meter
          </Typography>
          <Typography variant="text" size="sm" color={palette.gray[600]}>
            {selectedRoom?.physical_id ?? selectedRoom?.name}
          </Typography>

          <TextField
            label="Amount"
            value={amount}
            onChangeText={setAmount}
            keyboardType="number-pad"
            placeholder={`Min ${selectedRoom?.minRecharge ?? 100}`}
          />
          <TextField
            label="Note (optional)"
            value={note}
            onChangeText={setNote}
            placeholder="Add a note"
          />

          <Button
            label="Continue to payment"
            onPress={() => void handleRecharge()}
            loading={submitting}
            disabled={submitting}
          />
        </View>
      </BottomSheet>
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
  emptyScroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 8,
    gap: 16,
  },
  roomCard: {
    backgroundColor: palette.white,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: palette.gray[200],
    padding: 16,
    gap: 12,
  },
  roomHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  roomName: {
    flex: 1,
  },
  blockedBadge: {
    borderRadius: Radius.full,
    backgroundColor: palette.red[100],
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  sheetContent: {
    gap: 14,
    paddingHorizontal: 24,
    paddingTop: 8,
  },
});
