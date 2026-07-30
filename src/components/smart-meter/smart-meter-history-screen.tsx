import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ProfileStackScreen } from '@/components/profile/profile-stack-screen';
import { EmptyState } from '@/components/ui/empty-state';
import { Typography } from '@/components/ui/typography';
import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';
import { useSmartMeterPaymentHistory } from '@/queries/use-smart-meter';
import { useTenantProfile } from '@/stores/tenant-store';
import { priceFormatter } from '@/utils/tenant-format';

function parseAmount(value: string | null | undefined) {
  const amount = Number.parseFloat(value ?? '');
  return Number.isFinite(amount) ? amount : 0;
}

export function SmartMeterHistoryScreen() {
  const insets = useSafeAreaInsets();
  const profile = useTenantProfile();
  const bookingId = profile?.bookingId;
  const { data: history = [], isLoading, isError, refetch, isRefetching } =
    useSmartMeterPaymentHistory(bookingId);

  return (
    <ProfileStackScreen title="Transaction History" centerTitle style={styles.screenBody}>
      {!bookingId ? (
        <View style={styles.centered}>
          <EmptyState
            compact
            title="No active booking"
            subtitle="Transaction history is available once you have a booking."
          />
        </View>
      ) : isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={palette.lime[700]} />
        </View>
      ) : isError || history.length === 0 ? (
        <ScrollView
          contentContainerStyle={styles.emptyScroll}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={() => void refetch()} />
          }>
          <EmptyState
            compact
            title="No transactions yet"
            subtitle="Successful meter recharges will appear here."
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
            Successful smart meter recharges for your booking
          </Typography>

          {history.map((tx) => {
            const isSuccess = tx.status?.toUpperCase() === 'SUCCESS';
            return (
              <View key={tx.id} style={styles.card}>
                <View style={styles.row}>
                  <Typography variant="text" size="md" weight="bold">
                    {priceFormatter(parseAmount(tx.amount))}
                  </Typography>
                  <View
                    style={[styles.statusBadge, isSuccess ? styles.statusSuccess : styles.statusMuted]}>
                    <Typography
                      variant="label"
                      size="xs"
                      weight="medium"
                      color={isSuccess ? palette.lime[800] : palette.gray[700]}>
                      {tx.status}
                    </Typography>
                  </View>
                </View>

                <View style={styles.metaRow}>
                  <Typography variant="text" size="sm" color={palette.gray[500]}>
                    Balance before
                  </Typography>
                  <Typography variant="text" size="sm" weight="medium">
                    {priceFormatter(parseAmount(tx.balance_before))}
                  </Typography>
                </View>

                {tx.balance_after != null ? (
                  <View style={styles.metaRow}>
                    <Typography variant="text" size="sm" color={palette.gray[500]}>
                      Balance after
                    </Typography>
                    <Typography variant="text" size="sm" weight="medium">
                      {priceFormatter(parseAmount(tx.balance_after))}
                    </Typography>
                  </View>
                ) : null}

                {tx.recharge_source ? (
                  <Typography variant="label" size="xs" color={palette.gray[500]}>
                    Source: {tx.recharge_source}
                  </Typography>
                ) : null}
              </View>
            );
          })}
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
  emptyScroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 8,
    gap: 12,
  },
  card: {
    backgroundColor: palette.white,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: palette.gray[200],
    padding: 16,
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  statusBadge: {
    borderRadius: Radius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  statusSuccess: {
    backgroundColor: palette.lime[50],
  },
  statusMuted: {
    backgroundColor: palette.gray[100],
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
});
