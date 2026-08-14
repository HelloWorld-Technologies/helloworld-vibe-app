import { HwSymbol } from '@/components/ui/hw-symbol';
import { Pressable, StyleSheet, View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';
import type { OccupantDetails } from '@/types/booking';

type BookingOccupantSummaryProps = {
  occupant: OccupantDetails;
  onEdit?: () => void;
};

function DetailRow({ label, value }: { label: string; value: string }) {
  if (!value.trim()) return null;

  return (
    <View style={styles.row}>
      <Typography variant="label" size="xs" color={palette.gray[500]}>
        {label}
      </Typography>
      <Typography variant="text" size="sm" weight="medium" color={palette.gray[900]} style={styles.value}>
        {value}
      </Typography>
    </View>
  );
}

export function BookingOccupantSummary({ occupant, onEdit }: BookingOccupantSummaryProps) {
  const fullName = [occupant.firstName, occupant.lastName].filter(Boolean).join(' ').trim();

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Typography variant="text" size="md" weight="bold">
          Occupant details
        </Typography>
        {onEdit ? (
          <Pressable onPress={onEdit} style={styles.editButton} accessibilityRole="button">
            <HwSymbol name="pencil" size={12} tintColor={palette.helloLime} />
            <Typography variant="text" size="xs" weight="bold" color={palette.helloLime}>
              Edit
            </Typography>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.list}>
        <DetailRow label="Name" value={fullName} />
        <DetailRow label="Phone" value={occupant.phone} />
        <DetailRow label="Email" value={occupant.email} />
        <DetailRow label="Gender" value={occupant.gender} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.white,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: palette.gray[200],
    padding: 16,
    gap: 14,
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  list: {
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  value: {
    flex: 1,
    textAlign: 'right',
  },
});
