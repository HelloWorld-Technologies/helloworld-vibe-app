import { StyleSheet, View } from 'react-native';
import { HwSymbol } from '@/components/ui/hw-symbol';
import { EmptyState } from '@/components/ui/empty-state';
import { Typography } from '@/components/ui/typography';
import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';
import type { ReferralLog } from '@/types/referral';
import { formatDisplayDate, priceFormatter } from '@/utils/tenant-format';

type PointsHistorySectionProps = {
  logs: ReferralLog[];
};

function getLogTitle(log: ReferralLog) {
  if (log.description) return log.description;
  if (log.title) return log.title;
  if (log.remark) return log.remark;
  if (log.refereeName) return `Referral • ${log.refereeName} moved in`;
  return log.actionType === 'credit' ? 'Referral' : 'Applied to rent';
}

function PointsHistoryRow({ log }: { log: ReferralLog }) {
  const isCredit = log.actionType === 'credit';
  const status = log.status ?? (isCredit ? 'Credited' : 'Redeemed');
  const amountColor = isCredit ? palette.lime[700] : palette.red[600];
  const iconBg = isCredit ? palette.lime[50] : palette.red[50];
  const iconName = isCredit ? 'arrow.down.left' : 'arrow.up.right';

  return (
    <View style={styles.row}>
      <View style={[styles.iconWrap, { backgroundColor: iconBg }]}>
        <HwSymbol name={iconName} size={14} tintColor={amountColor} />
      </View>

      <View style={styles.copy}>
        <Typography variant="text" size="sm" weight="medium" numberOfLines={2}>
          {getLogTitle(log)}
        </Typography>
        <Typography variant="label" size="xs" color={palette.gray[500]}>
          {formatDisplayDate(log.date)}
        </Typography>
      </View>

      <View style={styles.amountBlock}>
        <Typography variant="text" size="sm" weight="bold" color={amountColor}>
          {isCredit ? '+' : '-'}
          {priceFormatter(log.amount)}
        </Typography>
        <Typography variant="label" size="xs" color={amountColor}>
          {status}
        </Typography>
      </View>
    </View>
  );
}

export function PointsHistorySection({ logs }: PointsHistorySectionProps) {
  return (
    <View style={styles.section}>
      <Typography variant="text" size="lg" weight="bold">
        Points History
      </Typography>

      <View style={styles.card}>
        {logs.length > 0 ? (
          logs.map((log, index) => (
            <View key={log.refId}>
              <PointsHistoryRow log={log} />
              {index < logs.length - 1 ? <View style={styles.divider} /> : null}
            </View>
          ))
        ) : (
          <EmptyState compact title="No referral history yet" />
        )}
      </View>
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
    paddingHorizontal: 16,
    paddingVertical: 4,
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  amountBlock: {
    alignItems: 'flex-end',
    gap: 4,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: palette.gray[200],
  },
});
