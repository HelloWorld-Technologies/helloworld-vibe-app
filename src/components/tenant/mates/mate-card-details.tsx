import { StyleSheet, View } from 'react-native';
import { HwSymbol } from '@/components/ui/hw-symbol';
import { Typography } from '@/components/ui/typography';
import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';
import type { RoomMate } from '@/types/roommate';
import { formatMateCreatedAt } from '@/utils/roommate-format';

function DetailRow({
  icon,
  label,
  bold = false,
}: {
  icon: 'person' | 'phone.fill' | 'envelope';
  label: string;
  bold?: boolean;
}) {
  return (
    <View style={styles.detailRow}>
      <HwSymbol name={icon} size={16} tintColor={palette.gray[600]} style={styles.detailIcon} />
      <Typography
        variant="text"
        size={bold ? 'md' : 'sm'}
        weight={bold ? 'bold' : 'regular'}
        color={bold ? palette.gray[900] : palette.gray[600]}
        style={styles.detailLabel}
        numberOfLines={2}>
        {label}
      </Typography>
    </View>
  );
}

export function MateCardDetails({ mate }: { mate: RoomMate }) {
  const email = mate.email?.trim();
  const mobile = mate.mobile?.trim();
  const createdAt = formatMateCreatedAt(mate);

  return (
    <View style={styles.copy}>
      {createdAt ? (
        <View style={styles.dateChip}>
          <Typography variant="label" size="xs" weight="medium" color={palette.gray[700]}>
            {createdAt}
          </Typography>
        </View>
      ) : null}
      <DetailRow icon="person" label={mate.name} bold />
      {mobile ? <DetailRow icon="phone.fill" label={mobile} /> : null}
      {email ? <DetailRow icon="envelope" label={email} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  copy: {
    flex: 1,
    gap: 8,
  },
  dateChip: {
    alignSelf: 'flex-start',
    backgroundColor: palette.gray[100],
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  detailIcon: {
    width: 16,
    height: 16,
  },
  detailLabel: {
    flex: 1,
  },
});
