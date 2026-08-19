import { useRouter } from 'expo-router';
import { HwSymbol } from '@/components/ui/hw-symbol';
import type { PlatformSymbolName } from '@/constants/symbols';
import { Pressable, StyleSheet, View } from 'react-native';

import { getSmartMeterBalance, resolveSmartMeterBookingId } from '@/api/smart-meter';
import { DashboardSmartMeterSkeleton } from '@/components/skeleton';
import { DashboardSectionHeader } from '@/components/tenant/dashboard/dashboard-section-header';
import { Typography } from '@/components/ui/typography';
import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';
import { useIsTablet } from '@/hooks/use-is-tablet';
import { useSmartMeterRooms } from '@/queries/use-smart-meter';
import { useTenantProfile } from '@/stores/tenant-store';
import { priceFormatter } from '@/utils/tenant-format';

type SmartMeterAction = {
  id: 'recharge' | 'usage' | 'history';
  label: string;
  icon: PlatformSymbolName;
  route: '/smart-meter-recharge' | '/smart-meter-usage' | '/smart-meter-history';
};

const ACTIONS: SmartMeterAction[] = [
  {
    id: 'recharge',
    label: 'Recharge',
    icon: { ios: 'bolt.fill', android: 'bolt', web: 'bolt' },
    route: '/smart-meter-recharge',
  },
  {
    id: 'usage',
    label: 'Usage',
    icon: { ios: 'chart.bar.fill', android: 'bar_chart', web: 'bar_chart' },
    route: '/smart-meter-usage',
  },
  {
    id: 'history',
    label: 'History',
    icon: { ios: 'clock.arrow.circlepath', android: 'history', web: 'history' },
    route: '/smart-meter-history',
  },
];

const BALANCE_ICON: PlatformSymbolName = {
  ios: 'bolt.fill',
  android: 'bolt',
  web: 'bolt',
};

export function DashboardSmartMeterCard() {
  const router = useRouter();
  const isTablet = useIsTablet();
  const profile = useTenantProfile();
  const bookingId = resolveSmartMeterBookingId(profile?.bookingId);
  const { data: rooms, isPending } = useSmartMeterRooms(bookingId);
  const roomList = rooms ?? [];
  const balance = roomList.length > 0 ? getSmartMeterBalance(roomList) : null;
  const showSkeleton = Boolean(bookingId) && isPending;

  return (
    <View style={styles.section}>
      <DashboardSectionHeader title="Smart Meter" subtitle="Electricity prepaid balance" />

      {showSkeleton ? (
        <DashboardSmartMeterSkeleton isTablet={isTablet} />
      ) : (
        <View style={[styles.card, isTablet ? styles.cardTablet : null]}>
          <View style={styles.balanceRow}>
            <View style={styles.balanceCopy}>
              <Typography variant="label" size="xs" color={palette.gray[500]}>
                Balance
              </Typography>
              <Typography variant="display" size="xs" weight="bold" color={palette.gray[900]}>
                {balance != null ? priceFormatter(balance) : '—'}
              </Typography>
            </View>
            <View style={styles.flashBadge}>
              <HwSymbol name={BALANCE_ICON} size={20} tintColor={palette.lime[700]} />
            </View>
          </View>

          <View style={[styles.actionsRow, isTablet ? styles.actionsRowTablet : null]}>
            {ACTIONS.map((action) => (
              <Pressable
                key={action.id}
                style={[styles.actionTile, isTablet ? styles.actionTileTablet : null]}
                onPress={() => router.push(action.route)}
                accessibilityRole="button"
                accessibilityLabel={action.label}>
                <View style={styles.actionIcon}>
                  <HwSymbol name={action.icon} size={18} tintColor={palette.blue[800]} />
                </View>
                <Typography variant="label" size="xs" weight="medium" color={palette.gray[800]}>
                  {action.label}
                </Typography>
              </Pressable>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 12,
  },
  card: {
    backgroundColor: palette.white,
    borderRadius: Radius.md,
    padding: 16,
    gap: 16,
    borderWidth: 1,
    borderColor: palette.gray[200],
    shadowColor: '#0A0D12',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTablet: {
    padding: 20,
    gap: 20,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  balanceCopy: {
    flex: 1,
    gap: 4,
  },
  flashBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: palette.lime[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionsRowTablet: {
    gap: 12,
  },
  actionTile: {
    flex: 1,
    minHeight: 72,
    borderRadius: Radius.sm,
    backgroundColor: palette.blue[50],
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 4,
    paddingVertical: 10,
  },
  actionTileTablet: {
    minHeight: 84,
    paddingVertical: 14,
  },
  actionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: palette.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
